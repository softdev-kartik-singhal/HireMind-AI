import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { CreateJobInput, UpdateJobInput, GetJobsQuery, JobStatusType } from '../validations/jobValidations.js';
import { Prisma } from '@prisma/client';
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
        requiredSkills: JSON.stringify(input.requiredSkills),
        preferredSkills: JSON.stringify(input.preferredSkills || []),
        experienceLevel: input.experienceLevel,
        location: input.location,
        employmentType: input.employmentType,
        salaryRange: input.salaryRange || null,
        status: input.status,
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

    return {
      ...job,
      requiredSkills: JSON.parse(job.requiredSkills || '[]'),
      preferredSkills: JSON.parse(job.preferredSkills || '[]'),
    };
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
      where.status = 'ACTIVE';
    } else if (query.status) {
      where.status = query.status;
    }

    if (query.recruiterId) {
      where.recruiterId = query.recruiterId;
    }

    if (query.department) {
      where.department = { equals: query.department };
    }

    if (query.location) {
      where.location = { contains: query.location };
    }

    if (query.experienceLevel) {
      where.experienceLevel = query.experienceLevel;
    }

    if (query.employmentType) {
      where.employmentType = query.employmentType;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
        { department: { contains: query.search } },
        { requiredSkills: { contains: query.search } },
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
      jobs: jobs.map((job) => {
        let parsedReq = [];
        let parsedPref = [];
        try {
          parsedReq = typeof job.requiredSkills === 'string' ? JSON.parse(job.requiredSkills) : job.requiredSkills;
        } catch {
          parsedReq = [];
        }
        try {
          parsedPref = typeof job.preferredSkills === 'string' ? JSON.parse(job.preferredSkills) : job.preferredSkills;
        } catch {
          parsedPref = [];
        }

        return {
          ...job,
          requiredSkills: parsedReq,
          preferredSkills: parsedPref,
          hasApplied: job.applications ? job.applications.length > 0 : false,
          userApplication: job.applications && job.applications.length > 0 ? job.applications[0] : null,
        };
      }),
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

    let parsedReq = [];
    let parsedPref = [];
    try {
      parsedReq = typeof job.requiredSkills === 'string' ? JSON.parse(job.requiredSkills) : job.requiredSkills;
    } catch {
      parsedReq = [];
    }
    try {
      parsedPref = typeof job.preferredSkills === 'string' ? JSON.parse(job.preferredSkills) : job.preferredSkills;
    } catch {
      parsedPref = [];
    }

    return {
      ...job,
      requiredSkills: parsedReq,
      preferredSkills: parsedPref,
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
        ...(input.requiredSkills && { requiredSkills: JSON.stringify(input.requiredSkills) }),
        ...(input.preferredSkills !== undefined && { preferredSkills: JSON.stringify(input.preferredSkills) }),
        ...(input.experienceLevel && { experienceLevel: input.experienceLevel }),
        ...(input.location && { location: input.location }),
        ...(input.employmentType && { employmentType: input.employmentType }),
        ...(input.salaryRange !== undefined && { salaryRange: input.salaryRange }),
        ...(input.status && { status: input.status }),
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

    let parsedReq = [];
    let parsedPref = [];
    try {
      parsedReq = typeof updatedJob.requiredSkills === 'string' ? JSON.parse(updatedJob.requiredSkills) : updatedJob.requiredSkills;
    } catch {
      parsedReq = [];
    }
    try {
      parsedPref = typeof updatedJob.preferredSkills === 'string' ? JSON.parse(updatedJob.preferredSkills) : updatedJob.preferredSkills;
    } catch {
      parsedPref = [];
    }

    return {
      ...updatedJob,
      requiredSkills: parsedReq,
      preferredSkills: parsedPref,
    };
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
      data: { status },
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
