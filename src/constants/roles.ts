
export const ROLES = {
  GUEST: 'guest',
  TREKKER: 'trekker',
  VENDOR: 'vendor',
  ADMIN: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

import { PATHS } from './paths';

export const ROLE_PROTECTED_ROUTES: Record<Role, readonly string[]> = {
  [ROLES.GUEST]: [],
  [ROLES.TREKKER]: ['/trekker', '/dashboard', '/blog'],
  [ROLES.VENDOR]: ['/vendor', '/vendor-manager', '/partner'],
  [ROLES.ADMIN]: ['/admin'],
};

export function canAccessPath(role: Role | null, pathname: string): boolean {
  if (!role) return false;
  const allowedRoutes = ROLE_PROTECTED_ROUTES[role] ?? [];
  return allowedRoutes.some((route) => pathname.startsWith(route));
}

export function extractRoles(input: unknown): string[] {
  if (!input || typeof input !== 'object') return [];

  return normalizeRoleList((input as { roles?: unknown }).roles);
}

const LEGACY_VENDOR_ROLES = new Set(['vendor_manager', 'vendor_staff']);
const REMOVED_ROLES = new Set(['coordinator', 'porter']);

export function normalizeRoleList(roles: unknown): string[] {
  if (!Array.isArray(roles)) return [];

  const normalized = roles
    .filter((r): r is string => typeof r === 'string' && r.trim().length > 0)
    .map((r) => {
      let clean = r.trim().toLowerCase();
      if (clean.startsWith('role_')) {
        clean = clean.replace('role_', '');
      }
      return LEGACY_VENDOR_ROLES.has(clean) ? ROLES.VENDOR : clean;
    })
    .filter((role) => !REMOVED_ROLES.has(role));

  return [...new Set(normalized)];
}

const ROLE_PRIORITY: readonly Role[] = [ROLES.ADMIN, ROLES.VENDOR, ROLES.TREKKER];

export function getPrimaryRole(roles: string[] | undefined | null): Role | null {
  const set = new Set(roles ?? []);
  return ROLE_PRIORITY.find((role) => set.has(role)) ?? null;
}

export function getRoleDashboardPath(roles: string[] | undefined | null): string | null {
  switch (getPrimaryRole(roles)) {
    case ROLES.ADMIN:
      return PATHS.ADMIN_ACCOUNTS;
    case ROLES.VENDOR:
      return PATHS.VENDOR;
    case ROLES.TREKKER:
      return PATHS.TREKKER;
    default:
      return null;
  }
}

export function getPostLoginRoute(roles: string[]): string {
  if (getPrimaryRole(roles) === ROLES.TREKKER) return PATHS.HOME;
  return getRoleDashboardPath(roles) ?? PATHS.HOME;
}

export function getRoleChatPath(roles: string[] | undefined | null): string {
  switch (getPrimaryRole(roles)) {
    case ROLES.ADMIN:
      return PATHS.ADMIN_CHAT;
    case ROLES.VENDOR:
      return PATHS.VENDOR_CHAT;
    default:
      return PATHS.TREKKER_CHAT;
  }
}

export function getRoleNotificationsPath(roles: string[] | undefined | null): string {
  switch (getPrimaryRole(roles)) {
    case ROLES.ADMIN:
      return PATHS.ADMIN_NOTIFICATIONS;
    case ROLES.VENDOR:
      return PATHS.VENDOR_NOTIFICATIONS;
    default:
      return PATHS.TREKKER_NOTIFICATIONS;
  }
}

export function isVendorOrAdminRole(roles: string[] | undefined | null): boolean {
  if (!roles || !Array.isArray(roles)) return false;
  return roles.some((r) => {
    const normalized = r.toLowerCase().replace(/^role_/, '');
    return normalized === ROLES.VENDOR || normalized === ROLES.ADMIN;
  });
}
