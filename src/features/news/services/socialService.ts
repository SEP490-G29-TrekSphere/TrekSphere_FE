import { ApiService } from '@/config/apiClient';
import type { SuggestedUser } from '../types';

/**
 * Service cho nhóm tính năng mạng xã hội của community feed:
 * thích bài viết, theo dõi tác giả, gợi ý người theo dõi.
 *
 * ⚠️ BE CHƯA triển khai các endpoint dưới đây. Đây là hợp đồng dự kiến, được
 * viết trước để UI bám đúng design mà không phải sửa component về sau.
 * Mọi lời gọi đều đi qua `FEATURES.SOCIAL` (xem `hooks/useSocial.ts`) —
 * khi flag tắt, hook không gọi tới service này.
 *
 * Endpoints dự kiến:
 *   POST   /api/v1/blogs/{blogId}/like     → { success, data: { likeCount } }
 *   DELETE /api/v1/blogs/{blogId}/like     → { success, data: { likeCount } }
 *   POST   /api/v1/users/{userId}/follow   → { success, data: null }
 *   DELETE /api/v1/users/{userId}/follow   → { success, data: null }
 *   GET    /api/v1/users/suggested?size=   → { success, data: SuggestedUser[] }
 */
export const socialService = {
  /** Thích / bỏ thích một bài viết. Trả về số like mới nhất từ BE. */
  async toggleBlogLike(blogId: string, liked: boolean): Promise<{ likeCount: number }> {
    const res = await ApiService<{ likeCount: number }>(
      `/blogs/${blogId}/like`,
      liked ? 'POST' : 'DELETE'
    );
    if (res.error) {
      throw new Error(res.error);
    }
    return { likeCount: res.data?.likeCount ?? 0 };
  },

  /** Theo dõi / bỏ theo dõi một người dùng. */
  async toggleFollow(userId: string, following: boolean): Promise<void> {
    const res = await ApiService<void>(`/users/${userId}/follow`, following ? 'POST' : 'DELETE');
    if (res.error) {
      throw new Error(res.error);
    }
  },

  /** Danh sách gợi ý theo dõi cho sidebar feed. */
  async getSuggestedUsers(size = 8): Promise<SuggestedUser[]> {
    const res = await ApiService<SuggestedUser[]>('/users/suggested', 'GET', undefined, {
      size: String(size),
    });
    if (res.error) {
      throw new Error(res.error);
    }
    return res.data ?? [];
  },
};
