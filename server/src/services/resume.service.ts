import { prisma } from '../config/prisma.js';
import { getStorageService } from './storage/index.js';
import { getAiResumeParser } from './ai/index.js';
import { PdfExtractor } from '../utils/pdfExtractor.js';
import {
  candidateProfileParsedSchema,
  ParsedCandidateProfile,
} from '../validations/resumeParser.schema.js';
import { ApiError } from '../utils/apiError.js';
import { UserRole, Prisma } from '@prisma/client';

export interface UploadResumeOptions {
  setPrimary?: boolean;
}

export class ResumeService {
  private storage = getStorageService();

  /**
   * Upload and register a new candidate resume with automatic versioning.
   */
  async uploadResume(
    candidateId: string,
    file: Express.Multer.File,
    options: UploadResumeOptions = {}
  ) {
    // 1. Determine next version number for this candidate
    const existingResumes = await prisma.resume.findMany({
      where: { candidateId },
      orderBy: { version: 'desc' },
      select: { id: true, version: true, isPrimary: true },
    });

    const nextVersion = existingResumes.length > 0 ? existingResumes[0].version + 1 : 1;
    const shouldBePrimary = options.setPrimary || existingResumes.length === 0;

    // 2. Upload file to secure storage abstraction
    const uploadResult = await this.storage.uploadFile({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      subfolder: 'resumes',
    });

    // 3. Save resume in DB with versioning & transaction if updating primary
    const uploadedResume = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (shouldBePrimary && existingResumes.length > 0) {
        await tx.resume.updateMany({
          where: { candidateId, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      const newResume = await tx.resume.create({
        data: {
          candidateId,
          fileName: uploadResult.fileName,
          storageKey: uploadResult.storageKey,
          fileSize: uploadResult.fileSize,
          mimeType: uploadResult.mimeType,
          version: nextVersion,
          isPrimary: shouldBePrimary,
          parsingStatus: 'PENDING',
        },
      });

      return newResume;
    });

    // Automatically trigger AI parsing in background so structured profile is created immediately
    this.parseResume(uploadedResume.id, { id: candidateId, role: UserRole.CANDIDATE }).catch((err) => {
      console.warn(`[ResumeService] Background parsing deferred for ${uploadedResume.id}:`, err.message);
    });

    return uploadedResume;
  }

  /**
   * Retrieve all resumes belonging to a candidate.
   */
  async getUserResumes(candidateId: string) {
    return prisma.resume.findMany({
      where: { candidateId },
      orderBy: [{ isPrimary: 'desc' }, { version: 'desc' }],
    });
  }

  /**
   * Get resume metadata with strict authorization check.
   */
  async getResumeById(resumeId: string, requester: { id: string; role: string }) {
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      include: {
        candidate: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!resume) {
      throw ApiError.notFound('Resume not found.');
    }

    // Access control:
    // 1. Candidate can only access their own resumes
    if (requester.role === UserRole.CANDIDATE && resume.candidateId !== requester.id) {
      throw ApiError.forbidden('You do not have permission to view this resume.');
    }

    // 2. Recruiter can only view resumes of candidates who applied to their jobs
    if (requester.role === UserRole.RECRUITER) {
      const applicationWithRecruiter = await prisma.application.findFirst({
        where: {
          candidateId: resume.candidateId,
          job: { recruiterId: requester.id },
        },
      });

      if (!applicationWithRecruiter) {
        throw ApiError.forbidden('You do not have permission to access this candidate resume.');
      }
    }

    return resume;
  }

  /**
   * Retrieve file stream and metadata for secure streaming.
   */
  async getResumeFileStream(resumeId: string, requester: { id: string; role: string }) {
    const resume = await this.getResumeById(resumeId, requester);
    const stream = await this.storage.getFileStream(resume.storageKey);

    return {
      stream,
      resume,
    };
  }

  /**
   * Set a specific resume version as primary for the candidate.
   */
  async setPrimaryResume(resumeId: string, candidateId: string) {
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      throw ApiError.notFound('Resume not found.');
    }

    if (resume.candidateId !== candidateId) {
      throw ApiError.forbidden('You can only update your own resumes.');
    }

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Demote all candidate's resumes
      await tx.resume.updateMany({
        where: { candidateId, isPrimary: true },
        data: { isPrimary: false },
      });

      // Promote target resume
      return tx.resume.update({
        where: { id: resumeId },
        data: { isPrimary: true },
      });
    });
  }

  /**
   * Delete a resume from database and storage.
   */
  async deleteResume(resumeId: string, candidateId: string) {
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
    });

    if (!resume) {
      throw ApiError.notFound('Resume not found.');
    }

    if (resume.candidateId !== candidateId) {
      throw ApiError.forbidden('You can only delete your own resumes.');
    }

    // Perform DB delete and promote latest remaining if deleted was primary
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.resume.delete({
        where: { id: resumeId },
      });

      if (resume.isPrimary) {
        const latestRemaining = await tx.resume.findFirst({
          where: { candidateId },
          orderBy: { version: 'desc' },
        });

        if (latestRemaining) {
          await tx.resume.update({
            where: { id: latestRemaining.id },
            data: { isPrimary: true },
          });
        }
      }
    });

    // Clean up physical file in storage
    try {
      await this.storage.deleteFile(resume.storageKey);
    } catch (err) {
      console.warn(`[ResumeService] Could not delete physical file ${resume.storageKey}:`, err);
    }

    return { message: 'Resume deleted successfully.' };
  }

  /**
   * Parse resume with AI, validate response via Zod, and normalize into PostgreSQL.
   */
  async parseResume(resumeId: string, requester: { id: string; role: string }) {
    const resume = await this.getResumeById(resumeId, requester);

    // 1. Update status to PROCESSING
    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        parsingStatus: 'PROCESSING',
        parsingError: null,
      },
    });

    try {
      // 2. Read file buffer from storage
      const fileBuffer = await this.storage.getFileBuffer(resume.storageKey);

      // 3. Extract text from PDF
      const extractedText = await PdfExtractor.extractText(fileBuffer);

      // 4. Send to AI Resume Parser
      const aiParser = getAiResumeParser();
      const rawAiResult = await aiParser.parseResumeText(extractedText, {
        fileName: resume.fileName,
        candidateId: resume.candidateId,
      });

      // 5. Strict Zero-Trust Validation via Zod
      const validatedData: ParsedCandidateProfile = candidateProfileParsedSchema.parse(rawAiResult);

      // 6. Normalized Transaction Persistence
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // A. Update Resume model with parsed JSON & COMPLETED status
        const updatedResume = await tx.resume.update({
          where: { id: resumeId },
          data: {
            parsingStatus: 'COMPLETED',
            parsingError: null,
            parsedData: validatedData as unknown as Prisma.InputJsonValue,
          },
        });

        // B. Upsert CandidateProfile entity
        const profile = await tx.candidateProfile.upsert({
          where: { userId: resume.candidateId },
          create: {
            userId: resume.candidateId,
            rawResumeId: resume.id,
            fullName: validatedData.fullName,
            email: validatedData.email || null,
            phone: validatedData.phone || null,
            location: validatedData.location || null,
            headline: validatedData.headline || null,
            summary: validatedData.summary || null,
            yearsOfExperience: validatedData.yearsOfExperience || 0,
            certifications: validatedData.certifications || [],
            achievements: validatedData.achievements || [],
          },
          update: {
            rawResumeId: resume.id,
            fullName: validatedData.fullName,
            email: validatedData.email || null,
            phone: validatedData.phone || null,
            location: validatedData.location || null,
            headline: validatedData.headline || null,
            summary: validatedData.summary || null,
            yearsOfExperience: validatedData.yearsOfExperience || 0,
            certifications: validatedData.certifications || [],
            achievements: validatedData.achievements || [],
          },
        });

        // C. Clean & sync normalized child tables
        await tx.workExperience.deleteMany({ where: { profileId: profile.id } });
        await tx.educationRecord.deleteMany({ where: { profileId: profile.id } });
        await tx.candidateSkill.deleteMany({ where: { profileId: profile.id } });
        await tx.candidateProject.deleteMany({ where: { profileId: profile.id } });

        // D. Create Work Experiences
        if (validatedData.workExperience && validatedData.workExperience.length > 0) {
          await tx.workExperience.createMany({
            data: validatedData.workExperience.map((exp) => ({
              profileId: profile.id,
              company: exp.company,
              position: exp.position,
              startDate: exp.startDate || null,
              endDate: exp.endDate || null,
              isCurrent: Boolean(exp.isCurrent),
              description: exp.description || null,
              technologies: exp.technologies || [],
            })),
          });
        }

        // E. Create Education Records
        if (validatedData.education && validatedData.education.length > 0) {
          await tx.educationRecord.createMany({
            data: validatedData.education.map((edu) => ({
              profileId: profile.id,
              institution: edu.institution,
              degree: edu.degree,
              fieldOfStudy: edu.fieldOfStudy || null,
              startDate: edu.startDate || null,
              endDate: edu.endDate || null,
              grade: edu.grade || null,
            })),
          });
        }

        // F. Create Categorized Candidate Skills
        const skillsToInsert: Array<{ profileId: string; name: string; category: string }> = [];

        validatedData.skills.languages?.forEach((s) =>
          skillsToInsert.push({ profileId: profile.id, name: s, category: 'LANGUAGE' })
        );
        validatedData.skills.frameworks?.forEach((s) =>
          skillsToInsert.push({ profileId: profile.id, name: s, category: 'FRAMEWORK' })
        );
        validatedData.skills.databases?.forEach((s) =>
          skillsToInsert.push({ profileId: profile.id, name: s, category: 'DATABASE' })
        );
        validatedData.skills.tools?.forEach((s) =>
          skillsToInsert.push({ profileId: profile.id, name: s, category: 'TOOL' })
        );
        validatedData.skills.other?.forEach((s) =>
          skillsToInsert.push({ profileId: profile.id, name: s, category: 'OTHER' })
        );

        if (skillsToInsert.length > 0) {
          await tx.candidateSkill.createMany({
            data: skillsToInsert,
          });
        }

        // G. Create Candidate Projects
        if (validatedData.projects && validatedData.projects.length > 0) {
          await tx.candidateProject.createMany({
            data: validatedData.projects.map((proj) => ({
              profileId: profile.id,
              title: proj.title,
              description: proj.description || null,
              technologies: proj.technologies || [],
              url: proj.url || null,
              highlights: proj.highlights || [],
            })),
          });
        }

        // H. Sync User headline/phone/bio if empty
        await tx.user.update({
          where: { id: resume.candidateId },
          data: {
            headline: validatedData.headline || undefined,
            bio: validatedData.summary || undefined,
            phone: validatedData.phone || undefined,
          },
        });

        return {
          resume: updatedResume,
          profileId: profile.id,
          parsedData: validatedData,
        };
      });

      return result;
    } catch (err: any) {
      console.error(`[ResumeService] Parsing failed for resume ${resumeId}:`, err);
      // Mark as FAILED for retry safety
      await prisma.resume.update({
        where: { id: resumeId },
        data: {
          parsingStatus: 'FAILED',
          parsingError: err.message || 'Unknown parsing failure',
        },
      });

      throw ApiError.badRequest(`AI Resume Parsing failed: ${err.message}`);
    }
  }

  /**
   * Get structured candidate profile with normalized relations.
   */
  async getCandidateProfile(candidateId: string, requester: { id: string; role: string }) {
    // 1. Authorization check
    if (requester.role === UserRole.CANDIDATE && requester.id !== candidateId) {
      throw ApiError.forbidden('You can only view your own candidate profile.');
    }

    // 2. Fetch profile with all relations
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: candidateId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatar: true, headline: true, bio: true, phone: true },
        },
        rawResume: {
          select: { id: true, fileName: true, version: true, parsingStatus: true, createdAt: true },
        },
        workExperiences: {
          orderBy: { startDate: 'desc' },
        },
        educations: {
          orderBy: { startDate: 'desc' },
        },
        skills: {
          orderBy: { name: 'asc' },
        },
        projects: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!profile) {
      // If no profile created yet, fallback to basic user details
      const user = await prisma.user.findUnique({
        where: { id: candidateId },
        select: { id: true, name: true, email: true, headline: true, bio: true, phone: true, avatar: true },
      });

      if (!user) {
        throw ApiError.notFound('Candidate not found.');
      }

      return {
        id: null,
        userId: user.id,
        user,
        fullName: user.name,
        email: user.email,
        phone: user.phone,
        headline: user.headline,
        summary: user.bio,
        yearsOfExperience: 0,
        certifications: [],
        achievements: [],
        workExperiences: [],
        educations: [],
        skills: [],
        projects: [],
      };
    }

    return profile;
  }
}

export const resumeService = new ResumeService();
