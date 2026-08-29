import { z } from 'zod';

export const jobExperienceLevels = ['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE'] as const;
export const jobEmploymentTypes = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'REMOTE'] as const;
export const jobStatuses = ['DRAFT', 'ACTIVE', 'PAUSED', 'CLOSED'] as const;

export type JobStatusType = (typeof jobStatuses)[number];
export type JobExperienceLevelType = (typeof jobExperienceLevels)[number];
export type JobEmploymentTypeType = (typeof jobEmploymentTypes)[number];

export const createJobSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Job title is required' })
      .trim()
      .min(3, 'Title must be at least 3 characters')
      .max(150, 'Title cannot exceed 150 characters'),
    department: z
      .string({ required_error: 'Department is required' })
      .trim()
      .min(2, 'Department must be at least 2 characters')
      .max(100),
    description: z
      .string({ required_error: 'Description is required' })
      .trim()
      .min(20, 'Description must be at least 20 characters'),
    responsibilities: z
      .string({ required_error: 'Responsibilities are required' })
      .trim()
      .min(10, 'Responsibilities must be at least 10 characters'),
    requiredSkills: z
      .array(z.string().trim().min(1))
      .min(1, 'At least one required skill is required'),
    preferredSkills: z.array(z.string().trim().min(1)).default([]),
    experienceLevel: z.enum(jobExperienceLevels).default('MID'),
    location: z
      .string({ required_error: 'Location is required' })
      .trim()
      .min(2, 'Location is required'),
    employmentType: z.enum(jobEmploymentTypes).default('FULL_TIME'),
    salaryRange: z.string().trim().optional().nullable(),
    status: z.enum(jobStatuses).default('ACTIVE'),
    applicationDeadline: z.string().datetime().optional().nullable(),
  }),
});

export const updateJobSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid job ID'),
  }),
  body: z.object({
    title: z.string().trim().min(3).max(150).optional(),
    department: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().min(20).optional(),
    responsibilities: z.string().trim().min(10).optional(),
    requiredSkills: z.array(z.string().trim().min(1)).min(1).optional(),
    preferredSkills: z.array(z.string().trim().min(1)).optional(),
    experienceLevel: z.enum(jobExperienceLevels).optional(),
    location: z.string().trim().min(2).optional(),
    employmentType: z.enum(jobEmploymentTypes).optional(),
    salaryRange: z.string().trim().optional().nullable(),
    status: z.enum(jobStatuses).optional(),
    applicationDeadline: z.string().datetime().optional().nullable(),
  }),
});

export const updateJobStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid job ID'),
  }),
  body: z.object({
    status: z.enum(jobStatuses, {
      required_error: 'Status is required (DRAFT, ACTIVE, PAUSED, CLOSED)',
    }),
  }),
});

export const getJobsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
    search: z.string().trim().optional(),
    department: z.string().trim().optional(),
    location: z.string().trim().optional(),
    experienceLevel: z.enum(jobExperienceLevels).optional(),
    employmentType: z.enum(jobEmploymentTypes).optional(),
    status: z.enum(jobStatuses).optional(),
    recruiterId: z.string().uuid().optional(),
  }),
});

export type CreateJobInput = z.infer<typeof createJobSchema>['body'];
export type UpdateJobInput = z.infer<typeof updateJobSchema>['body'];
export type GetJobsQuery = z.infer<typeof getJobsQuerySchema>['query'];
