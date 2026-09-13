import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { EvaluationService } from '../services/evaluationService.js';
import { recruiterOverrideSchema } from '../validations/evaluationValidations.js';

export class EvaluationController {
  /**
   * Get or generate interview evaluation
   * GET /api/v1/evaluations/interviews/:interviewId
   */
  static getEvaluation = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const { interviewId } = req.params;
    if (!interviewId) {
      throw ApiError.badRequest('interviewId parameter is required');
    }

    const force = req.query.force === 'true';
    const evaluation = await EvaluationService.getOrGenerateEvaluation(
      interviewId,
      req.user.id,
      force
    );

    return ApiResponse.success({
      res,
      message: 'Interview evaluation retrieved successfully',
      data: evaluation,
    });
  });

  /**
   * Explicitly force AI generation of interview evaluation
   * POST /api/v1/evaluations/interviews/:interviewId/generate
   */
  static generateEvaluation = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const { interviewId } = req.params;
    if (!interviewId) {
      throw ApiError.badRequest('interviewId parameter is required');
    }

    const evaluation = await EvaluationService.getOrGenerateEvaluation(
      interviewId,
      req.user.id,
      true
    );

    return ApiResponse.success({
      res,
      message: 'Interview evaluation generated successfully',
      data: evaluation,
    });
  });

  /**
   * Recruiter manual override of evaluation recommendation and notes
   * PATCH /api/v1/evaluations/interviews/:interviewId/override
   */
  static overrideEvaluation = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const { interviewId } = req.params;
    if (!interviewId) {
      throw ApiError.badRequest('interviewId parameter is required');
    }

    const parsed = recruiterOverrideSchema.parse(req.body);
    const updated = await EvaluationService.overrideEvaluation(
      interviewId,
      req.user.id,
      parsed
    );

    return ApiResponse.success({
      res,
      message: 'Evaluation recommendation overridden successfully',
      data: updated,
    });
  });
}
