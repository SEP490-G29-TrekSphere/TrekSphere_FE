import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type UserMomentCreatePayload, userMomentService } from '../services/userMomentService';

export const userMomentKeys = {
  all: ['userMoments'] as const,
  myList: (page?: number) => [...userMomentKeys.all, 'me', page] as const,
  myMap: () => [...userMomentKeys.all, 'me', 'map'] as const,
  userList: (userId: string, page?: number) =>
    [...userMomentKeys.all, 'user', userId, page] as const,
  userMap: (userId: string) => [...userMomentKeys.all, 'user', userId, 'map'] as const,
};

export function useUserMoments({
  userId,
  isMeMode,
  page = 0,
  size = 20,
}: {
  userId?: string;
  isMeMode: boolean;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: isMeMode ? userMomentKeys.myList(page) : userMomentKeys.userList(userId ?? '', page),
    queryFn: () =>
      isMeMode
        ? userMomentService.getMyMoments(page, size)
        : userMomentService.getUserPublicMoments(userId ?? '', page, size),
    enabled: isMeMode || Boolean(userId),
    staleTime: 60 * 1000,
  });
}

export function useUserMomentsMap({ userId, isMeMode }: { userId?: string; isMeMode: boolean }) {
  return useQuery({
    queryKey: isMeMode ? userMomentKeys.myMap() : userMomentKeys.userMap(userId ?? ''),
    queryFn: () =>
      isMeMode
        ? userMomentService.getMyMomentsMap()
        : userMomentService.getUserPublicMomentsMap(userId ?? ''),
    enabled: isMeMode || Boolean(userId),
    staleTime: 60 * 1000,
  });
}

export function useCreatePersonalMoment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserMomentCreatePayload) =>
      userMomentService.createPersonalMoment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userMomentKeys.all });
    },
  });
}

export function useUpdatePersonalMomentVisibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      momentId,
      visibility,
    }: {
      momentId: string;
      visibility: 'GROUP_ONLY' | 'PUBLIC_PROFILE' | 'ONLY_ME';
    }) => userMomentService.updatePersonalMomentVisibility(momentId, visibility),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userMomentKeys.all });
    },
  });
}

export function useDeletePersonalMoment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (momentId: string) => userMomentService.deletePersonalMoment(momentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userMomentKeys.all });
    },
  });
}
