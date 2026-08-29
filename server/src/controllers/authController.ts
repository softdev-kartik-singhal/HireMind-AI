import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AuthService } from '../services/authService.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? ('strict' as const) : ('lax' as const),
  path: '/',
};

const ACCESS_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const REFRESH_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  /**
   * Register a new user
   * POST /api/v1/auth/register
   */
  static register = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);

    // Set HTTP-only cookies
    res.cookie('accessToken', result.accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

    return ApiResponse.created({
      res,
      message: 'Account registered successfully',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  });

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  static login = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body);

    // Set HTTP-only cookies
    res.cookie('accessToken', result.accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

    return ApiResponse.success({
      res,
      message: 'Logged in successfully',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  });

  /**
   * Refresh token
   * POST /api/v1/auth/refresh
   */
  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    const result = await AuthService.refreshTokens(token);

    // Set new HTTP-only cookies
    res.cookie('accessToken', result.accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);

    return ApiResponse.success({
      res,
      message: 'Token refreshed successfully',
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  });

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  static logout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (req.user) {
      await AuthService.logout(req.user.id, refreshToken);
    }

    // Clear HTTP-only cookies
    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);

    return ApiResponse.success({
      res,
      message: 'Logged out successfully',
    });
  });

  /**
   * Get current user
   * GET /api/v1/auth/me
   */
  static getMe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const user = await AuthService.getCurrentUser(req.user.id);

    return ApiResponse.success({
      res,
      message: 'Current user profile retrieved',
      data: { user },
    });
  });

  /**
   * Request password reset
   * POST /api/v1/auth/forgot-password
   */
  static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.forgotPassword(req.body);

    return ApiResponse.success({
      res,
      message: result.message,
      data: result,
    });
  });

  /**
   * Reset password
   * POST /api/v1/auth/reset-password
   */
  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.resetPassword(req.body);

    // Clear cookies upon password reset to require fresh login
    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);

    return ApiResponse.success({
      res,
      message: result.message,
    });
  });

  /**
   * Change password for logged in user
   * POST /api/v1/auth/change-password
   */
  static changePassword = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }

    const result = await AuthService.changePassword(req.user.id, req.body);

    // Clear cookies to force re-login
    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);

    return ApiResponse.success({
      res,
      message: result.message,
    });
  });
}
