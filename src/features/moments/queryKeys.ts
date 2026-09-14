/**
 * Gốc query key của hai nguồn dữ liệu Khoảnh khắc.
 *
 * Một khoảnh khắc có thể hiện diện ở cả bảng tin nhóm lẫn trang hồ sơ cá nhân
 * (`visibility = PUBLIC_PROFILE`), nên khi tạo / đổi quyền hiển thị / xóa phải làm mới
 * đúng hai nhánh này — đặt ở đây để hai feature dùng chung mà không import vòng.
 */
export const MOMENT_QUERY_ROOTS = {
  group: ['group-moments'] as const,
  personal: ['userMoments'] as const,
};
