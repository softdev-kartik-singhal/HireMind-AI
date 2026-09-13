import { apiClient } from './api-client';
import {
  ProctoringEventType,
  ProctoringTimelineSummary,
} from '@/types/proctoring';

export class ProctoringApi {
  /**
   * Log an integrity signal event from candidate browser
   */
  static async recordEvent(
    interviewId: string,
    eventType: ProctoringEventType,
    durationMs?: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    await apiClient.post('/proctoring/events', {
      interviewId,
      eventType,
      durationMs,
      metadata,
    });
  }

  /**
   * Log batch of integrity signal events from candidate browser
   */
  static async recordBatchEvents(
    interviewId: string,
    events: Array<{
      eventType: ProctoringEventType;
      timestamp?: string;
      durationMs?: number;
      metadata?: Record<string, any>;
    }>
  ): Promise<void> {
    await apiClient.post('/proctoring/events', {
      interviewId,
      events,
    });
  }

  /**
   * Retrieve proctoring timeline and integrity metrics for recruiter review
   */
  static async getTimeline(
    interviewId: string
  ): Promise<ProctoringTimelineSummary> {
    const response = await apiClient.get<ProctoringTimelineSummary>(
      `/proctoring/interviews/${interviewId}/events`
    );
    return response.data;
  }
}
