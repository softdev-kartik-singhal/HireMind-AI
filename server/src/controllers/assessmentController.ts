import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AssessmentService } from '../services/assessmentService.js';
import { ApiError } from '../utils/apiError.js';

export class AssessmentController {
  static getTests = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const tests = await AssessmentService.getTests(req.user.id, req.user.role);
    return ApiResponse.success({
      res,
      message: 'Coding tests retrieved successfully',
      data: { tests },
    });
  });

  static getResults = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const results = await AssessmentService.getResults(req.user.id, req.user.role);
    return ApiResponse.success({
      res,
      message: 'Assessment scorecards retrieved successfully',
      data: { results },
    });
  });
}
