import { z } from 'zod';

export const transcribeAudioSchema = z.object({
  questionId: z.string().uuid().optional(),
  interviewId: z.string().uuid().optional(),
});

export const submitVoiceResponseSchema = z.object({
  interviewId: z.string().uuid('Invalid interviewId format'),
  questionId: z.string().uuid('Invalid questionId format'),
  transcript: z.string().min(1, 'Transcript cannot be empty'),
  durationSeconds: z.number().nonnegative().default(0),
  audioUrl: z.string().optional(),
  autoAdvance: z.boolean().optional().default(false),
});

export type SubmitVoiceResponseInput = z.infer<typeof submitVoiceResponseSchema>;
