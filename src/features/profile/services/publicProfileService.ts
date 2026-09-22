import { ApiService } from '@/config/apiClient';
import { blogService } from '@/features/news';
import type { PublicHikingSummary } from '../types';

export interface PublicUserProfile {
  userId: string;
  fullName: string;
  avatarUrl?: string;
}

export const publicProfileService = {
  async getPublicProfile(userId: string): Promise<PublicUserProfile | null> {
    try {
      const hiking = await publicProfileService.getHikingSummary(userId);
      if (hiking?.fullName) {
        return {
          userId,
          fullName: hiking.fullName,
          avatarUrl: hiking.avatarUrl || undefined,
        };
      }
    } catch {

    }

    try {
      const { items } = await blogService.getPosts({ authorId: userId, page: 1, size: 1 });
      const first = items[0];
      if (!first) return null;

      return {
        userId,
        fullName: first.authorName,
        avatarUrl: first.authorAvatarUrl || undefined,
      };
    } catch {
      return null;
    }
  },

  async getHikingSummary(userId: string): Promise<PublicHikingSummary | null> {
    const response = await ApiService<PublicHikingSummary>(
      `/users/${userId}/hiking-summary`,
      'GET'
    );
    if (response.error) throw new Error(response.error);
    return response.data ?? null;
  },
};
