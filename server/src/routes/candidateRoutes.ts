import { Router } from 'express';
import { resumeController } from '../controllers/resume.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { resumeIdParamSchema } from '../validations/resumeValidations.js';

const router = Router();

/**
 * Get structured candidate profile by candidate user ID.
 * Accessible by candidate themselves, recruiters, and admins.
 */
router.get(
  '/:id/profile',
  authenticate,
  validateRequest(resumeIdParamSchema),
  resumeController.getCandidateProfile
);

export const candidateRoutes = router;
