/**
 * User roles trong hệ thống TrekSphere.
 *
 * 5 actor chính:
 * - GUEST       : duyệt tour không cần đăng nhập
 * - TREKKER     : đặt tour, review, group matchmaking, blog
 * - VENDOR_STAFF: nhà cung cấp - tạo tour, lịch khởi hành, voucher
 * - VENDOR_MANAGER: duyệt tour trước khi hiển thị cho trekker
 * - ADMIN       : quản lý toàn bộ platform
 *
 * Khi thêm role mới: thêm giá trị ở đây + tạo folder features/<role>/.
 */
export const ROLES = {
  GUEST: 'guest',
  TREKKER: 'trekker',
  VENDOR: 'vendor',
  VENDOR_STAFF: 'vendor_staff',
  VENDOR_MANAGER: 'vendor_manager',
  ADMIN: 'admin',
  COORDINATOR: 'coordinator',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

import { PATHS } from './paths';

/**
 * Routes dành riêng cho từng role.
 * Route nào có trong array này thì RequireRole sẽ cho phép.
 */
export const ROLE_PROTECTED_ROUTES: Record<Role, readonly string[]> = {
  [ROLES.GUEST]: [],
  [ROLES.TREKKER]: ['/trekker', '/dashboard', '/blog'],
  [ROLES.VENDOR]: ['/vendor', '/vendor-manager', '/partner'],
  [ROLES.VENDOR_STAFF]: ['/vendor', '/partner'],
  [ROLES.VENDOR_MANAGER]: ['/vendor', '/vendor-manager'],
  [ROLES.ADMIN]: ['/admin'],
  [ROLES.COORDINATOR]: [],
};

/**
 * Helper: kiểm tra role có quyền truy cập path không.
 */
export function canAccessPath(role: Role | null, pathname: string): boolean {
  if (!role) return false;
  const allowedRoutes = ROLE_PROTECTED_ROUTES[role] ?? [];
  return allowedRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Chuẩn hoá role string từ BE về lowercase để so khớp với `ROLES`.
 *
 * BE `POST /auth/login` trả `roles: ["ADMIN"]` hoặc `["VENDOR"]` hoặc `["ROLE_VENDOR"]`.
 * Loại bỏ prefix `role_` nếu có và map các role cũ `vendor_manager`/`vendor_staff` về `vendor`.
 */
export function extractRoles(input: unknown): string[] {
  if (!input || typeof input !== 'object') return [];

  return normalizeRoleList((input as { roles?: unknown }).roles);
}

/**
 * Chuẩn hoá 1 mảng role bất kỳ (từ BE hoặc từ localStorage của phiên cũ) về
 * lowercase. Mọi nơi so khớp role trong app đều dùng `ROLES` (lowercase), nên
 * đây là điểm duy nhất được phép quyết định casing.
 */
export function normalizeRoleList(roles: unknown): string[] {
  if (!Array.isArray(roles)) return [];

  return roles
    .filter((r): r is string => typeof r === 'string' && r.trim().length > 0)
    .map((r) => {
      let clean = r.trim().toLowerCase();
      if (clean.startsWith('role_')) {
        clean = clean.replace('role_', '');
      }
      if (clean === 'vendor_manager' || clean === 'vendor_staff') {
        return ROLES.VENDOR;
      }
      return clean;
    });
}

/**
 * Thứ tự ưu tiên role khi 1 user có nhiều role cùng lúc (vd: vừa là trekker
 * vừa là vendor). Dùng chung cho `getPostLoginRoute` và
 * `RequireRole` để đảm bảo nhất quán.
 */
const ROLE_PRIORITY: readonly Role[] = [
  ROLES.ADMIN,
  ROLES.VENDOR,
  ROLES.VENDOR_MANAGER,
  ROLES.VENDOR_STAFF,
  ROLES.COORDINATOR,
  ROLES.TREKKER,
];

/**
 * Trả về role "chính" của user theo độ ưu tiên ở trên, bất kể thứ tự trong
 * mảng `roles` gốc. Trả `null` nếu không khớp role nào đã biết.
 */
export function getPrimaryRole(roles: string[] | undefined | null): Role | null {
  const set = new Set(roles ?? []);
  return ROLE_PRIORITY.find((role) => set.has(role)) ?? null;
}

/**
 * Trang "Bảng điều khiển" của từng role — đích của mục duy nhất trong menu
 * avatar ở header. Trả `null` nếu user không có role nào đã biết (khi đó menu
 * chỉ còn nút Đăng xuất).
 */
export function getRoleDashboardPath(roles: string[] | undefined | null): string | null {
  switch (getPrimaryRole(roles)) {
    case ROLES.ADMIN:
      return PATHS.ADMIN_ACCOUNTS;
    case ROLES.VENDOR:
    case ROLES.VENDOR_MANAGER:
    case ROLES.VENDOR_STAFF:
      return PATHS.VENDOR;
    case ROLES.TREKKER:
      return PATHS.TREKKER;
    default:
      return null;
  }
}

/**
 * Trả về trang đích sau login dựa trên role của user.
 *
 * Ưu tiên theo thứ tự: admin → vendor → coordinator → trekker.
 * Nếu không nhận diện được role nào, fallback về trang chủ.
 *
 * Riêng TREKKER: về thẳng trang chủ chứ KHÔNG vào `/trekker`.
 */
export function getPostLoginRoute(roles: string[]): string {
  if (getPrimaryRole(roles) === ROLES.TREKKER) return PATHS.HOME;
  return getRoleDashboardPath(roles) ?? PATHS.HOME;
}

/**
 * Trả về trang chat tương ứng với role của user.
 */
export function getRoleChatPath(roles: string[] | undefined | null): string {
  switch (getPrimaryRole(roles)) {
    case ROLES.ADMIN:
      return PATHS.ADMIN_CHAT;
    case ROLES.VENDOR:
    case ROLES.VENDOR_MANAGER:
    case ROLES.VENDOR_STAFF:
      return PATHS.VENDOR_CHAT;
    default:
      return PATHS.TREKKER_CHAT;
  }
}
