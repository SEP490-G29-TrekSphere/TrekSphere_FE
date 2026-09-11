import { useQuery } from '@tanstack/react-query';
import { type BlogListItem, type BlogListMeta, blogService } from '@/features/news';
import { type PublicUserProfile, publicProfileService } from '../services/publicProfileService';
import type { PublicHikingSummary } from '../types';
import { profileKeys } from './useProfile';

/** Số bài viết lấy mỗi lần cho tab "Bài viết" / "Ảnh" của trang hồ sơ. */
export const PROFILE_BLOG_PAGE_SIZE = 12;

/**
 * Hook lấy hồ sơ công khai của một người dùng khác.
 * Trả `null` khi không xác định được (user không tồn tại hoặc chưa có bài viết
 * nào để suy ra thông tin) — trang sẽ hiện empty state thay vì dữ liệu trống.
 */
export function usePublicProfile(userId: string | undefined) {
  return useQuery<PublicUserProfile | null>({
    queryKey: profileKeys.detail(userId ?? ''),
    queryFn: () => publicProfileService.getPublicProfile(userId as string),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

/**
 * Hook lấy bài viết của một tác giả — nguồn dữ liệu cho tab "Bài viết" và "Ảnh".
 * Dùng chung `/blogs?authorId=` cho cả hồ sơ của mình lẫn hồ sơ người khác.
 */
export function useUserBlogs(userId: string | undefined, page = 1) {
  return useQuery<{ items: BlogListItem[]; meta: BlogListMeta }>({
    queryKey: [...profileKeys.all, 'blogs', userId ?? '', page] as const,
    queryFn: () =>
      blogService.getPosts({
        authorId: userId,
        page,
        size: PROFILE_BLOG_PAGE_SIZE,
        sortBy: 'createdAt',
        sortDir: 'desc',
      }),
    enabled: Boolean(userId),
    staleTime: 60 * 1000,
    placeholderData: (previous) => previous,
  });
}

/**
 * Hook lấy hồ sơ leo núi công khai (thông tin nâng cao) của một người dùng.
 * Dùng cho các màn hình cần xem nhanh năng lực của một Trekker — ví dụ leader
 * duyệt đơn xin gia nhập nhóm ghép.
 */
export function usePublicHikingSummary(userId: string | undefined) {
  return useQuery<PublicHikingSummary | null>({
    queryKey: [...profileKeys.detail(userId ?? ''), 'hiking-summary'] as const,
    queryFn: () => publicProfileService.getHikingSummary(userId as string),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
