import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { InterviewService } from '../services/interviewService.js';
import { ApiError } from '../utils/apiError.js';

export class InterviewController {
  static getInterviews = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const interviews = await InterviewService.getInterviews(req.user.id, req.user.role);
    return ApiResponse.success({
      res,
      message: 'Interviews retrieved successfully',
      data: { interviews },
    });
  });

  static createInterview = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const interview = await InterviewService.createInterview(req.user.id, req.body);
    return ApiResponse.created({
      res,
      message: 'Interview session scheduled successfully',
      data: { interview },
    });
  });

  static updateStatus = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized('Authentication required');

    const { id } = req.params;
    const { status } = req.body;
    const interview = await InterviewService.updateStatus(id, req.user.id, req.user.role, status);

    return ApiResponse.success({
      res,
      message: `Interview status updated to ${status}`,
      data: { interview },
    });
  });
}
