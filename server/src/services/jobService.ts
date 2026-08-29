import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { CreateJobInput, UpdateJobInput, GetJobsQuery, JobStatusType } from '../validations/jobValidations.js';
import { JobStatus, JobExperienceLevel, JobEmploymentType, Prisma } from '@prisma/client';
import { UserRoleType, USER_ROLES } from '../constants/roles.js';

export class JobService {
  /**
   * Create a new job requisition (Recruiter/Admin only)
   */
  static async createJob(recruiterId: string, input: CreateJobInput) {
    const job = await prisma.job.create({
      data: {
        title: input.title,
        department: input.department,
        description: input.description,
        responsibilities: input.responsibilities,
        requiredSkills: input.requiredSkills,
        preferredSkills: input.preferredSkills || [],
        experienceLevel: input.experienceLevel as JobExperienceLevel,
        location: input.location,
        employmentType: input.employmentType as JobEmploymentType,
        salaryRange: input.salaryRange || null,
        status: input.status as JobStatus,
        applicationDeadline: input.applicationDeadline ? new Date(input.applicationDeadline) : null,
        recruiterId,
      },
      include: {
        recruiter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    return job;
  }

  /**
   * Get filtered, paginated list of jobs
   */
  static async getJobs(query: GetJobsQuery, userRole?: UserRoleType, currentUserId?: string) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.JobWhereInput = {};

    // For Candidates or Unauthenticated, only show ACTIVE jobs
    if (!userRole || userRole === USER_ROLES.CANDIDATE) {
      where.status = JobStatus.ACTIVE;
    } else if (query.status) {
      where.status = query.status as JobStatus;
    }

    if (query.recruiterId) {
      where.recruiterId = query.recruiterId;
    }

    if (query.department) {
      where.department = { equals: query.department, mode: 'insensitive' };
    }

    if (query.location) {
      where.location = { contains: query.location, mode: 'insensitive' };
    }

    if (query.experienceLevel) {
      where.experienceLevel = query.experienceLevel as JobExperienceLevel;
    }

    if (query.employmentType) {
      where.employmentType = query.employmentType as JobEmploymentType;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { department: { contains: query.search, mode: 'insensitive' } },
        { requiredSkills: { has: query.search } },
      ];
    }

    const [total, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          recruiter: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          _count: {
            select: { applications: true },
          },
          ...(currentUserId && {
            applications: {
              where: { candidateId: currentUserId },
              select: {
                id: true,
                status: true,
                createdAt: true,
              },
            },
          }),
        },
      }),
    ]);

    return {
      jobs: jobs.map((job) => ({
        ...job,
        hasApplied: job.applications ? job.applications.length > 0 : false,
        userApplication: job.applications && job.applications.length > 0 ? job.applications[0] : null,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single job by ID
   */
  static async getJobById(id: string, currentUserId?: string) {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        recruiter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: { applications: true },
        },
        ...(currentUserId && {
          applications: {
            where: { candidateId: currentUserId },
            select: {
              id: true,
              status: true,
              createdAt: true,
            },
          },
        }),
      },
    });

    if (!job) {
      throw ApiError.notFound('Job requisition not found');
    }

    return {
      ...job,
      hasApplied: job.applications ? job.applications.length > 0 : false,
      userApplication: job.applications && job.applications.length > 0 ? job.applications[0] : null,
    };
  }

  /**
   * Update job requisition (Recruiter owner or Admin only)
   */
  static async updateJob(id: string, userId: string, userRole: UserRoleType, input: UpdateJobInput) {
    const existingJob = await prisma.job.findUnique({ where: { id } });
    if (!existingJob) {
      throw ApiError.notFound('Job requisition not found');
    }

    // Role Guard: Only job owner or Admin can update
    if (userRole !== USER_ROLES.ADMIN && existingJob.recruiterId !== userId) {
      throw ApiError.forbidden('You can only edit jobs created by your account');
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.department && { department: input.department }),
        ...(input.description && { description: input.description }),
        ...(input.responsibilities && { responsibilities: input.responsibilities }),
        ...(input.requiredSkills && { requiredSkills: input.requiredSkills }),
        ...(input.preferredSkills !== undefined && { preferredSkills: input.preferredSkills }),
        ...(input.experienceLevel && { experienceLevel: input.experienceLevel as JobExperienceLevel }),
        ...(input.location && { location: input.location }),
        ...(input.employmentType && { employmentType: input.employmentType as JobEmploymentType }),
        ...(input.salaryRange !== undefined && { salaryRange: input.salaryRange }),
        ...(input.status && { status: input.status as JobStatus }),
        ...(input.applicationDeadline !== undefined && {
          applicationDeadline: input.applicationDeadline ? new Date(input.applicationDeadline) : null,
        }),
      },
      include: {
        recruiter: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    return updatedJob;
  }

  /**
   * Change job status (ACTIVE, PAUSED, CLOSED, DRAFT)
   */
  static async updateJobStatus(
    id: string,
    userId: string,
    userRole: UserRoleType,
    status: JobStatusType
  ) {
    const existingJob = await prisma.job.findUnique({ where: { id } });
    if (!existingJob) {
      throw ApiError.notFound('Job requisition not found');
    }

    if (userRole !== USER_ROLES.ADMIN && existingJob.recruiterId !== userId) {
      throw ApiError.forbidden('You can only change status for jobs created by your account');
    }

    const updated = await prisma.job.update({
      where: { id },
      data: { status: status as JobStatus },
    });

    return updated;
  }

  /**
   * Delete job requisition
   */
  static async deleteJob(id: string, userId: string, userRole: UserRoleType) {
    const existingJob = await prisma.job.findUnique({ where: { id } });
    if (!existingJob) {
      throw ApiError.notFound('Job requisition not found');
    }

    if (userRole !== USER_ROLES.ADMIN && existingJob.recruiterId !== userId) {
      throw ApiError.forbidden('You can only delete jobs created by your account');
    }

    await prisma.job.delete({ where: { id } });
    return true;
  }

  /**
   * Get all applicants for a specific job (Recruiter/Admin only)
   */
  static async getJobApplicants(jobId: string, userId: string, userRole: UserRoleType) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      throw ApiError.notFound('Job not found');
    }

    if (userRole !== USER_ROLES.ADMIN && job.recruiterId !== userId) {
      throw ApiError.forbidden('You are not authorized to view applicants for this job');
    }

    const applications = await prisma.application.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            headline: true,
            bio: true,
            phone: true,
          },
        },
      },
    });

    return applications;
  }
}
