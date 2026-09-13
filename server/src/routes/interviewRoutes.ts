import { Router } from 'express';
import { InterviewController } from '../controllers/interviewController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { USER_ROLES } from '../constants/roles.js';
import {
  createInterviewSchema,
  updateInterviewStatusSchema,
  updateSessionProgressSchema,
  submitQuestionResponseSchema,
  createCustomQuestionSchema,
  updateQuestionSchema,
  reorderQuestionsSchema,
  generateQuestionsQuerySchema,
} from '../validations/interviewValidations.js';

const router = Router();

router.use(authenticate);

// Interview listing and details
router.get('/', InterviewController.getInterviews);
router.get('/:id', InterviewController.getInterviewById);

// Recruiter interview creation & management
router.post(
  '/',
  authorize(USER_ROLES.RECRUITER, USER_ROLES.ADMIN),
  validateRequest(createInterviewSchema),
  InterviewController.createInterview
);

router.patch(
  '/:id/status',
  authorize(USER_ROLES.RECRUITER, USER_ROLES.ADMIN),
  validateRequest(updateInterviewStatusSchema),
  InterviewController.updateStatus
);

router.delete(
  '/:id',
  authorize(USER_ROLES.RECRUITER, USER_ROLES.ADMIN),
  InterviewController.deleteInterview
);

// Recruiter question review & management endpoints
router.get('/:id/questions', InterviewController.getQuestions);

router.post(
  '/:id/questions/generate',
  authorize(USER_ROLES.RECRUITER, USER_ROLES.ADMIN),
  validateRequest(generateQuestionsQuerySchema),
  InterviewController.generateQuestions
);

router.post(
  '/:id/questions',
  authorize(USER_ROLES.RECRUITER, USER_ROLES.ADMIN),
  validateRequest(createCustomQuestionSchema),
  InterviewController.addQuestion
);

router.patch(
  '/:id/questions/:questionId',
  authorize(USER_ROLES.RECRUITER, USER_ROLES.ADMIN),
  validateRequest(updateQuestionSchema),
  InterviewController.updateQuestion
);

router.delete(
  '/:id/questions/:questionId',
  authorize(USER_ROLES.RECRUITER, USER_ROLES.ADMIN),
  InterviewController.deleteQuestion
);

router.put(
  '/:id/questions/reorder',
  authorize(USER_ROLES.RECRUITER, USER_ROLES.ADMIN),
  validateRequest(reorderQuestionsSchema),
  InterviewController.reorderQuestions
);

// Candidate interview session state endpoints (survives page reload)
router.post('/:id/session/start', InterviewController.startSession);
router.get('/:id/session', InterviewController.getSession);
router.put(
  '/:id/session/progress',
  validateRequest(updateSessionProgressSchema),
  InterviewController.saveProgress
);
router.post(
  '/:id/questions/:questionId/submit',
  validateRequest(submitQuestionResponseSchema),
  InterviewController.submitQuestion
);
router.post('/:id/session/complete', InterviewController.completeSession);

export const interviewRoutes = router;
