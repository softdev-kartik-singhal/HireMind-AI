import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { UpdateProfileInput } from '../validations/userValidations.js';
import { UserRoleType } from '../constants/roles.js';

export class UserService {
  /**
   * Get user profile by ID
   */
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        headline: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.avatar !== undefined && { avatar: input.avatar }),
        ...(input.bio !== undefined && { bio: input.bio }),
        ...(input.headline !== undefined && { headline: input.headline }),
        ...(input.phone !== undefined && { phone: input.phone }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        headline: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Get all users (Admin only)
   */
  static async getAllUsers(params: {
    page?: number;
    limit?: number;
    role?: UserRoleType;
    search?: string;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 10));
    const skip = (page - 1) * limit;

    const whereClause: {
      role?: UserRoleType;
      OR?: Array<{ name?: { contains: string; mode: 'insensitive' }; email?: { contains: string; mode: 'insensitive' } }>;
    } = {};

    if (params.role) {
      whereClause.role = params.role;
    }

    if (params.search) {
      whereClause.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where: whereClause }),
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Delete user account (Admin only)
   */
  static async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return true;
  }
}
