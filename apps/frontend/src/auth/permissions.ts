import type { UserRole } from './types';

export function canManageUsers(role?: UserRole | null) {
  return role === 'ADMIN';
}

export function canCreateAgreements(role?: UserRole | null) {
  return role === 'ADMIN' || role === 'AGENT';
}

export function canDeleteAgreements(role?: UserRole | null) {
  return role === 'ADMIN';
}

export function canListClients(role?: UserRole | null) {
  return role === 'ADMIN' || role === 'AGENT';
}
