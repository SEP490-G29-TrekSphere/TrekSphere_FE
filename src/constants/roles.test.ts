import {
  canAccessPath,
  extractRoles,
  getPostLoginRoute,
  getPrimaryRole,
  getRoleChatPath,
  getRoleDashboardPath,
  normalizeRoleList,
  PATHS,
  ROLES,
} from '@/constants';

describe('normalizeRoleList', () => {
  it('hạ lowercase và bỏ prefix role_ từ BE', () => {
    expect(normalizeRoleList(['ROLE_ADMIN', 'TREKKER'])).toEqual(['admin', 'trekker']);
  });

  it('gộp role vendor cũ về vendor và không trả trùng', () => {
    expect(normalizeRoleList(['VENDOR_MANAGER', 'vendor_staff'])).toEqual(['vendor']);
  });

  it('loại bỏ hẳn role đã bị xoá khỏi hệ thống', () => {
    expect(normalizeRoleList(['COORDINATOR', 'trekker'])).toEqual(['trekker']);
    expect(normalizeRoleList(['coordinator'])).toEqual([]);
  });

  it('trả mảng rỗng với input không hợp lệ', () => {
    expect(normalizeRoleList(undefined)).toEqual([]);
    expect(extractRoles(null)).toEqual([]);
  });
});

describe('getPrimaryRole', () => {
  it('ưu tiên admin → vendor → trekker bất kể thứ tự mảng', () => {
    expect(getPrimaryRole(['trekker', 'admin'])).toBe(ROLES.ADMIN);
    expect(getPrimaryRole(['trekker', 'vendor'])).toBe(ROLES.VENDOR);
    expect(getPrimaryRole(['trekker'])).toBe(ROLES.TREKKER);
  });

  it('trả null khi không có role nào đã biết', () => {
    expect(getPrimaryRole([])).toBeNull();
    expect(getPrimaryRole(normalizeRoleList(['coordinator']))).toBeNull();
  });
});

describe('canAccessPath', () => {
  it('chỉ cho role vào đúng khu vực của mình', () => {
    expect(canAccessPath(ROLES.ADMIN, '/admin/accounts')).toBe(true);
    expect(canAccessPath(ROLES.VENDOR, '/vendor/tours')).toBe(true);
    expect(canAccessPath(ROLES.TREKKER, '/trekker/profile')).toBe(true);

    expect(canAccessPath(ROLES.TREKKER, '/admin/accounts')).toBe(false);
    expect(canAccessPath(ROLES.VENDOR, '/admin/accounts')).toBe(false);
    expect(canAccessPath(ROLES.TREKKER, '/vendor/tours')).toBe(false);
    expect(canAccessPath(null, '/admin/accounts')).toBe(false);
  });

  it('vendor vẫn vào được path vendor cũ (chỉ còn redirect)', () => {
    expect(canAccessPath(ROLES.VENDOR, '/vendor-manager/tours')).toBe(true);
    expect(canAccessPath(ROLES.VENDOR, '/partner/tours')).toBe(true);
  });

  it('guest không có khu vực riêng nào', () => {
    expect(canAccessPath(ROLES.GUEST, '/trekker')).toBe(false);
  });
});

describe('điều hướng theo role', () => {
  it('đưa về đúng bảng điều khiển', () => {
    expect(getRoleDashboardPath(['admin'])).toBe(PATHS.ADMIN_ACCOUNTS);
    expect(getRoleDashboardPath(['vendor'])).toBe(PATHS.VENDOR);
    expect(getRoleDashboardPath(['trekker'])).toBe(PATHS.TREKKER);
    expect(getRoleDashboardPath([])).toBeNull();
  });

  it('sau login: trekker về trang chủ, role khác về portal', () => {
    expect(getPostLoginRoute(['trekker'])).toBe(PATHS.HOME);
    expect(getPostLoginRoute(['vendor'])).toBe(PATHS.VENDOR);
    expect(getPostLoginRoute(['admin'])).toBe(PATHS.ADMIN_ACCOUNTS);
    expect(getPostLoginRoute([])).toBe(PATHS.HOME);
  });

  it('chat: mỗi role vào trang chat trong portal của mình', () => {
    expect(getRoleChatPath(['admin'])).toBe(PATHS.ADMIN_CHAT);
    expect(getRoleChatPath(['vendor'])).toBe(PATHS.VENDOR_CHAT);
    expect(getRoleChatPath(['trekker'])).toBe(PATHS.TREKKER_CHAT);
    expect(getRoleChatPath([])).toBe(PATHS.TREKKER_CHAT);
  });
});
