import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { groupWorkspaceService } from '../services/groupWorkspaceService';
import type {
  ChecklistFilterParams,
  CreateChecklistItemPayload,
  UpdateChecklistItemPayload,
  UpdateItemStatusPayload,
} from '../types/workspace';
import { groupWorkspaceKeys } from './groupWorkspaceKeys';

export function useGroupChecklist(groupId: string, filter?: ChecklistFilterParams) {
  return useQuery({
    queryKey: [...groupWorkspaceKeys.checklist(groupId), filter],
    queryFn: () => groupWorkspaceService.getChecklistSummary(groupId, filter),
    enabled: Boolean(groupId),
    staleTime: 30 * 1000,
  });
}

export function useCreateGroupChecklistItem(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateChecklistItemPayload) =>
      groupWorkspaceService.createChecklistItem(groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.checklist(groupId) });
    },
  });
}

export function useUpdateGroupChecklistItem(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: UpdateChecklistItemPayload }) =>
      groupWorkspaceService.updateChecklistItem(groupId, itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.checklist(groupId) });
    },
  });
}

export function useUpdateGroupChecklistItemStatus(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: UpdateItemStatusPayload }) =>
      groupWorkspaceService.updateItemStatus(groupId, itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.checklist(groupId) });
    },
  });
}

export function useDeleteGroupChecklistItem(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => groupWorkspaceService.deleteChecklistItem(groupId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.checklist(groupId) });
    },
  });
}
