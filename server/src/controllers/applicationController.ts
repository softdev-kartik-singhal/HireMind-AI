import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApplicationService } from '../services/applicationService.js';
import { ApiError } from '../utils/apiError.js';

export class ApplicationController {
  /**
   * Apply for Job (Candidate only)
   * POST /api/v1/applications
   */
  static apply = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const application = await ApplicationService.applyForJob(req.user.id, req.body);

    return ApiResponse.created({
      res,
      message: 'Application submitted successfully',
      data: { application },
    });
  });

  /**
   * Get Candidate's Applications
   * GET /api/v1/applications/my
   */
  static getMyApplications = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const applications = await ApplicationService.getMyApplications(req.user.id);

    return ApiResponse.success({
      res,
      message: 'Applications retrieved successfully',
      data: { applications },
    });
  });

  /**
   * Get single application
   * GET /api/v1/applications/:id
   */
  static getApplicationById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const { id } = req.params;
    const application = await ApplicationService.getApplicationById(
      id,
      req.user.id,
      req.user.role
    );

    return ApiResponse.success({
      res,
      message: 'Application details retrieved successfully',
      data: { application },
    });
  });

  /**
   * Update Application Stage/Status (Recruiter / Admin)
   * PATCH /api/v1/applications/:id/status
   */
  static updateStatus = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const { id } = req.params;
    const application = await ApplicationService.updateStatus(
      id,
      req.user.id,
      req.user.role,
      req.body
    );

    return ApiResponse.success({
      res,
      message: `Candidate stage updated to ${application.status}`,
      data: { application },
    });
  });
}
