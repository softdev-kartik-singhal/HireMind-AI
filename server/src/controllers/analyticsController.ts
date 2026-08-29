import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AnalyticsService } from '../services/analyticsService.js';
import { ApiError } from '../utils/apiError.js';
import { USER_ROLES } from '../constants/roles.js';

export class AnalyticsController {
  static getRecruiterAnalytics = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const recruiterId = req.user.role === USER_ROLES.ADMIN ? undefined : req.user.id;
    const analytics = await AnalyticsService.getRecruiterAnalytics(recruiterId);
    return ApiResponse.success({
      res,
      message: 'Recruiter analytics retrieved successfully',
      data: { analytics },
    });
  });

  static getCandidateAnalytics = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const analytics = await AnalyticsService.getCandidateAnalytics(req.user.id);
    return ApiResponse.success({
      res,
      message: 'Candidate analytics retrieved successfully',
      data: { analytics },
    });
  });

  static getAdminAnalytics = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const analytics = await AnalyticsService.getAdminAnalytics();
    return ApiResponse.success({
      res,
      message: 'Admin platform analytics retrieved successfully',
      data: { analytics },
    });
  });
}
