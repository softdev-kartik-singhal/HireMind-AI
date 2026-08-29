import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { UserService } from '../services/userService.js';
import { ApiError } from '../utils/apiError.js';
import { UserRoleType } from '../constants/roles.js';

export class UserController {
  /**
   * Get user profile
   * GET /api/v1/users/profile
   */
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const profile = await UserService.getProfile(req.user.id);

    return ApiResponse.success({
      res,
      message: 'Profile retrieved successfully',
      data: { user: profile },
    });
  });

  /**
   * Update user profile
   * PUT /api/v1/users/profile
   */
  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const updatedProfile = await UserService.updateProfile(req.user.id, req.body);

    return ApiResponse.success({
      res,
      message: 'Profile updated successfully',
      data: { user: updatedProfile },
    });
  });

  /**
   * Get all users (Admin only)
   * GET /api/v1/users
   */
  static getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const role = req.query.role as UserRoleType | undefined;
    const search = req.query.search as string | undefined;

    const result = await UserService.getAllUsers({ page, limit, role, search });

    return ApiResponse.success({
      res,
      message: 'Users retrieved successfully',
      data: result.users,
      meta: result.pagination,
    });
  });

  /**
   * Delete user by ID (Admin only)
   * DELETE /api/v1/users/:id
   */
  static deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (req.user?.id === id) {
      throw ApiError.badRequest('You cannot delete your own account via this endpoint');
    }

    await UserService.deleteUser(id);

    return ApiResponse.success({
      res,
      message: 'User deleted successfully',
    });
  });
}
