import { z } from 'zod';

export const questionCategorySchema = z.enum([
  'Fundamentals',
  'Technical',
  'Scenario-based',
  'Problem-solving',
  'Project-based',
  'Behavioral',
]);

export type QuestionCategory = z.infer<typeof questionCategorySchema>;

export const questionDifficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD']);
export type QuestionDifficulty = z.infer<typeof questionDifficultySchema>;

export const questionTypeSchema = z.enum([
  'TECHNICAL',
  'BEHAVIORAL',
  'CODING',
  'SYSTEM_DESIGN',
]);
export type QuestionType = z.infer<typeof questionTypeSchema>;

export const testCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  description: z.string().optional(),
});

export const aiGeneratedQuestionSchema = z.object({
  title: z.string().min(3),
  question: z.string().min(10), // The main question prompt/description
  category: questionCategorySchema,
  difficulty: questionDifficultySchema,
  expectedTopics: z.array(z.string()).min(1),
  evaluationCriteria: z.array(z.string()).min(1),
  type: questionTypeSchema.default('TECHNICAL'),
  starterCode: z.string().optional().nullable(),
  testCases: z.array(testCaseSchema).optional().nullable(),
  timeLimitMins: z.number().int().positive().optional().nullable(),
});

export type AiGeneratedQuestion = z.infer<typeof aiGeneratedQuestionSchema>;

export const aiQuestionGenerationResultSchema = z.object({
  summary: z.string().optional(),
  questions: z.array(aiGeneratedQuestionSchema).min(1),
});

export type AiQuestionGenerationResult = z.infer<typeof aiQuestionGenerationResultSchema>;
