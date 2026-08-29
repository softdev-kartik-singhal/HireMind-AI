import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/', NotificationController.getNotifications);
router.patch('/:id/read', NotificationController.markRead);
router.patch('/read-all', NotificationController.markAllRead);

export const notificationRoutes = router;
