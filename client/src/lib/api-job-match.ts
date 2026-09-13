import { apiClient } from './api-client';
import { JobMatchAnalysis, JobMatchResponse } from '@/types/jobMatch';

export class JobMatchApi {
  /**
   * Get cached candidate-to-job match analysis or trigger AI evaluation.
   */
  static async getCandidateMatch(
    jobId: string,
    candidateId: string,
    options?: { forceRefresh?: boolean }
  ): Promise<JobMatchResponse> {
    const params = options?.forceRefresh ? { forceRefresh: 'true' } : {};
    const res = await apiClient.get<{
      success: boolean;
      message: string;
      data: JobMatchResponse;
    }>(`/jobs/${jobId}/matches/${candidateId}`, { params });

    return res.data.data;
  }

  /**
   * Get all evaluated matches for a job requisition.
   */
  static async getJobMatches(jobId: string): Promise<JobMatchAnalysis[]> {
    const res = await apiClient.get<{
      success: boolean;
      message: string;
      data: { matches: JobMatchAnalysis[] };
    }>(`/jobs/${jobId}/matches`);

    return res.data.data.matches;
  }
}
