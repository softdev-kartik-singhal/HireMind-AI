import { z } from 'zod';
import { InterviewDifficulty } from '@prisma/client';

export const supportedCodingLanguagesSchema = z.enum([
  'javascript',
  'python',
  'cpp',
  'java',
]);

export const runCodeSchema = z.object({
  body: z.object({
    questionId: z.string().uuid().optional().nullable(),
    interviewId: z.string().uuid().optional().nullable(),
    language: supportedCodingLanguagesSchema,
    code: z.string().min(1, 'Source code cannot be empty'),
    customTestCases: z
      .array(
        z.object({
          input: z.string(),
          expectedOutput: z.string(),
          description: z.string().optional(),
        })
      )
      .optional()
      .nullable(),
  }),
});

export const submitCodeSchema = z.object({
  body: z.object({
    questionId: z.string().uuid('Question ID is required'),
    interviewId: z.string().uuid().optional().nullable(),
    language: supportedCodingLanguagesSchema,
    code: z.string().min(1, 'Source code cannot be empty'),
  }),
});

export const createCodingQuestionSchema = z.object({
  body: z.object({
    interviewId: z.string().uuid().optional().nullable(),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    difficulty: z.nativeEnum(InterviewDifficulty).default(InterviewDifficulty.MEDIUM),
    constraints: z.array(z.string()).default([]),
    examples: z.any().optional().nullable(),
    testCases: z.any().optional().nullable(),
    starterCode: z.any().optional().nullable(),
    supportedLanguages: z.array(z.string()).default(['javascript', 'python', 'cpp', 'java']),
    category: z.string().default('Algorithms'),
    timeLimitMins: z.number().int().positive().default(30),
  }),
});

export type RunCodeInput = z.infer<typeof runCodeSchema>['body'];
export type SubmitCodeInput = z.infer<typeof submitCodeSchema>['body'];
export type CreateCodingQuestionInput = z.infer<typeof createCodingQuestionSchema>['body'];
