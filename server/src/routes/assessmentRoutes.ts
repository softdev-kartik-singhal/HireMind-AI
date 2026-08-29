import { Router } from 'express';
import { AssessmentController } from '../controllers/assessmentController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/tests', AssessmentController.getTests);
router.get('/results', AssessmentController.getResults);

export const assessmentRoutes = router;
