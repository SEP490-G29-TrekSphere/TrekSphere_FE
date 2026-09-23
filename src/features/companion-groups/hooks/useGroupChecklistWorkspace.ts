import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { groupWorkspaceService } from '../services/groupWorkspaceService';
import type {
  ChecklistFilterParams,
  CreateChecklistItemPayload,
  UpdateChecklistItemPayload,
  UpdateItemStatusPayload,
} from '../types/workspace';
import { groupWorkspaceKeys } from './groupWorkspaceKeys';

/** Hook đọc danh sách và tóm tắt Checklist của nhóm */
export function useGroupChecklist(groupId: string, filter?: ChecklistFilterParams) {
  return useQuery({
    queryKey: [...groupWorkspaceKeys.checklist(groupId), filter],
    queryFn: () => groupWorkspaceService.getChecklistSummary(groupId, filter),
    enabled: Boolean(groupId),
    staleTime: 30 * 1000,
  });
}

/** Hook tạo mới Checklist item */
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

/** Hook cập nhật thông tin Checklist item */
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

/** Hook cập nhật trạng thái checklist item (Pending / Completed) */
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

/** Hook xóa Checklist item */
export function useDeleteGroupChecklistItem(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => groupWorkspaceService.deleteChecklistItem(groupId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.checklist(groupId) });
    },
  });
}
