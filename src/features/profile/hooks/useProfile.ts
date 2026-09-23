import { useQuery } from '@tanstack/react-query';
import { extractRoles } from '@/constants/roles';
import type { UserProfile } from '@/features/auth';
import { profileService } from '../services/profileService';

export const profileKeys = {
  all: ['profile'] as const,
  lists: () => [...profileKeys.all, 'list'] as const,

  me: () => [...profileKeys.all, 'me'] as const,

  detail: (userId: string) => [...profileKeys.all, 'detail', userId] as const,
};

function toStringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

export function normalizeProfile(raw: Record<string, unknown>): UserProfile {
  const fullName = (raw.fullName as string | undefined) ?? '';

  const roles = extractRoles(raw);

  const rawGender = (raw.gender as string | null | undefined) ?? '';
  const genderMap: Record<string, UserProfile['gender']> = {
    MALE: 'male',
    FEMALE: 'female',
    OTHER: 'other',
  };
  const gender = genderMap[rawGender.toUpperCase()] ?? undefined;

  return {

    id:
      (raw.userId as string | undefined) ??
      (raw.userID as string | undefined) ??
      (raw.id as string | undefined) ??
      '',
    email: (raw.email as string | undefined) ?? '',
    name: fullName,
    phone: (raw.phone as string | null | undefined) ?? undefined,
    avatar: (raw.avatarUrl as string | null | undefined) ?? undefined,
    gender,
    dateOfBirth: (raw.dateOfBirth as string | null | undefined) ?? undefined,
    roles,
    role: roles[0] ?? '',

    bio: (raw.bio as string | null | undefined) ?? undefined,
    experienceLevel: (raw.experienceLevel as UserProfile['experienceLevel']) ?? undefined,
    preferredDifficulty:
      (raw.preferredDifficulty as UserProfile['preferredDifficulty']) ?? undefined,
    preferredAreas: toStringList(raw.preferredAreas),
    skills: toStringList(raw.skills),
    trustScore: typeof raw.trustScore === 'number' ? raw.trustScore : undefined,
    trustReviewCount: typeof raw.trustReviewCount === 'number' ? raw.trustReviewCount : undefined,
  };
}

export function useProfile() {
  const query = useQuery<UserProfile | null>({
    queryKey: profileKeys.me(),
    queryFn: async () => {
      const res = await profileService.getProfile();
      if (res.error) {
        throw new Error(res.message || res.error);
      }
      const raw = res.data;
      if (!raw || typeof raw !== 'object') return null;
      return normalizeProfile(raw as unknown as Record<string, unknown>);
    },
    staleTime: 60 * 1000,
    retry: (failureCount, error) => {

      const msg = error instanceof Error ? error.message : '';
      if (/denied|unauthorized|forbidden/i.test(msg)) return false;
      return failureCount < 1;
    },
  });

  return query;
}
