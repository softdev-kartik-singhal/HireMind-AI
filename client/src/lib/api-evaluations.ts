import { apiClient } from './api-client';
import {
  InterviewEvaluationData,
  RecruiterOverrideDto,
} from '@/types/evaluation';

export class EvaluationApi {
  /**
   * Get cached interview evaluation or generate if not yet created
   */
  static async getEvaluation(
    interviewId: string,
    force: boolean = false
  ): Promise<InterviewEvaluationData> {
    const res = await apiClient.get<{
      success: boolean;
      data: InterviewEvaluationData;
    }>(`/evaluations/interviews/${interviewId}${force ? '?force=true' : ''}`);
    return res.data.data;
  }

  /**
   * Force AI generation of evaluation
   */
  static async forceGenerate(
    interviewId: string
  ): Promise<InterviewEvaluationData> {
    const res = await apiClient.post<{
      success: boolean;
      data: InterviewEvaluationData;
    }>(`/evaluations/interviews/${interviewId}/generate`);
    return res.data.data;
  }

  /**
   * Recruiter manual override of recommendation and notes
   */
  static async overrideEvaluation(
    interviewId: string,
    dto: RecruiterOverrideDto
  ): Promise<InterviewEvaluationData> {
    const res = await apiClient.patch<{
      success: boolean;
      data: InterviewEvaluationData;
    }>(`/evaluations/interviews/${interviewId}/override`, dto);
    return res.data.data;
  }
}
