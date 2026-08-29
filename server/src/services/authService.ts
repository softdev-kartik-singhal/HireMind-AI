import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/apiError.js';
import { TokenService } from './tokenService.js';
import { UserRoleType } from '../constants/roles.js';
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from '../validations/authValidations.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

const BCRYPT_SALT_ROUNDS = 12;

export class AuthService {
  /**
   * Register a new user
   */
  static async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate tokens
    const accessToken = TokenService.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role as UserRoleType,
    });
    const refreshToken = TokenService.generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role as UserRoleType,
    });

    // Save refresh token hash
    const tokenHash = TokenService.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    logger.info(`User registered successfully: ${user.email} (${user.role})`);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Log in user
   */
  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const accessToken = TokenService.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role as UserRoleType,
    });
    const refreshToken = TokenService.generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role as UserRoleType,
    });

    // Store refresh token
    const tokenHash = TokenService.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRoleType,
      avatar: user.avatar,
      bio: user.bio,
      headline: user.headline,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    logger.info(`User logged in: ${user.email} (${user.role})`);

    return {
      user: userResponse,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh authentication token with token rotation
   */
  static async refreshTokens(refreshToken: string) {
    if (!refreshToken) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    try {
      TokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const tokenHash = TokenService.hashToken(refreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      // Possible token reuse attack detected -> revoke all tokens for this user
      if (storedToken?.userId) {
        await prisma.refreshToken.updateMany({
          where: { userId: storedToken.userId },
          data: { revoked: true },
        });
      }
      throw ApiError.unauthorized('Invalid or revoked refresh token');
    }

    const user = storedToken.user;

    // Revoke old refresh token (Rotation)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    // Issue new tokens
    const newAccessToken = TokenService.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role as UserRoleType,
    });
    const newRefreshToken = TokenService.generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role as UserRoleType,
    });

    const newTokenHash = TokenService.hashToken(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newTokenHash,
        expiresAt: newExpiresAt,
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  /**
   * Log out user and revoke active refresh token
   */
  static async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = TokenService.hashToken(refreshToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash, userId },
        data: { revoked: true },
      });
    } else {
      // Revoke all user refresh tokens
      await prisma.refreshToken.updateMany({
        where: { userId },
        data: { revoked: true },
      });
    }

    logger.info(`User logged out: ${userId}`);
    return true;
  }

  /**
   * Request password reset token
   */
  static async forgotPassword(input: ForgotPasswordInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    // To prevent email enumeration, return success message even if email not found
    if (!user) {
      logger.info(`Password reset requested for non-existent email: ${input.email}`);
      return {
        message: 'If an account with this email exists, password reset instructions have been sent.',
      };
    }

    const resetToken = TokenService.generatePasswordResetToken(user);
    const tokenHash = TokenService.hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const resetUrl = `${env.APP_URL}/reset-password?token=${resetToken}`;
    logger.info(`Password reset generated for ${user.email}. Reset URL: ${resetUrl}`);

    return {
      message: 'If an account with this email exists, password reset instructions have been sent.',
      // Providing resetToken in dev/testing mode for convenience
      ...(env.NODE_ENV !== 'production' && { resetToken, resetUrl }),
    };
  }

  /**
   * Reset password with valid token
   */
  static async resetPassword(input: ResetPasswordInput) {
    try {
      TokenService.verifyPasswordResetToken(input.token);
    } catch {
      throw ApiError.badRequest('Invalid or expired password reset token');
    }

    const tokenHash = TokenService.hashToken(input.token);

    const storedToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.usedAt || storedToken.expiresAt < new Date()) {
      throw ApiError.badRequest('Password reset token has expired or has already been used');
    }

    const newPasswordHash = await bcrypt.hash(input.newPassword, BCRYPT_SALT_ROUNDS);

    // Update password and mark token used in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: storedToken.userId },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: storedToken.id },
        data: { usedAt: new Date() },
      }),
      // Revoke all active refresh tokens for safety
      prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId },
        data: { revoked: true },
      }),
    ]);

    logger.info(`Password reset successfully for user: ${storedToken.user.email}`);

    return {
      message: 'Password has been reset successfully. Please log in with your new password.',
    };
  }

  /**
   * Change password for authenticated user
   */
  static async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    if (input.currentPassword === input.newPassword) {
      throw ApiError.badRequest('New password must be different from current password');
    }

    const newPasswordHash = await bcrypt.hash(input.newPassword, BCRYPT_SALT_ROUNDS);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.refreshToken.updateMany({
        where: { userId },
        data: { revoked: true },
      }),
    ]);

    logger.info(`Password changed successfully for user: ${user.email}`);

    return {
      message: 'Password changed successfully. Please log in again.',
    };
  }

  /**
   * Get current authenticated user profile
   */
  static async getCurrentUser(userId: string) {
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
}
