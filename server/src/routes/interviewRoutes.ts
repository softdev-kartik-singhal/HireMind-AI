import { Router } from 'express';
import { InterviewController } from '../controllers/interviewController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { USER_ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

router.get('/', InterviewController.getInterviews);
router.post('/', authorize(USER_ROLES.RECRUITER, USER_ROLES.ADMIN), InterviewController.createInterview);
router.patch('/:id/status', InterviewController.updateStatus);

export const interviewRoutes = router;
