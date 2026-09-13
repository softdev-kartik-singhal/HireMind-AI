import { z } from 'zod';

export const recommendationEnum = z.enum([
  'STRONG_MATCH',
  'GOOD_MATCH',
  'PARTIAL_MATCH',
  'WEAK_MATCH',
]);

export type MatchRecommendationType = z.infer<typeof recommendationEnum>;

export const experienceMatchSchema = z.object({
  score: z.number().min(0).max(100),
  summary: z.string(),
  candidateYears: z.number().optional(),
  requiredLevel: z.string().optional(),
  relevanceExplanation: z.string().optional(),
});

export const scoringBreakdownSchema = z.object({
  requiredSkills: z.object({
    weight: z.number().default(35),
    score: z.number().min(0).max(100),
    details: z.string().optional(),
  }),
  experience: z.object({
    weight: z.number().default(25),
    score: z.number().min(0).max(100),
    details: z.string().optional(),
  }),
  preferredSkills: z.object({
    weight: z.number().default(15),
    score: z.number().min(0).max(100),
    details: z.string().optional(),
  }),
  projects: z.object({
    weight: z.number().default(15),
    score: z.number().min(0).max(100),
    details: z.string().optional(),
  }),
  education: z.object({
    weight: z.number().default(10),
    score: z.number().min(0).max(100),
    details: z.string().optional(),
  }),
});

export const jobMatchResultSchema = z.object({
  overallScore: z.number().min(0).max(100),
  matchedSkills: z.array(z.string()).default([]),
  missingSkills: z.array(z.string()).default([]),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  experienceMatch: experienceMatchSchema,
  recommendation: recommendationEnum,
  summary: z.string().default(''),
  scoringBreakdown: scoringBreakdownSchema.optional(),
  disclaimer: z.string().default(
    'This AI compatibility evaluation is an advisory decision-support tool. It does not constitute an automated hiring decision. All employment actions must be reviewed and decided by authorized human recruiters.'
  ),
});

export type JobMatchResult = z.infer<typeof jobMatchResultSchema>;
