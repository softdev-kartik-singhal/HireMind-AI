import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { updateProfileSchema } from '../validations/userValidations.js';
import { USER_ROLES } from '../constants/roles.js';

const router = Router();

// Profile management (Authenticated - all roles: CANDIDATE, RECRUITER, ADMIN)
router.get('/profile', authenticate, UserController.getProfile);
router.put(
  '/profile',
  authenticate,
  validateRequest(updateProfileSchema),
  UserController.updateProfile
);

// Admin-only management endpoints
router.get(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  UserController.getAllUsers
);

router.delete(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  UserController.deleteUser
);

export const userRoutes = router;
