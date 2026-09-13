import { z } from 'zod';

export const resumeIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid resume ID format' }),
  }),
});

export const updatePrimaryResumeSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid resume ID format' }),
  }),
});

export const uploadResumeQuerySchema = z.object({
  query: z.object({
    setPrimary: z
      .string()
      .optional()
      .transform((val) => val === 'true' || val === '1'),
  }),
});
