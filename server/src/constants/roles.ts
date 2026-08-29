export const USER_ROLES = {
  CANDIDATE: 'CANDIDATE',
  RECRUITER: 'RECRUITER',
  ADMIN: 'ADMIN',
} as const;

export type UserRoleType = (typeof USER_ROLES)[keyof typeof USER_ROLES];
