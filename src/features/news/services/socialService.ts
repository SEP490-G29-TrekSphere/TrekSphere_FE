import { ApiService } from '@/config/apiClient';
import type { SuggestedUser } from '../types';

export const socialService = {
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

  async toggleFollow(userId: string, following: boolean): Promise<void> {
    const res = await ApiService<void>(`/users/${userId}/follow`, following ? 'POST' : 'DELETE');
    if (res.error) {
      throw new Error(res.error);
    }
  },

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
