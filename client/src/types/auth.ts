export type UserRole = 'CANDIDATE' | 'RECRUITER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  bio?: string | null;
  headline?: string | null;
  phone?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: Record<string, any>;
  errors?: Array<{ field?: string; message: string }>;
}

export interface AuthResponseData {
  user: User;
  accessToken?: string;
}
