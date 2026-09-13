import { Router } from 'express';
import { EvaluationController } from '../controllers/evaluationController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

// All evaluation routes require authentication
router.use(authenticate);

// Get cached evaluation or generate if missing
router.get('/interviews/:interviewId', EvaluationController.getEvaluation);

// Explicitly trigger evaluation generation
router.post('/interviews/:interviewId/generate', EvaluationController.generateEvaluation);

// Recruiter manual override of recommendation & notes
router.patch('/interviews/:interviewId/override', EvaluationController.overrideEvaluation);

export const evaluationRoutes = router;
