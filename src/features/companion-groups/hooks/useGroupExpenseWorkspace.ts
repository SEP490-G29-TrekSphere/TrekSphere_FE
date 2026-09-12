import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { groupWorkspaceService } from '../services/groupWorkspaceService';
import type { GroupExpenseCreateRequest, GroupExpenseUpdateRequest } from '../types/expense';
import { groupWorkspaceKeys } from './groupWorkspaceKeys';

/** Hook lấy danh sách các khoản chi tiêu của nhóm */
export function useGroupExpenses(groupId: string, page = 0, size = 20) {
  return useQuery({
    queryKey: groupWorkspaceKeys.expenses(groupId, page, size),
    queryFn: () => groupWorkspaceService.getGroupExpenses(groupId, page, size),
    enabled: Boolean(groupId),
    staleTime: 30 * 1000,
  });
}

/** Hook lấy tổng kết chi tiêu thực tế của nhóm */
export function useGroupExpenseSummary(groupId: string) {
  return useQuery({
    queryKey: groupWorkspaceKeys.expenseSummary(groupId),
    queryFn: () => groupWorkspaceService.getExpenseSummary(groupId),
    enabled: Boolean(groupId),
    staleTime: 30 * 1000,
  });
}

/** Hook lấy chi tiết một khoản chi tiêu */
export function useGroupExpenseDetail(groupId: string, expenseId?: string) {
  return useQuery({
    queryKey: groupWorkspaceKeys.expenseDetail(groupId, expenseId ?? ''),
    queryFn: () => groupWorkspaceService.getExpenseDetail(groupId, expenseId ?? ''),
    enabled: Boolean(groupId) && Boolean(expenseId),
    staleTime: 30 * 1000,
  });
}

/** Hook tạo mới khoản chi tiêu (Leader Only) */
export function useCreateGroupExpense(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GroupExpenseCreateRequest) =>
      groupWorkspaceService.createExpense(groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.expenses(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.expenseSummary(groupId) });
    },
  });
}

/** Hook cập nhật khoản chi tiêu (Leader Only) */
export function useUpdateGroupExpense(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      expenseId,
      payload,
    }: {
      expenseId: string;
      payload: GroupExpenseUpdateRequest;
    }) => groupWorkspaceService.updateExpense(groupId, expenseId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.expenses(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.expenseSummary(groupId) });
      queryClient.invalidateQueries({
        queryKey: groupWorkspaceKeys.expenseDetail(groupId, variables.expenseId),
      });
    },
  });
}

/** Hook hủy / xóa mềm khoản chi tiêu (Leader Only) */
export function useVoidGroupExpense(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseId: string) => groupWorkspaceService.voidExpense(groupId, expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.expenses(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.expenseSummary(groupId) });
    },
  });
}
