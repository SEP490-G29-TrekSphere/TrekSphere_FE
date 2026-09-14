import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MOMENT_QUERY_ROOTS } from '@/features/moments/queryKeys';
import type { MomentVisibility } from '@/features/moments/types';
import { type MomentCreatePayload, momentService } from '../services/momentService';

export const momentKeys = {
  all: MOMENT_QUERY_ROOTS.group,
  list: (groupId: string) => [...momentKeys.all, 'list', groupId] as const,
  album: (groupId: string) => [...momentKeys.all, 'album', groupId] as const,
  map: (groupId: string) => [...momentKeys.all, 'map', groupId] as const,
};

export function useGroupMoments(groupId: string, page = 0, size = 20) {
  return useQuery({
    queryKey: [...momentKeys.list(groupId), page, size],
    queryFn: () => momentService.getGroupMoments(groupId, page, size),
    enabled: Boolean(groupId),
  });
}

export function useGroupAlbum(groupId: string, page = 0, size = 50) {
  return useQuery({
    queryKey: [...momentKeys.album(groupId), page, size],
    queryFn: () => momentService.getGroupAlbum(groupId, page, size),
    enabled: Boolean(groupId),
  });
}

export function useGroupMomentsMap(groupId: string) {
  return useQuery({
    queryKey: momentKeys.map(groupId),
    queryFn: () => momentService.getGroupMomentsMap(groupId),
    enabled: Boolean(groupId),
  });
}

export function useCreateMoment(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MomentCreatePayload) => momentService.createGroupMoment(groupId, payload),
    onSuccess: (_created, payload) => {
      queryClient.invalidateQueries({ queryKey: momentKeys.list(groupId) });
      queryClient.invalidateQueries({ queryKey: momentKeys.album(groupId) });
      queryClient.invalidateQueries({ queryKey: momentKeys.map(groupId) });
      // Bài đăng công khai xuất hiện luôn trên tab Khoảnh khắc của hồ sơ cá nhân.
      if (payload.visibility === 'PUBLIC_PROFILE') {
        queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_ROOTS.personal });
      }
    },
  });
}

export function useHideMoment(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ momentId, reason }: { momentId: string; reason: string }) =>
      momentService.hideMoment(groupId, momentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: momentKeys.list(groupId) });
      queryClient.invalidateQueries({ queryKey: momentKeys.album(groupId) });
    },
  });
}

export function useUnhideMoment(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (momentId: string) => momentService.unhideMoment(groupId, momentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: momentKeys.list(groupId) });
      queryClient.invalidateQueries({ queryKey: momentKeys.album(groupId) });
    },
  });
}

export function useDeleteMoment(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (momentId: string) => momentService.deleteMoment(groupId, momentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: momentKeys.list(groupId) });
      queryClient.invalidateQueries({ queryKey: momentKeys.album(groupId) });
      queryClient.invalidateQueries({ queryKey: momentKeys.map(groupId) });
      // Bài bị xóa cũng phải biến mất khỏi trang hồ sơ nếu trước đó đang công khai.
      queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_ROOTS.personal });
    },
  });
}

export function useUpdateMomentVisibility(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ momentId, visibility }: { momentId: string; visibility: MomentVisibility }) =>
      momentService.updateMomentVisibility(groupId, momentId, visibility),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: momentKeys.list(groupId) });
      queryClient.invalidateQueries({ queryKey: momentKeys.album(groupId) });
      // Đổi quyền hiển thị = thêm/bớt bài trên trang hồ sơ cá nhân.
      queryClient.invalidateQueries({ queryKey: MOMENT_QUERY_ROOTS.personal });
    },
  });
}
