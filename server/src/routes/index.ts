import { Router } from 'express';
import { authRoutes } from './authRoutes.js';
import { userRoutes } from './userRoutes.js';
import { healthRoutes } from './healthRoutes.js';
import { jobRoutes } from './jobRoutes.js';
import { applicationRoutes } from './applicationRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);

export const apiRouter = router;
