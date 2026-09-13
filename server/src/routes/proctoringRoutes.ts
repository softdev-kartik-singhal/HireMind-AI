import { Router } from 'express';
import { ProctoringController } from '../controllers/proctoringController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

// All proctoring routes require valid authentication
router.use(authenticate);

router.post('/events', ProctoringController.recordEvents);
router.get('/interviews/:interviewId/events', ProctoringController.getTimeline);

export const proctoringRoutes = router;
