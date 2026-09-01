export type UserRole = 'ADMIN' | 'AGENT' | 'CLIENT';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export const USER_ROLES: UserRole[] = ['ADMIN', 'AGENT', 'CLIENT'];
