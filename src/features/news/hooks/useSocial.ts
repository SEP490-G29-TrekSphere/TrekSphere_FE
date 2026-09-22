import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FEATURES } from '@/config/features';
import { socialService } from '../services/socialService';
import type { SuggestedUser } from '../types';
import { blogKeys } from './useBlog';

export const socialKeys = {
  all: ['social'] as const,
  suggestedUsers: (size: number) => [...socialKeys.all, 'suggested-users', size] as const,
};

const UNAVAILABLE = new Error('Tính năng đang được phát triển.');

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

export function useSuggestedUsers(size = 8) {
  const query = useQuery<SuggestedUser[]>({
    queryKey: socialKeys.suggestedUsers(size),
    queryFn: () => socialService.getSuggestedUsers(size),
    enabled: FEATURES.SOCIAL,
    staleTime: 5 * 60 * 1000,
  });

  return { ...query, users: query.data ?? [], isAvailable: FEATURES.SOCIAL };
}
