import { z } from 'zod';

export const applicationStatuses = [
  'APPLIED',
  'SCREENING',
  'SHORTLISTED',
  'INTERVIEW',
  'SELECTED',
  'REJECTED',
] as const;

export type ApplicationStatusType = (typeof applicationStatuses)[number];

export const createApplicationSchema = z.object({
  body: z.object({
    jobId: z.string().uuid('Invalid Job ID'),
    resumeUrl: z.string().url('Resume URL must be a valid link').optional().nullable(),
    coverLetter: z.string().max(2000, 'Cover letter cannot exceed 2000 characters').optional().nullable(),
    phone: z.string().max(25).optional().nullable(),
  }),
});

export const updateApplicationStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid application ID'),
  }),
  body: z.object({
    status: z.enum(applicationStatuses, {
      required_error: 'Status must be APPLIED, SCREENING, SHORTLISTED, INTERVIEW, SELECTED, or REJECTED',
    }),
    notes: z.string().max(1000).optional().nullable(),
  }),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>['body'];
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>['body'];
