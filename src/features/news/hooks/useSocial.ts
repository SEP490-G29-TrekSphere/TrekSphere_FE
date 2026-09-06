import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FEATURES } from '@/config/features';
import { socialService } from '../services/socialService';
import type { SuggestedUser } from '../types';
import { blogKeys } from './useBlog';

/**
 * Hooks cho nhóm tính năng mạng xã hội của community feed.
 *
 * BE chưa có endpoint tương ứng → tất cả đều gate bằng `FEATURES.SOCIAL`.
 * Khi flag tắt (mặc định):
 *   - query không chạy (`enabled: false`) → không phát request nào,
 *   - mutation từ chối ngay tại chỗ,
 *   - `isAvailable === false` để component render nút ở trạng thái vô hiệu hoá.
 *
 * Khi BE sẵn sàng: set `VITE_FEATURE_SOCIAL=true`. Component không phải sửa.
 */

export const socialKeys = {
  all: ['social'] as const,
  suggestedUsers: (size: number) => [...socialKeys.all, 'suggested-users', size] as const,
};

const UNAVAILABLE = new Error('Tính năng đang được phát triển.');

/** Thích / bỏ thích bài viết. Invalidate list blog để đồng bộ `likeCount`. */
export function useToggleBlogLike() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ blogId, liked }: { blogId: string; liked: boolean }) => {
      if (!FEATURES.SOCIAL) return Promise.reject(UNAVAILABLE);
      return socialService.toggleBlogLike(blogId, liked);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
  });

  return { ...mutation, isAvailable: FEATURES.SOCIAL };
}

/** Theo dõi / bỏ theo dõi tác giả. */
export function useToggleFollow() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ userId, following }: { userId: string; following: boolean }) => {
      if (!FEATURES.SOCIAL) return Promise.reject(UNAVAILABLE);
      return socialService.toggleFollow(userId, following);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      queryClient.invalidateQueries({ queryKey: socialKeys.all });
    },
  });

  return { ...mutation, isAvailable: FEATURES.SOCIAL };
}

/** Danh sách gợi ý theo dõi ở sidebar. Trả mảng rỗng khi flag tắt. */
export function useSuggestedUsers(size = 8) {
  const query = useQuery<SuggestedUser[]>({
    queryKey: socialKeys.suggestedUsers(size),
    queryFn: () => socialService.getSuggestedUsers(size),
    enabled: FEATURES.SOCIAL,
    staleTime: 5 * 60 * 1000,
  });

  return { ...query, users: query.data ?? [], isAvailable: FEATURES.SOCIAL };
}
