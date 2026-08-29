import { Router, Request, Response, NextFunction } from 'express';
import { JobController } from '../controllers/jobController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  createJobSchema,
  updateJobSchema,
  updateJobStatusSchema,
  getJobsQuerySchema,
} from '../validations/jobValidations.js';
import { USER_ROLES } from '../constants/roles.js';

const router = Router();

// Middleware helper to optionally authenticate if token exists (for candidate applied status)
const optionalAuthenticate = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers.authorization || req.cookies?.accessToken) {
    return authenticate(req, res, (_err?: unknown) => {
      // If token invalid, proceed unauthenticated rather than blocking public job browsing
      next();
    });
  }
  next();
};

// Public / Candidate Browsing
router.get('/', optionalAuthenticate, validateRequest(getJobsQuerySchema), JobController.getJobs);
router.get('/:id', optionalAuthenticate, JobController.getJobById);

// Recruiter & Admin Job Operations
router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.RECRUITER, USER_ROLES.ADMIN),
  validateRequest(createJobSchema),
  JobController.createJob
);

router.put(
  '/:id',
  authenticate,
  authorize(USER_ROLES.RECRUITER, USER_ROLES.ADMIN),
  validateRequest(updateJobSchema),
  JobController.updateJob
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(USER_ROLES.RECRUITER, USER_ROLES.ADMIN),
  validateRequest(updateJobStatusSchema),
  JobController.updateJobStatus
);

router.delete(
  '/:id',
  authenticate,
  authorize(USER_ROLES.RECRUITER, USER_ROLES.ADMIN),
  JobController.deleteJob
);

router.get(
  '/:id/applications',
  authenticate,
  authorize(USER_ROLES.RECRUITER, USER_ROLES.ADMIN),
  JobController.getJobApplicants
);

export const jobRoutes = router;
