/**
 * Feature flags bật/tắt theo môi trường.
 *
 * Dùng cho các mảng UI đã dựng sẵn theo design nhưng BE chưa có endpoint —
 * component vẫn render đúng thiết kế, chỉ ở trạng thái vô hiệu hoá.
 * Khi BE sẵn sàng: set biến env tương ứng = 'true', không phải sửa component.
 */
export const FEATURES = {
  /**
   * Nhóm tính năng mạng xã hội của blog feed: thích bài, theo dõi tác giả,
   * gợi ý người theo dõi.
   *
   * BE chưa có `/blogs/{id}/like`, `/users/{id}/follow`, `/users/suggested`
   * → mặc định tắt. Xem `features/news/services/socialService.ts`.
   */
  SOCIAL: import.meta.env.VITE_FEATURE_SOCIAL === 'true',
} as const;
