import { Router } from 'express';
import { authRoutes } from './authRoutes.js';
import { userRoutes } from './userRoutes.js';
import { healthRoutes } from './healthRoutes.js';
import { jobRoutes } from './jobRoutes.js';
import { applicationRoutes } from './applicationRoutes.js';
import { interviewRoutes } from './interviewRoutes.js';
import { assessmentRoutes } from './assessmentRoutes.js';
import { notificationRoutes } from './notificationRoutes.js';
import { analyticsRoutes } from './analyticsRoutes.js';
import { resumeRoutes } from './resumeRoutes.js';
import { candidateRoutes } from './candidateRoutes.js';
import { codingRoutes } from './codingRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/interviews', interviewRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/resumes', resumeRoutes);
router.use('/candidates', candidateRoutes);
router.use('/coding', codingRoutes);

export const apiRouter = router;
