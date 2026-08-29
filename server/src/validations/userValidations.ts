import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .optional(),
    avatar: z.string().url('Avatar must be a valid URL').optional().nullable(),
    bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional().nullable(),
    headline: z.string().max(120, 'Headline cannot exceed 120 characters').optional().nullable(),
    phone: z.string().max(20, 'Phone number cannot exceed 20 characters').optional().nullable(),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
