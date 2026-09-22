import { useQuery } from '@tanstack/react-query';
import { type BlogListItem, type BlogListMeta, blogService } from '@/features/news';
import { type PublicUserProfile, publicProfileService } from '../services/publicProfileService';
import type { PublicHikingSummary } from '../types';
import { profileKeys } from './useProfile';

export const PROFILE_BLOG_PAGE_SIZE = 12;

export function usePublicProfile(userId: string | undefined) {
  return useQuery<PublicUserProfile | null>({
    queryKey: profileKeys.detail(userId ?? ''),
    queryFn: () => publicProfileService.getPublicProfile(userId as string),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

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

export function usePublicHikingSummary(userId: string | undefined) {
  return useQuery<PublicHikingSummary | null>({
    queryKey: [...profileKeys.detail(userId ?? ''), 'hiking-summary'] as const,
    queryFn: () => publicProfileService.getHikingSummary(userId as string),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
