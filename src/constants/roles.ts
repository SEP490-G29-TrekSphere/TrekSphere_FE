/**
 * User roles trong hệ thống TrekSphere.
 *
 * 3 role hệ thống + 1 trạng thái khách:
 * - GUEST   : chưa đăng nhập — chỉ xem tour/blog/nhóm ghép công khai.
 *             KHÔNG phải role do BE cấp, chỉ là mặc định khi không có session.
 * - TREKKER : vai trò trung tâm — nhóm ghép, blog, chat, hồ sơ cá nhân.
 * - VENDOR  : nhà cung cấp — hồ sơ vendor, tour và lịch trình tour.
 * - ADMIN   : quản trị toàn bộ platform.
 *
 * Các role cũ `VENDOR_STAFF`, `VENDOR_MANAGER`, `COORDINATOR` đã bị bỏ; xem
 * `normalizeRoleList` để biết cách xử lý session/token còn sót lại.
 *
 * Khi thêm role mới: thêm giá trị ở đây + tạo folder features/<role>/.
 */
export const ROLES = {
  GUEST: 'guest',
  TREKKER: 'trekker',
  VENDOR: 'vendor',
  ADMIN: 'admin',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

import { PATHS } from './paths';

/**
 * Routes dành riêng cho từng role.
 * Route nào có trong array này thì RequireRole sẽ cho phép.
 *
 * `/vendor-manager` và `/partner` là path cũ, hiện chỉ còn redirect về
 * `/vendor` — giữ trong danh sách của VENDOR để link/bookmark cũ không bị
 * đá về trang login.
 */
export const ROLE_PROTECTED_ROUTES: Record<Role, readonly string[]> = {
  [ROLES.GUEST]: [],
  [ROLES.TREKKER]: ['/trekker', '/dashboard', '/blog'],
  [ROLES.VENDOR]: ['/vendor', '/vendor-manager', '/partner'],
  [ROLES.ADMIN]: ['/admin'],
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

/** Role cũ đã bị bỏ nhưng vẫn có thể còn trong token/localStorage phiên trước. */
const LEGACY_VENDOR_ROLES = new Set(['vendor_manager', 'vendor_staff']);
const REMOVED_ROLES = new Set(['coordinator', 'porter']);

/**
 * Chuẩn hoá 1 mảng role bất kỳ (từ BE hoặc từ localStorage của phiên cũ) về
 * lowercase. Mọi nơi so khớp role trong app đều dùng `ROLES` (lowercase), nên
 * đây là điểm duy nhất được phép quyết định casing.
 *
 * Hai nhóm role cũ được xử lý khác nhau:
 * - `vendor_manager`/`vendor_staff` → gộp về `vendor` (vẫn là người của nhà
 *   cung cấp, chỉ khác cấp bậc trong mô hình cũ).
 * - `coordinator`/`porter` → loại bỏ hẳn, vì chức năng tương ứng không còn.
 *   User chỉ mang mỗi role này sẽ không còn role nào → bị coi như chưa có
 *   quyền và bị đá về trang login.
 */
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

/**
 * Thứ tự ưu tiên role khi 1 user có nhiều role cùng lúc (vd: vừa là trekker
 * vừa là vendor). Dùng chung cho `getPostLoginRoute` và
 * `RequireRole` để đảm bảo nhất quán.
 */
const ROLE_PRIORITY: readonly Role[] = [ROLES.ADMIN, ROLES.VENDOR, ROLES.TREKKER];

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
 * Ưu tiên theo thứ tự: admin → vendor → trekker.
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
 * Guest/role lạ dùng chung trang chat của Trekker.
 */
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
