import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/store/useToastStore';
import { groupWorkspaceService } from '../services/groupWorkspaceService';
import type {
  GroupSettlementProofRequest,
  GroupSettlementRejectRequest,
  GroupSettlementResponse,
  GroupSettlementSummaryResponse,
} from '../types/settlement';
import { groupWorkspaceKeys } from './groupWorkspaceKeys';

interface UseGroupSettlementProps {
  groupId?: string;
  autoFetch?: boolean;
}

export function useGroupSettlement({ groupId, autoFetch = true }: UseGroupSettlementProps) {
  const queryClient = useQueryClient();
  const validGroupId = groupId ?? '';
  const isEnabled = Boolean(groupId) && autoFetch;

  const {
    data: summary,
    isLoading: isLoadingSummary,
    error: summaryError,
    refetch: refetchSummary,
  } = useQuery<GroupSettlementSummaryResponse>({
    queryKey: groupWorkspaceKeys.settlementSummary(validGroupId),
    queryFn: () => groupWorkspaceService.getSettlementSummary(validGroupId),
    enabled: isEnabled,
    staleTime: 10 * 1000,
  });

  const {
    data: settlements = [],
    isLoading: isLoadingSettlements,
    error: settlementsError,
    refetch: refetchSettlements,
  } = useQuery<GroupSettlementResponse[]>({
    queryKey: groupWorkspaceKeys.settlements(validGroupId),
    queryFn: () => groupWorkspaceService.getSettlements(validGroupId),
    enabled: isEnabled,
    staleTime: 10 * 1000,
  });

  const invalidateAllSettlementData = () => {
    if (!validGroupId) return;
    queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.settlementSummary(validGroupId) });
    queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.settlements(validGroupId) });
    queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.expenses(validGroupId) });
    queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.expenseSummary(validGroupId) });
  };

  const generateMutation = useMutation({
    mutationFn: () => groupWorkspaceService.generateSettlements(validGroupId),
    onSuccess: () => {
      toast.success('Đã khởi tạo các lệnh quyết toán tối giản thành công!');
      invalidateAllSettlementData();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Không thể khởi tạo quyết toán';
      toast.error(msg);
    },
  });

  const submitProofMutation = useMutation({
    mutationFn: ({
      settlementId,
      payload,
    }: {
      settlementId: string;
      payload: GroupSettlementProofRequest;
    }) => groupWorkspaceService.submitSettlementProof(validGroupId, settlementId, payload),
    onSuccess: () => {
      toast.success('Gửi chứng từ chuyển tiền thành công!');
      invalidateAllSettlementData();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Không thể nộp chứng từ';
      toast.error(msg);
    },
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: (settlementId: string) =>
      groupWorkspaceService.confirmSettlementPayment(validGroupId, settlementId),
    onSuccess: () => {
      toast.success('Đã xác nhận thanh toán thành công!');
      invalidateAllSettlementData();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Không thể xác nhận thanh toán';
      toast.error(msg);
    },
  });

  const rejectPaymentMutation = useMutation({
    mutationFn: ({
      settlementId,
      payload,
    }: {
      settlementId: string;
      payload: GroupSettlementRejectRequest;
    }) => groupWorkspaceService.rejectSettlementPayment(validGroupId, settlementId, payload),
    onSuccess: () => {
      toast.success('Đã từ chối thanh toán với lý do.');
      invalidateAllSettlementData();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Không thể từ chối thanh toán';
      toast.error(msg);
    },
  });

  const handleRefresh = async () => {
    await Promise.all([refetchSummary(), refetchSettlements()]);
  };

  const actionLoading =
    generateMutation.isPending ||
    submitProofMutation.isPending ||
    confirmPaymentMutation.isPending ||
    rejectPaymentMutation.isPending;

  const error = summaryError
    ? summaryError instanceof Error
      ? summaryError.message
      : 'Lỗi tải tổng kết quyết toán'
    : settlementsError
      ? settlementsError instanceof Error
        ? settlementsError.message
        : 'Lỗi tải danh sách quyết toán'
      : null;

  return {
    summary: summary ?? null,
    settlements,
    loading: isLoadingSummary || isLoadingSettlements,
    actionLoading,
    error,
    refreshSettlementData: handleRefresh,
    generateSettlements: async () => {
      await generateMutation.mutateAsync();
    },
    submitProof: async (settlementId: string, payload: GroupSettlementProofRequest) => {
      await submitProofMutation.mutateAsync({ settlementId, payload });
    },
    confirmPayment: async (settlementId: string) => {
      await confirmPaymentMutation.mutateAsync(settlementId);
    },
    rejectPayment: async (settlementId: string, payload: GroupSettlementRejectRequest) => {
      await rejectPaymentMutation.mutateAsync({ settlementId, payload });
    },
  };
}
