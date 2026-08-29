import { Router } from 'express';
import { ApplicationController } from '../controllers/applicationController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  createApplicationSchema,
  updateApplicationStatusSchema,
} from '../validations/applicationValidations.js';
import { USER_ROLES } from '../constants/roles.js';

const router = Router();

// Candidate Application submission & history
router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.CANDIDATE),
  validateRequest(createApplicationSchema),
  ApplicationController.apply
);

router.get(
  '/my',
  authenticate,
  authorize(USER_ROLES.CANDIDATE),
  ApplicationController.getMyApplications
);

// Single Application Details
router.get('/:id', authenticate, ApplicationController.getApplicationById);

// Recruiter / Admin Candidate Status Updates
router.patch(
  '/:id/status',
  authenticate,
  authorize(USER_ROLES.RECRUITER, USER_ROLES.ADMIN),
  validateRequest(updateApplicationStatusSchema),
  ApplicationController.updateStatus
);

export const applicationRoutes = router;
