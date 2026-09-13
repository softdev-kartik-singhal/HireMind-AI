import { z } from 'zod';
import { InterviewStatus, InterviewType, InterviewDifficulty } from '@prisma/client';

export const createInterviewSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Interview title must be at least 3 characters'),
    type: z.nativeEnum(InterviewType).default(InterviewType.TECHNICAL),
    difficulty: z.nativeEnum(InterviewDifficulty).default(InterviewDifficulty.MEDIUM),
    durationMins: z.coerce.number().min(15).max(180).default(60),
    numQuestions: z.coerce.number().min(1).max(10).default(5),
    scheduledAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid scheduledAt ISO date/time format',
    }),
    jobId: z.string().uuid('Valid Job ID is required'),
    candidateId: z.string().min(1, 'Candidate ID or email is required'),
    applicationId: z.string().uuid().optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
  }),
});

export const updateInterviewStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(InterviewStatus),
    notes: z.string().max(1000).optional().nullable(),
  }),
});

export const updateSessionProgressSchema = z.object({
  body: z.object({
    currentQuestionIndex: z.number().min(0),
    clientState: z.record(z.any()).optional().nullable(),
    proctorLogs: z.record(z.any()).optional().nullable(),
    activeResponse: z
      .object({
        questionId: z.string().uuid(),
        answerText: z.string().optional().nullable(),
        codeAnswer: z.string().optional().nullable(),
        codeLanguage: z.string().optional().nullable(),
        timeSpentSeconds: z.number().min(0).optional(),
      })
      .optional()
      .nullable(),
  }),
});

export const submitQuestionResponseSchema = z.object({
  body: z.object({
    answerText: z.string().optional().nullable(),
    codeAnswer: z.string().optional().nullable(),
    codeLanguage: z.string().default('typescript'),
    executionResults: z.any().optional().nullable(),
    timeSpentSeconds: z.number().min(0).default(0),
  }),
});

export const createCustomQuestionSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Question description must be at least 10 characters'),
    category: z.enum([
      'Fundamentals',
      'Technical',
      'Scenario-based',
      'Problem-solving',
      'Project-based',
      'Behavioral',
    ]).default('Technical'),
    difficulty: z.nativeEnum(InterviewDifficulty).default(InterviewDifficulty.MEDIUM),
    type: z.string().default('TECHNICAL'),
    expectedTopics: z.array(z.string()).min(1, 'At least 1 expected topic required'),
    evaluationCriteria: z.array(z.string()).min(1, 'At least 1 evaluation criterion required'),
    starterCode: z.string().optional().nullable(),
    testCases: z.any().optional().nullable(),
    timeLimitMins: z.number().int().positive().optional().nullable(),
  }),
});

export const updateQuestionSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    category: z.enum([
      'Fundamentals',
      'Technical',
      'Scenario-based',
      'Problem-solving',
      'Project-based',
      'Behavioral',
    ]).optional(),
    difficulty: z.nativeEnum(InterviewDifficulty).optional(),
    type: z.string().optional(),
    expectedTopics: z.array(z.string()).optional(),
    evaluationCriteria: z.array(z.string()).optional(),
    starterCode: z.string().optional().nullable(),
    testCases: z.any().optional().nullable(),
    timeLimitMins: z.number().int().positive().optional().nullable(),
  }),
});

export const reorderQuestionsSchema = z.object({
  body: z.object({
    questionIds: z.array(z.string().uuid()).min(1, 'List of question IDs is required'),
  }),
});

export const generateQuestionsQuerySchema = z.object({
  query: z.object({
    forceRefresh: z.enum(['true', 'false']).optional().transform((val) => val === 'true'),
  }),
});

export type CreateInterviewInput = z.infer<typeof createInterviewSchema>['body'];
export type UpdateInterviewStatusInput = z.infer<typeof updateInterviewStatusSchema>['body'];
export type UpdateSessionProgressInput = z.infer<typeof updateSessionProgressSchema>['body'];
export type SubmitQuestionResponseInput = z.infer<typeof submitQuestionResponseSchema>['body'];
export type CreateCustomQuestionInput = z.infer<typeof createCustomQuestionSchema>['body'];
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>['body'];
export type ReorderQuestionsInput = z.infer<typeof reorderQuestionsSchema>['body'];

