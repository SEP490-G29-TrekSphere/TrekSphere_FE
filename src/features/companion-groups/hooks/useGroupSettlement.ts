import { useCallback, useEffect, useState } from 'react';
import { toast } from '@/store/useToastStore';
import { groupWorkspaceService } from '../services/groupWorkspaceService';
import type {
  GroupSettlementProofRequest,
  GroupSettlementRejectRequest,
  GroupSettlementResponse,
  GroupSettlementSummaryResponse,
} from '../types/settlement';

interface UseGroupSettlementProps {
  groupId?: string;
  autoFetch?: boolean;
}

export function useGroupSettlement({ groupId, autoFetch = true }: UseGroupSettlementProps) {
  const [summary, setSummary] = useState<GroupSettlementSummaryResponse | null>(null);
  const [settlements, setSettlements] = useState<GroupSettlementResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettlementData = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, settlementsRes] = await Promise.all([
        groupWorkspaceService.getSettlementSummary(groupId),
        groupWorkspaceService.getSettlements(groupId),
      ]);
      setSummary(summaryRes);
      setSettlements(settlementsRes);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải dữ liệu quyết toán';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (autoFetch && groupId) {
      fetchSettlementData();
    }
  }, [autoFetch, groupId, fetchSettlementData]);

  const handleGenerateSettlements = async () => {
    if (!groupId) return;
    setActionLoading(true);
    try {
      await groupWorkspaceService.generateSettlements(groupId);
      toast.success('Đã khởi tạo các lệnh quyết toán tối giản thành công!');
      await fetchSettlementData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể khởi tạo quyết toán';
      toast.error(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitProof = async (settlementId: string, payload: GroupSettlementProofRequest) => {
    if (!groupId) return;
    setActionLoading(true);
    try {
      await groupWorkspaceService.submitSettlementProof(groupId, settlementId, payload);
      toast.success('Gửi chứng từ chuyển tiền thành công!');
      await fetchSettlementData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể nộp chứng từ';
      toast.error(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmPayment = async (settlementId: string) => {
    if (!groupId) return;
    setActionLoading(true);
    try {
      await groupWorkspaceService.confirmSettlementPayment(groupId, settlementId);
      toast.success('Đã xác nhận thanh toán thành công!');
      await fetchSettlementData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể xác nhận thanh toán';
      toast.error(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPayment = async (
    settlementId: string,
    payload: GroupSettlementRejectRequest
  ) => {
    if (!groupId) return;
    setActionLoading(true);
    try {
      await groupWorkspaceService.rejectSettlementPayment(groupId, settlementId, payload);
      toast.success('Đã từ chối thanh toán với lý do.');
      await fetchSettlementData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể từ chối thanh toán';
      toast.error(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    summary,
    settlements,
    loading,
    actionLoading,
    error,
    refreshSettlementData: fetchSettlementData,
    generateSettlements: handleGenerateSettlements,
    submitProof: handleSubmitProof,
    confirmPayment: handleConfirmPayment,
    rejectPayment: handleRejectPayment,
  };
}
