import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/recruiter', AnalyticsController.getRecruiterAnalytics);
router.get('/candidate', AnalyticsController.getCandidateAnalytics);
router.get('/admin', AnalyticsController.getAdminAnalytics);

export const analyticsRoutes = router;
