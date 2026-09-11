import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { groupWorkspaceService } from '../services/groupWorkspaceService';
import type {
  CustomJourneyCostItemCreateRequest,
  CustomJourneyCostItemUpdateRequest,
} from '../types/workspace';
import { groupWorkspaceKeys } from './groupWorkspaceKeys';

/** Hook lấy tổng quan dự toán chi phí */
export function useGroupCostSummary(groupId: string) {
  return useQuery({
    queryKey: groupWorkspaceKeys.costSummary(groupId),
    queryFn: () => groupWorkspaceService.getCostSummary(groupId),
    enabled: Boolean(groupId),
    staleTime: 30 * 1000,
  });
}

/** Hook lấy danh sách các khoản chi dự kiến */
export function useGroupCostItems(groupId: string) {
  return useQuery({
    queryKey: groupWorkspaceKeys.costItems(groupId),
    queryFn: () => groupWorkspaceService.getCostItems(groupId),
    enabled: Boolean(groupId),
    staleTime: 30 * 1000,
  });
}

/** Hook thêm khoản chi dự toán mới (Leader Only) */
export function useCreateGroupCostItem(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CustomJourneyCostItemCreateRequest) =>
      groupWorkspaceService.createCostItem(groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.costSummary(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.costItems(groupId) });
    },
  });
}

/** Hook cập nhật khoản chi dự toán (Leader Only) */
export function useUpdateGroupCostItem(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      costItemId,
      payload,
    }: {
      costItemId: string;
      payload: CustomJourneyCostItemUpdateRequest;
    }) => groupWorkspaceService.updateCostItem(groupId, costItemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.costSummary(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.costItems(groupId) });
    },
  });
}

/** Hook xoá khoản chi dự toán (Leader Only) */
export function useDeleteGroupCostItem(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (costItemId: string) => groupWorkspaceService.deleteCostItem(groupId, costItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.costSummary(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.costItems(groupId) });
    },
  });
}
