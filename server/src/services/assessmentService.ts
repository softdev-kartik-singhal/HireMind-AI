import { prisma } from '../config/prisma.js';
import { UserRoleType, USER_ROLES } from '../constants/roles.js';
import { Prisma } from '@prisma/client';

export class AssessmentService {
  /**
   * Get coding tests for candidate
   */
  static async getTests(userId: string, userRole: UserRoleType) {
    const where: Prisma.CodingTestWhereInput = {};
    if (userRole === USER_ROLES.CANDIDATE) {
      where.candidateId = userId;
    }

    const tests = await prisma.codingTest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          select: { id: true, title: true, department: true },
        },
      },
    });

    return tests;
  }

  /**
   * Get assessment scorecard results for candidate
   */
  static async getResults(userId: string, userRole: UserRoleType) {
    const where: Prisma.AssessmentResultWhereInput = {};
    if (userRole === USER_ROLES.CANDIDATE) {
      where.candidateId = userId;
    } else if (userRole === USER_ROLES.RECRUITER) {
      where.evaluatorId = userId;
    }

    const results = await prisma.assessmentResult.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        evaluator: {
          select: { id: true, name: true, email: true },
        },
        candidate: {
          select: { id: true, name: true, email: true },
        },
        application: {
          include: {
            job: {
              select: { id: true, title: true, department: true },
            },
          },
        },
      },
    });

    return results;
  }
}
