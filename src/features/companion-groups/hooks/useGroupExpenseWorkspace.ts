import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { groupWorkspaceService } from '../services/groupWorkspaceService';
import type { GroupExpenseCreateRequest, GroupExpenseUpdateRequest } from '../types/expense';
import { companionGroupKeys } from './companionGroupKeys';
import { groupWorkspaceKeys } from './groupWorkspaceKeys';

export function useGroupExpenses(
  groupId: string,
  page = 0,
  size = 20,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: groupWorkspaceKeys.expenses(groupId, page, size),
    queryFn: () => groupWorkspaceService.getGroupExpenses(groupId, page, size),
    enabled: Boolean(groupId) && (options?.enabled ?? true),
    staleTime: 30 * 1000,
  });
}

export function useGroupExpenseSummary(groupId: string) {
  return useQuery({
    queryKey: groupWorkspaceKeys.expenseSummary(groupId),
    queryFn: () => groupWorkspaceService.getExpenseSummary(groupId),
    enabled: Boolean(groupId),
    staleTime: 30 * 1000,
  });
}

export function useGroupExpenseDetail(groupId: string, expenseId?: string) {
  return useQuery({
    queryKey: groupWorkspaceKeys.expenseDetail(groupId, expenseId ?? ''),
    queryFn: () => groupWorkspaceService.getExpenseDetail(groupId, expenseId ?? ''),
    enabled: Boolean(groupId) && Boolean(expenseId),
    staleTime: 30 * 1000,
  });
}

export function useCreateGroupExpense(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GroupExpenseCreateRequest) =>
      groupWorkspaceService.createExpense(groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.expensesBase(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.expenseSummary(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.settlementSummary(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.settlements(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.costSummary(groupId) });
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.detail(groupId) });
    },
  });
}

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
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.expensesBase(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.expenseSummary(groupId) });
      queryClient.invalidateQueries({
        queryKey: groupWorkspaceKeys.expenseDetail(groupId, variables.expenseId),
      });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.settlementSummary(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.settlements(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.costSummary(groupId) });
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.detail(groupId) });
    },
  });
}

export function useVoidGroupExpense(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseId: string) => groupWorkspaceService.voidExpense(groupId, expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.expensesBase(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.expenseSummary(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.settlementSummary(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.settlements(groupId) });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.costSummary(groupId) });
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.detail(groupId) });
    },
  });
}
