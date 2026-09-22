import { apiClient } from './api-client';
import {
  RankingWeights,
  JobRankingResponse,
  CandidatePipelineAction,
} from '@/types/ranking';

export class RankingApi {
  /**
   * Fetch deterministic candidate rankings for a specific job requisition.
   * Optionally pass live weight overrides.
   */
  static async getJobRankings(
    jobId: string,
    weights?: Partial<RankingWeights>
  ): Promise<JobRankingResponse> {
    const params = new URLSearchParams();
    if (weights?.resumeWeight !== undefined) params.append('resumeWeight', String(weights.resumeWeight));
    if (weights?.codingWeight !== undefined) params.append('codingWeight', String(weights.codingWeight));
    if (weights?.technicalWeight !== undefined) params.append('technicalWeight', String(weights.technicalWeight));
    if (weights?.communicationWeight !== undefined) params.append('communicationWeight', String(weights.communicationWeight));
    if (weights?.otherWeight !== undefined) params.append('otherWeight', String(weights.otherWeight));

    const queryString = params.toString();
    const url = `/ranking/jobs/${jobId}${queryString ? `?${queryString}` : ''}`;

    const res = await apiClient.get<{
      success: boolean;
      data: JobRankingResponse;
    }>(url);
    return res.data.data;
  }

  /**
   * Save customized ranking weights configured by recruiter for a job
   */
  static async saveJobWeights(
    jobId: string,
    weights: RankingWeights
  ): Promise<RankingWeights> {
    const res = await apiClient.post<{
      success: boolean;
      data: RankingWeights;
    }>(`/ranking/jobs/${jobId}/weights`, weights);
    return res.data.data;
  }

  /**
   * Execute pipeline action on a candidate application (SHORTLIST, REJECT, MOVE_TO_INTERVIEW, ADD_NOTES)
   */
  static async executeCandidateAction(
    applicationId: string,
    action: CandidatePipelineAction,
    notes?: string
  ): Promise<{
    success: boolean;
    applicationId: string;
    candidateName: string;
    status: string;
    notes: string | null;
  }> {
    const res = await apiClient.post<{
      success: boolean;
      data: {
        success: boolean;
        applicationId: string;
        candidateName: string;
        status: string;
        notes: string | null;
      };
    }>(`/ranking/applications/${applicationId}/action`, {
      action,
      notes,
    });
    return res.data.data;
  }
}
