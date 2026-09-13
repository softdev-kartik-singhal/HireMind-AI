import { Router } from 'express';
import { resumeController } from '../controllers/resume.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { uploadResumeMiddleware } from '../middlewares/uploadMiddleware.js';
import {
  resumeIdParamSchema,
  updatePrimaryResumeSchema,
} from '../validations/resumeValidations.js';
import { USER_ROLES } from '../constants/roles.js';

const router = Router();

// Upload a new resume (Candidates only)
router.post(
  '/upload',
  authenticate,
  authorize(USER_ROLES.CANDIDATE),
  uploadResumeMiddleware,
  resumeController.uploadResume
);

// Get all resumes of the current candidate
router.get(
  '/',
  authenticate,
  authorize(USER_ROLES.CANDIDATE),
  resumeController.getMyResumes
);

// View resume PDF inline (stream for preview - Candidate, Recruiter, Admin)
router.get(
  '/:id/view',
  authenticate,
  validateRequest(resumeIdParamSchema),
  resumeController.viewResume
);

// Download resume PDF file (attachment stream - Candidate, Recruiter, Admin)
router.get(
  '/:id/download',
  authenticate,
  validateRequest(resumeIdParamSchema),
  resumeController.downloadResume
);

// Set primary resume (Candidates only)
router.patch(
  '/:id/primary',
  authenticate,
  authorize(USER_ROLES.CANDIDATE),
  validateRequest(updatePrimaryResumeSchema),
  resumeController.setPrimaryResume
);

// Delete resume (Candidates only)
router.delete(
  '/:id',
  authenticate,
  authorize(USER_ROLES.CANDIDATE),
  validateRequest(resumeIdParamSchema),
  resumeController.deleteResume
);

// Parse resume with AI (Candidates and Admins)
router.post(
  '/:id/parse',
  authenticate,
  validateRequest(resumeIdParamSchema),
  resumeController.parseResume
);

// Get resume metadata
router.get(
  '/:id',
  authenticate,
  validateRequest(resumeIdParamSchema),
  resumeController.getResumeById
);

export const resumeRoutes = router;
