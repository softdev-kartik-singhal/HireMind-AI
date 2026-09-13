import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { getAiJobMatcher } from './ai/index.js';
import {
  CandidateMatchInput,
  JobMatchInput,
} from './ai/jobMatcher.interface.js';
import { resumeService } from './resume.service.js';

export interface GetMatchOptions {
  forceRefresh?: boolean;
}

export class JobMatchService {
  /**
   * Get existing cached match analysis or run AI matching engine if not yet analyzed (or if forceRefresh requested).
   */
  static async getOrCalculateMatch(
    jobId: string,
    candidateId: string,
    options: GetMatchOptions = {}
  ) {
    // 1. Check if cached analysis already exists
    const existingMatch = await prisma.jobMatchAnalysis.findUnique({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId,
        },
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            experienceLevel: true,
            requiredSkills: true,
            preferredSkills: true,
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            headline: true,
            avatar: true,
          },
        },
      },
    });

    if (existingMatch && !options.forceRefresh) {
      return {
        cached: true,
        match: existingMatch,
      };
    }

    // 2. Fetch Job details
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw ApiError.notFound('Job requisition not found');
    }

    // 3. Fetch Candidate profile and parsed resume data
    const candidate = await prisma.user.findUnique({
      where: { id: candidateId },
      include: {
        candidateProfile: {
          include: {
            skills: true,
            workExperiences: {
              orderBy: { createdAt: 'desc' },
            },
            educations: {
              orderBy: { createdAt: 'desc' },
            },
            projects: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        resumes: {
          where: { isPrimary: true },
          take: 1,
        },
        applications: {
          where: { jobId },
          take: 1,
        },
      },
    });

    if (!candidate) {
      throw ApiError.notFound('Candidate record not found');
    }

    // Determine primary resume or any resume
    const primaryResume =
      candidate.resumes[0] ||
      (await prisma.resume.findFirst({
        where: { candidateId },
        orderBy: { createdAt: 'desc' },
      }));

    // If candidate has no structured candidateProfile yet, but has an uploaded resume, auto-parse JIT!
    let activeProfile = candidate.candidateProfile;
    if (!activeProfile && primaryResume && primaryResume.parsingStatus !== 'COMPLETED') {
      try {
        await resumeService.parseResume(primaryResume.id, {
          id: candidateId,
          role: 'CANDIDATE',
        });
        activeProfile = await prisma.candidateProfile.findUnique({
          where: { userId: candidateId },
          include: {
            skills: true,
            workExperiences: { orderBy: { createdAt: 'desc' } },
            educations: { orderBy: { createdAt: 'desc' } },
            projects: { orderBy: { createdAt: 'desc' } },
          },
        });
      } catch (err: any) {
        console.warn('[JobMatchService] JIT resume parsing deferred:', err.message);
      }
    }

    // Build CandidateMatchInput
    let candidateSkills: { name: string; category?: string }[] = [];
    let workExperiences: CandidateMatchInput['workExperiences'] = [];
    let educations: CandidateMatchInput['educations'] = [];
    let projects: CandidateMatchInput['projects'] = [];
    let yearsOfExp = activeProfile?.yearsOfExperience || 0;
    let headline = activeProfile?.headline || candidate.headline || '';
    let summary = activeProfile?.summary || candidate.bio || '';
    let certs: string[] = activeProfile?.certifications || [];

    if (activeProfile) {
      candidateSkills = activeProfile.skills.map((s) => ({
        name: s.name,
        category: s.category,
      }));
      workExperiences = activeProfile.workExperiences.map((w) => ({
        company: w.company,
        position: w.position,
        description: w.description,
        technologies: w.technologies,
        startDate: w.startDate,
        endDate: w.endDate,
        isCurrent: w.isCurrent,
      }));
      educations = activeProfile.educations.map((e) => ({
        institution: e.institution,
        degree: e.degree,
        fieldOfStudy: e.fieldOfStudy,
      }));
      projects = activeProfile.projects.map((p) => ({
        title: p.title,
        description: p.description,
        technologies: p.technologies,
        highlights: p.highlights,
      }));
    } else if (primaryResume?.parsedData) {
      // Extract from parsed resume json if profile was not normalized
      const pd = primaryResume.parsedData as any;
      headline = pd.headline || headline;
      summary = pd.summary || summary;
      yearsOfExp = pd.yearsOfExperience || yearsOfExp;
      certs = pd.certifications || certs;

      if (pd.skills) {
        const allSkills: string[] = [
          ...(pd.skills.languages || []),
          ...(pd.skills.frameworks || []),
          ...(pd.skills.databases || []),
          ...(pd.skills.tools || []),
          ...(pd.skills.other || []),
        ];
        candidateSkills = allSkills.map((s) => ({ name: s }));
      }
      if (Array.isArray(pd.workExperience)) {
        workExperiences = pd.workExperience.map((w: any) => ({
          company: w.company || '',
          position: w.position || '',
          description: w.description || '',
          technologies: w.technologies || [],
          startDate: w.startDate,
          endDate: w.endDate,
          isCurrent: w.isCurrent,
        }));
      }
      if (Array.isArray(pd.education)) {
        educations = pd.education.map((e: any) => ({
          institution: e.institution || '',
          degree: e.degree || '',
          fieldOfStudy: e.fieldOfStudy || '',
        }));
      }
      if (Array.isArray(pd.projects)) {
        projects = pd.projects.map((p: any) => ({
          title: p.title || '',
          description: p.description || '',
          technologies: p.technologies || [],
          highlights: p.highlights || [],
        }));
      }
    }

    const candidateInput: CandidateMatchInput = {
      candidateId,
      fullName: candidate.candidateProfile?.fullName || candidate.name,
      headline,
      summary,
      yearsOfExperience: yearsOfExp,
      skills: candidateSkills,
      workExperiences,
      educations,
      projects,
      certifications: certs,
    };

    const jobInput: JobMatchInput = {
      jobId,
      title: job.title,
      department: job.department,
      description: job.description,
      responsibilities: job.responsibilities,
      requiredSkills: job.requiredSkills,
      preferredSkills: job.preferredSkills,
      experienceLevel: job.experienceLevel,
      location: job.location,
    };

    // 4. Run matching engine
    const aiMatcher = getAiJobMatcher();
    const matchResult = await aiMatcher.matchCandidateToJob(
      jobInput,
      candidateInput
    );

    const applicationId = candidate.applications[0]?.id || null;

    // 5. Store / Upsert analysis into database
    const savedMatch = await prisma.jobMatchAnalysis.upsert({
      where: {
        jobId_candidateId: {
          jobId,
          candidateId,
        },
      },
      create: {
        jobId,
        candidateId,
        resumeId: primaryResume?.id || null,
        applicationId,
        overallScore: matchResult.overallScore,
        requiredSkillScore: matchResult.scoringBreakdown?.requiredSkills.score || 0,
        preferredSkillScore: matchResult.scoringBreakdown?.preferredSkills.score || 0,
        experienceScore: matchResult.scoringBreakdown?.experience.score || 0,
        educationScore: matchResult.scoringBreakdown?.education.score || 0,
        projectScore: matchResult.scoringBreakdown?.projects.score || 0,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills,
        strengths: matchResult.strengths,
        weaknesses: matchResult.weaknesses,
        experienceMatch: matchResult.experienceMatch as any,
        recommendation: matchResult.recommendation as any,
        summary: matchResult.summary,
        scoringBreakdown: matchResult.scoringBreakdown as any,
        isAIGenerated: true,
      },
      update: {
        resumeId: primaryResume?.id || null,
        applicationId,
        overallScore: matchResult.overallScore,
        requiredSkillScore: matchResult.scoringBreakdown?.requiredSkills.score || 0,
        preferredSkillScore: matchResult.scoringBreakdown?.preferredSkills.score || 0,
        experienceScore: matchResult.scoringBreakdown?.experience.score || 0,
        educationScore: matchResult.scoringBreakdown?.education.score || 0,
        projectScore: matchResult.scoringBreakdown?.projects.score || 0,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills,
        strengths: matchResult.strengths,
        weaknesses: matchResult.weaknesses,
        experienceMatch: matchResult.experienceMatch as any,
        recommendation: matchResult.recommendation as any,
        summary: matchResult.summary,
        scoringBreakdown: matchResult.scoringBreakdown as any,
        isAIGenerated: true,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            experienceLevel: true,
            requiredSkills: true,
            preferredSkills: true,
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            headline: true,
            avatar: true,
          },
        },
      },
    });

    // 6. Update Application record if candidate has applied
    if (applicationId) {
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          matchScore: matchResult.overallScore,
          matchAnalysis: matchResult as any,
        },
      }).catch((err) => {
        console.warn('[JobMatchService] Could not update application matchScore:', err.message);
      });
    }

    return {
      cached: false,
      match: savedMatch,
    };
  }

  /**
   * Get all cached matches for a job opening
   */
  static async getJobMatchesForJob(jobId: string) {
    return prisma.jobMatchAnalysis.findMany({
      where: { jobId },
      orderBy: { overallScore: 'desc' },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            headline: true,
            avatar: true,
          },
        },
      },
    });
  }
}
