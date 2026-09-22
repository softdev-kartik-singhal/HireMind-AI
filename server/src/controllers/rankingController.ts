import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { RankingService, RankingWeights } from '../services/rankingService.js';

export class RankingController {
  /**
   * GET /api/ranking/jobs/:jobId
   * Retrieve deterministic candidate rankings for a specific job requisition.
   * Supports optional query params or body overrides for weights.
   */
  static getJobRankings = asyncHandler(async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const recruiterId = req.user?.id;

    // Optional query overrides for interactive sliders
    const { resumeWeight, codingWeight, technicalWeight, communicationWeight, otherWeight } = req.query;

    const overrideWeights: Partial<RankingWeights> = {};
    if (resumeWeight !== undefined) overrideWeights.resumeWeight = Number(resumeWeight);
    if (codingWeight !== undefined) overrideWeights.codingWeight = Number(codingWeight);
    if (technicalWeight !== undefined) overrideWeights.technicalWeight = Number(technicalWeight);
    if (communicationWeight !== undefined) overrideWeights.communicationWeight = Number(communicationWeight);
    if (otherWeight !== undefined) overrideWeights.otherWeight = Number(otherWeight);

    const rankings = await RankingService.getJobRankings(
      jobId,
      recruiterId,
      Object.keys(overrideWeights).length > 0 ? overrideWeights : undefined
    );

    return ApiResponse.success({
      res,
      data: rankings,
      message: 'Candidate rankings computed successfully.',
    });
  });

  /**
   * POST /api/ranking/jobs/:jobId/weights
   * Persist custom ranking weights configured by recruiter.
   */
  static saveJobWeights = asyncHandler(async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const { resumeWeight, codingWeight, technicalWeight, communicationWeight, otherWeight } = req.body;

    const weights: RankingWeights = {
      resumeWeight: Number(resumeWeight) || 0,
      codingWeight: Number(codingWeight) || 0,
      technicalWeight: Number(technicalWeight) || 0,
      communicationWeight: Number(communicationWeight) || 0,
      otherWeight: Number(otherWeight) || 0,
    };

    const saved = await RankingService.saveJobWeights(jobId, weights);
    return ApiResponse.success({
      res,
      data: saved,
      message: 'Ranking weights saved successfully.',
    });
  });

  /**
   * POST /api/ranking/applications/:applicationId/action
   * Execute pipeline action on candidate (Shortlist, Reject, Move to Interview, Add Notes).
   */
  static executeCandidateAction = asyncHandler(async (req: Request, res: Response) => {
    const { applicationId } = req.params;
    const { action, notes } = req.body;
    const recruiterId = req.user?.id;

    if (!['SHORTLIST', 'REJECT', 'MOVE_TO_INTERVIEW', 'ADD_NOTES'].includes(action)) {
      throw ApiError.badRequest('Invalid action. Must be SHORTLIST, REJECT, MOVE_TO_INTERVIEW, or ADD_NOTES.');
    }

    const result = await RankingService.executeCandidateAction(
      applicationId,
      action,
      notes,
      recruiterId
    );

    return ApiResponse.success({
      res,
      data: result,
      message: `Action "${action}" executed successfully.`,
    });
  });
}
