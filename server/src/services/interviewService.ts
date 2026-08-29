import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { InterviewStatus, InterviewType, Prisma } from '@prisma/client';
import { UserRoleType, USER_ROLES } from '../constants/roles.js';

export interface CreateInterviewInput {
  title: string;
  type?: InterviewType;
  scheduledAt: string;
  durationMins?: number;
  jobId: string;
  candidateId: string;
  applicationId?: string;
  notes?: string;
}

export class InterviewService {
  /**
   * Get interviews for current user (Candidate, Recruiter, or Admin)
   */
  static async getInterviews(userId: string, userRole: UserRoleType) {
    const where: Prisma.InterviewWhereInput = {};

    if (userRole === USER_ROLES.CANDIDATE) {
      where.candidateId = userId;
    } else if (userRole === USER_ROLES.RECRUITER) {
      where.recruiterId = userId;
    }
    // Admin sees all interviews

    const interviews = await prisma.interview.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            headline: true,
            phone: true,
          },
        },
        recruiter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            location: true,
          },
        },
      },
    });

    return interviews;
  }

  /**
   * Schedule new interview session (Recruiter or Admin)
   */
  static async createInterview(recruiterId: string, input: CreateInterviewInput) {
    const chamberRoomId = `room-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const meetingLink = `https://hiremind.ai/room/${chamberRoomId}`;

    const interview = await prisma.interview.create({
      data: {
        title: input.title,
        type: input.type || InterviewType.TECHNICAL,
        status: InterviewStatus.SCHEDULED,
        scheduledAt: new Date(input.scheduledAt),
        durationMins: input.durationMins || 60,
        meetingLink,
        chamberRoomId,
        notes: input.notes || null,
        jobId: input.jobId,
        candidateId: input.candidateId,
        recruiterId,
        applicationId: input.applicationId || null,
      },
      include: {
        candidate: {
          select: { id: true, name: true, email: true },
        },
        job: {
          select: { id: true, title: true },
        },
      },
    });

    // Notify candidate in database
    await prisma.notification.create({
      data: {
        userId: input.candidateId,
        title: 'New Technical Interview Scheduled',
        message: `Your interview for "${interview.job.title}" has been scheduled.`,
        type: 'INTERVIEW',
        link: `/dashboard?tab=interviews`,
      },
    });

    return interview;
  }

  /**
   * Update interview status
   */
  static async updateStatus(
    id: string,
    userId: string,
    userRole: UserRoleType,
    status: InterviewStatus
  ) {
    const existing = await prisma.interview.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound('Interview session not found');
    }

    if (userRole !== USER_ROLES.ADMIN && existing.recruiterId !== userId && existing.candidateId !== userId) {
      throw ApiError.forbidden('You do not have access to this interview session');
    }

    const updated = await prisma.interview.update({
      where: { id },
      data: { status },
    });

    return updated;
  }
}
