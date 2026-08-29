import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';
import { UserRoleType } from '../constants/roles.js';

/**
 * Authorizes specific user roles.
 * @param allowedRoles List of UserRoleType allowed to access this endpoint
 */
export const authorize = (...allowedRoles: UserRoleType[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied: Role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    return next();
  };
};
