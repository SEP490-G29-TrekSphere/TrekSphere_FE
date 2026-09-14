import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type MomentCreatePayload, momentService } from '../services/momentService';

export const momentKeys = {
  all: ['group-moments'] as const,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: momentKeys.list(groupId) });
      queryClient.invalidateQueries({ queryKey: momentKeys.album(groupId) });
      queryClient.invalidateQueries({ queryKey: momentKeys.map(groupId) });
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
    },
  });
}

export function useUpdateMomentVisibility(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      momentId,
      visibility,
    }: {
      momentId: string;
      visibility: 'GROUP_ONLY' | 'PUBLIC_PROFILE' | 'ONLY_ME';
    }) => momentService.updateMomentVisibility(groupId, momentId, visibility),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: momentKeys.list(groupId) });
      queryClient.invalidateQueries({ queryKey: momentKeys.album(groupId) });
    },
  });
}
