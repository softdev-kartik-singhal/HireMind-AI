import { Router } from 'express';
import { RankingController } from '../controllers/rankingController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { USER_ROLES } from '../constants/roles.js';

const router = Router();

// Recruiter & Admin candidate ranking routes
router.use(authenticate);
router.use(authorize(USER_ROLES.RECRUITER, USER_ROLES.ADMIN));

// Get rankings for a job
router.get('/jobs/:jobId', RankingController.getJobRankings);

// Save custom weights for a job
router.post('/jobs/:jobId/weights', RankingController.saveJobWeights);

// Pipeline actions (SHORTLIST, REJECT, MOVE_TO_INTERVIEW, ADD_NOTES)
router.post('/applications/:applicationId/action', RankingController.executeCandidateAction);

export const rankingRoutes = router;
