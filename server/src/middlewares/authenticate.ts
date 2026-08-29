import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';
import { TokenService } from '../services/tokenService.js';
import { prisma } from '../config/prisma.js';

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // 1. Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      // 2. Check HTTP-only cookie
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(ApiError.unauthorized('Authentication required. Please log in.'));
    }

    // Verify token
    const decoded = TokenService.verifyAccessToken(token);

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
      },
    });

    if (!user) {
      return next(ApiError.unauthorized('User associated with this token no longer exists.'));
    }

    // Attach to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as import('../constants/roles.js').UserRoleType,
      name: user.name,
    };

    return next();
  } catch (error) {
    return next(ApiError.unauthorized('Invalid or expired authentication token.'));
  }
};
