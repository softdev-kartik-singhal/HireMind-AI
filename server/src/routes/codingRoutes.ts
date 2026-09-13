import { Router } from 'express';
import { CodingController } from '../controllers/codingController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  runCodeSchema,
  submitCodeSchema,
} from '../validations/codingValidations.js';

const router = Router();

router.use(authenticate);

// Run code in safe sandboxed environment
router.post('/run', validateRequest(runCodeSchema), CodingController.runCode);

// Submit solution and persist submission record
router.post('/submit', validateRequest(submitCodeSchema), CodingController.submitCode);

// Get question details and submission history
router.get('/questions', CodingController.getQuestions);
router.get('/questions/:id', CodingController.getQuestionById);
router.get('/submissions', CodingController.getSubmissions);

export const codingRoutes = router;
