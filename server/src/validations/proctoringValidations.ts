import { z } from 'zod';

export const PROCTORING_EVENT_TYPES = [
  'NO_FACE_DETECTED',
  'MULTIPLE_FACES',
  'LOOKING_AWAY',
  'CAMERA_DISCONNECTED',
  'TAB_HIDDEN',
  'FULLSCREEN_EXIT',
] as const;

export type ProctoringEventType = (typeof PROCTORING_EVENT_TYPES)[number];

export const recordProctoringEventSchema = z.object({
  interviewId: z.string().uuid('Invalid interviewId format'),
  eventType: z.enum(PROCTORING_EVENT_TYPES, {
    errorMap: () => ({ message: 'Invalid proctoring event type' }),
  }),
  timestamp: z.string().datetime().optional().default(() => new Date().toISOString()),
  durationMs: z.number().nonnegative().optional(),
  metadata: z.record(z.any()).optional().default({}),
});

export const recordBatchProctoringEventsSchema = z.object({
  interviewId: z.string().uuid('Invalid interviewId format'),
  events: z
    .array(
      z.object({
        eventType: z.enum(PROCTORING_EVENT_TYPES),
        timestamp: z.string().datetime().optional().default(() => new Date().toISOString()),
        durationMs: z.number().nonnegative().optional(),
        metadata: z.record(z.any()).optional().default({}),
      })
    )
    .min(1, 'At least one event must be provided'),
});

export type RecordProctoringEventInput = z.infer<typeof recordProctoringEventSchema>;
export type RecordBatchProctoringEventsInput = z.infer<typeof recordBatchProctoringEventsSchema>;
