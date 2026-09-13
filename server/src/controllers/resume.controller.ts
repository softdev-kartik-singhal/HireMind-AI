import { Request, Response, NextFunction } from 'express';
import { resumeService } from '../services/resume.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';

export class ResumeController {
  /**
   * Upload a new resume PDF for the authenticated candidate.
   */
  async uploadResume(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw ApiError.badRequest('No resume file was uploaded.');
      }

      const candidateId = req.user!.id;
      const setPrimary = req.query.setPrimary === 'true' || req.query.setPrimary === '1';

      const resume = await resumeService.uploadResume(candidateId, req.file, {
        setPrimary,
      });

      return ApiResponse.created({
        res,
        message: `Resume ${resume.fileName} (v${resume.version}) uploaded successfully.`,
        data: resume,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all resumes uploaded by the authenticated candidate.
   */
  async getMyResumes(req: Request, res: Response, next: NextFunction) {
    try {
      const candidateId = req.user!.id;
      const resumes = await resumeService.getUserResumes(candidateId);

      return ApiResponse.success({
        res,
        message: 'Resumes retrieved successfully.',
        data: resumes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get metadata for a specific resume by ID.
   */
  async getResumeById(req: Request, res: Response, next: NextFunction) {
    try {
      const resumeId = req.params.id;
      const resume = await resumeService.getResumeById(resumeId, {
        id: req.user!.id,
        role: req.user!.role,
      });

      return ApiResponse.success({
        res,
        message: 'Resume details retrieved successfully.',
        data: resume,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * View resume inline (for browser PDF previewer without downloading file).
   */
  async viewResume(req: Request, res: Response, next: NextFunction) {
    try {
      const resumeId = req.params.id;
      const { stream, resume } = await resumeService.getResumeFileStream(
        resumeId,
        {
          id: req.user!.id,
          role: req.user!.role,
        }
      );

      res.setHeader('Content-Type', resume.mimeType || 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${encodeURIComponent(resume.fileName)}"`
      );
      res.setHeader('Content-Length', resume.fileSize);
      res.setHeader('Cache-Control', 'private, no-transform, max-age=1800');

      stream.on('error', (streamErr) => {
        if (!res.headersSent) {
          next(streamErr);
        }
      });

      stream.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download resume as an attachment file.
   */
  async downloadResume(req: Request, res: Response, next: NextFunction) {
    try {
      const resumeId = req.params.id;
      const { stream, resume } = await resumeService.getResumeFileStream(
        resumeId,
        {
          id: req.user!.id,
          role: req.user!.role,
        }
      );

      res.setHeader('Content-Type', resume.mimeType || 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(resume.fileName)}"`
      );
      res.setHeader('Content-Length', resume.fileSize);

      stream.on('error', (streamErr) => {
        if (!res.headersSent) {
          next(streamErr);
        }
      });

      stream.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Set a specific resume as the primary version for job applications.
   */
  async setPrimaryResume(req: Request, res: Response, next: NextFunction) {
    try {
      const resumeId = req.params.id;
      const candidateId = req.user!.id;

      const updatedResume = await resumeService.setPrimaryResume(
        resumeId,
        candidateId
      );

      return ApiResponse.success({
        res,
        message: `Version ${updatedResume.version} is now your primary resume.`,
        data: updatedResume,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a resume.
   */
  async deleteResume(req: Request, res: Response, next: NextFunction) {
    try {
      const resumeId = req.params.id;
      const candidateId = req.user!.id;

      const result = await resumeService.deleteResume(resumeId, candidateId);

      return ApiResponse.success({
        res,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Trigger AI Parsing for a resume (POST /api/v1/resumes/:id/parse).
   */
  async parseResume(req: Request, res: Response, next: NextFunction) {
    try {
      const resumeId = req.params.id;
      const result = await resumeService.parseResume(resumeId, {
        id: req.user!.id,
        role: req.user!.role,
      });

      return ApiResponse.success({
        res,
        message: 'Resume parsed and candidate profile synchronized successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get structured candidate profile (GET /api/v1/candidates/:id/profile).
   */
  async getCandidateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const candidateId = req.params.id;
      const profile = await resumeService.getCandidateProfile(candidateId, {
        id: req.user!.id,
        role: req.user!.role,
      });

      return ApiResponse.success({
        res,
        message: 'Candidate profile retrieved successfully.',
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const resumeController = new ResumeController();
