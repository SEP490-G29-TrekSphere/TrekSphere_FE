import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sosService } from '../../services/sosService';
import type { CreateSosAlertPayload } from '../../types/sos';
import { groupWorkspaceKeys } from '../groupWorkspaceKeys';

/**
 * Gửi tín hiệu SOS mới. `payload.idempotencyKey` phải được sinh 1 lần (crypto.randomUUID())
 * ở component cha và giữ nguyên qua các lần bấm gửi lại sau lỗi mạng — hook này không tự sinh.
 */
export function useSendSosAlert(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSosAlertPayload) => sosService.createSosAlert(groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.sosActive(groupId) });
    },
  });
}
