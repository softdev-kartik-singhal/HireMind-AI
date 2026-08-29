import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { JobService } from '../services/jobService.js';
import { ApiError } from '../utils/apiError.js';
import { JobStatusType } from '../validations/jobValidations.js';

export class JobController {
  /**
   * Create Job (Recruiter / Admin)
   * POST /api/v1/jobs
   */
  static createJob = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const job = await JobService.createJob(req.user.id, req.body);

    return ApiResponse.created({
      res,
      message: 'Job requisition created successfully',
      data: { job },
    });
  });

  /**
   * Get filtered jobs
   * GET /api/v1/jobs
   */
  static getJobs = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as import('../validations/jobValidations.js').GetJobsQuery;
    const result = await JobService.getJobs(query, req.user?.role, req.user?.id);

    return ApiResponse.success({
      res,
      message: 'Jobs retrieved successfully',
      data: result.jobs,
      meta: result.pagination,
    });
  });

  /**
   * Get single job by ID
   * GET /api/v1/jobs/:id
   */
  static getJobById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const job = await JobService.getJobById(id, req.user?.id);

    return ApiResponse.success({
      res,
      message: 'Job details retrieved successfully',
      data: { job },
    });
  });

  /**
   * Update Job (Recruiter owner / Admin)
   * PUT /api/v1/jobs/:id
   */
  static updateJob = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const { id } = req.params;
    const job = await JobService.updateJob(id, req.user.id, req.user.role, req.body);

    return ApiResponse.success({
      res,
      message: 'Job requisition updated successfully',
      data: { job },
    });
  });

  /**
   * Update Job Status
   * PATCH /api/v1/jobs/:id/status
   */
  static updateJobStatus = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const { id } = req.params;
    const { status } = req.body;

    const job = await JobService.updateJobStatus(
      id,
      req.user.id,
      req.user.role,
      status as JobStatusType
    );

    return ApiResponse.success({
      res,
      message: `Job status updated to ${status}`,
      data: { job },
    });
  });

  /**
   * Delete Job
   * DELETE /api/v1/jobs/:id
   */
  static deleteJob = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const { id } = req.params;
    await JobService.deleteJob(id, req.user.id, req.user.role);

    return ApiResponse.success({
      res,
      message: 'Job requisition deleted successfully',
    });
  });

  /**
   * Get applicants for job
   * GET /api/v1/jobs/:id/applications
   */
  static getJobApplicants = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const { id } = req.params;
    const applicants = await JobService.getJobApplicants(id, req.user.id, req.user.role);

    return ApiResponse.success({
      res,
      message: 'Applicants retrieved successfully',
      data: { applicants },
    });
  });
}
