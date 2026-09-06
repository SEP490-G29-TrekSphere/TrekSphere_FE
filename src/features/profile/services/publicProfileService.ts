import { blogService } from '@/features/news';

/**
 * Thông tin công khai của một người dùng khác.
 *
 * CHỈ chứa những trường an toàn để hiển thị công khai. Email, số điện thoại và
 * ngày sinh KHÔNG nằm ở đây và không được đưa lên trang hồ sơ người khác.
 */
export interface PublicUserProfile {
  userId: string;
  fullName: string;
  avatarUrl?: string;
}

/**
 * Service cho hồ sơ công khai.
 *
 * BE không có endpoint hồ sơ công khai. `GET /users/{id}` có tồn tại nhưng thuộc
 * khu vực admin, và CỐ Ý không dùng ở đây vì hai lý do:
 *   1. Với người dùng thường nó trả 401/403; nhánh 401 kích hoạt luồng refresh
 *      token của `apiClient` và có thể đăng xuất người đang xem — chỉ vì họ mở
 *      hồ sơ của người khác.
 *   2. Nó trả cả email / số điện thoại / ngày sinh, là dữ liệu không được phép
 *      hiển thị công khai.
 *
 * Thay vào đó, tên và ảnh đại diện được suy ra từ chính bài viết của tác giả
 * (`GET /blogs?authorId=`) — endpoint công khai và chỉ chứa dữ liệu công khai.
 * Hệ quả đã biết: người dùng chưa có bài viết nào thì không dựng được hồ sơ,
 * trang sẽ hiện empty state. Khi BE bổ sung endpoint hồ sơ công khai thật thì
 * chỉ cần thay thân hàm này.
 */
export const publicProfileService = {
  async getPublicProfile(userId: string): Promise<PublicUserProfile | null> {
    const { items } = await blogService.getPosts({ authorId: userId, page: 1, size: 1 });
    const first = items[0];
    if (!first) return null;

    return {
      userId,
      fullName: first.authorName,
      avatarUrl: first.authorAvatarUrl || undefined,
    };
  },
};
