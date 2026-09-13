import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { JobMatchService } from '../services/jobMatch.service.js';

export class JobMatchController {
  /**
   * Get or evaluate candidate-to-job match analysis.
   * GET /api/v1/jobs/:jobId/matches/:candidateId
   * Query: ?forceRefresh=true
   */
  static getCandidateJobMatch = asyncHandler(async (req: Request, res: Response) => {
    const { jobId, candidateId } = req.params;
    const forceRefresh = req.query.forceRefresh === 'true';

    if (!jobId || !candidateId) {
      throw ApiError.badRequest('Both jobId and candidateId are required');
    }

    const result = await JobMatchService.getOrCalculateMatch(jobId, candidateId, {
      forceRefresh,
    });

    return ApiResponse.success({
      res,
      message: result.cached
        ? 'Retrieved cached candidate match evaluation'
        : 'Generated new AI resume-to-job match evaluation',
      data: {
        cached: result.cached,
        match: result.match,
      },
    });
  });

  /**
   * Get all evaluated candidate matches for a job requisition.
   * GET /api/v1/jobs/:jobId/matches
   */
  static getJobMatches = asyncHandler(async (req: Request, res: Response) => {
    const { jobId } = req.params;

    if (!jobId) {
      throw ApiError.badRequest('jobId is required');
    }

    const matches = await JobMatchService.getJobMatchesForJob(jobId);

    return ApiResponse.success({
      res,
      message: 'Job candidate matches retrieved successfully',
      data: { matches },
    });
  });
}
