import { UserRoleType } from '../constants/roles.js';

export interface AuthUserPayload {
  id: string;
  email: string;
  role: UserRoleType;
  name: string;
}

export interface JwtTokenPayload {
  userId: string;
  email: string;
  role: UserRoleType;
}

export interface ResetPasswordJwtPayload {
  userId: string;
  email: string;
  purpose: 'password_reset';
}
