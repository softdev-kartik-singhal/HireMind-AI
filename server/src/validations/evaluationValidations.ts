import { z } from 'zod';

export const evaluationRecommendationEnum = z.enum([
  'STRONG_HIRE',
  'HIRE',
  'MAYBE',
  'NO_HIRE',
]);

export type EvaluationRecommendation = z.infer<typeof evaluationRecommendationEnum>;

/**
 * Schema for validating structured AI evaluation engine output
 */
export const aiEvaluationOutputSchema = z.object({
  overallScore: z.number().min(0).max(100),
  technicalScore: z.number().min(0).max(100),
  problemSolvingScore: z.number().min(0).max(100),
  codingScore: z.number().min(0).max(100),
  communicationScore: z.number().min(0).max(100),
  answerRelevanceScore: z.number().min(0).max(100),
  skillAlignmentScore: z.number().min(0).max(100),

  recommendation: evaluationRecommendationEnum,
  summary: z.string().min(1),

  strengths: z.array(z.string()).min(1),
  weaknesses: z.array(z.string()).default([]),
  missingSkills: z.array(z.string()).default([]),
  technicalSummary: z.string().min(1),
  communicationSummary: z.string().min(1),
  improvementAreas: z.array(z.string()).default([]),
});

export type AiEvaluationOutput = z.infer<typeof aiEvaluationOutputSchema>;

/**
 * Schema for recruiter manual override of recommendation and notes
 */
export const recruiterOverrideSchema = z.object({
  recommendation: evaluationRecommendationEnum,
  recruiterNotes: z.string().max(3000).optional(),
});

export type RecruiterOverrideInput = z.infer<typeof recruiterOverrideSchema>;
