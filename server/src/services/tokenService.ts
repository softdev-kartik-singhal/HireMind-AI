import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { JwtTokenPayload, ResetPasswordJwtPayload } from '../types/index.js';
import { UserRoleType } from '../constants/roles.js';

export class TokenService {
  /**
   * Generates a short-lived access token
   */
  static generateAccessToken(user: { id: string; email: string; role: UserRoleType }): string {
    const payload: JwtTokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const options: SignOptions = {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
    };

    return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
  }

  /**
   * Generates a long-lived refresh token
   */
  static generateRefreshToken(user: { id: string; email: string; role: UserRoleType }): string {
    const payload: JwtTokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const options: SignOptions = {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
    };

    return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
  }

  /**
   * Generates a password reset token
   */
  static generatePasswordResetToken(user: { id: string; email: string }): string {
    const payload: ResetPasswordJwtPayload = {
      userId: user.id,
      email: user.email,
      purpose: 'password_reset',
    };

    const options: SignOptions = {
      expiresIn: env.JWT_RESET_PASSWORD_EXPIRES_IN as SignOptions['expiresIn'],
    };

    return jwt.sign(payload, env.JWT_RESET_PASSWORD_SECRET, options);
  }

  /**
   * Verifies access token
   */
  static verifyAccessToken(token: string): JwtTokenPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtTokenPayload;
  }

  /**
   * Verifies refresh token
   */
  static verifyRefreshToken(token: string): JwtTokenPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtTokenPayload;
  }

  /**
   * Verifies password reset token
   */
  static verifyPasswordResetToken(token: string): ResetPasswordJwtPayload {
    return jwt.verify(token, env.JWT_RESET_PASSWORD_SECRET) as ResetPasswordJwtPayload;
  }

  /**
   * Creates a SHA-256 hash of a token for secure database storage
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
