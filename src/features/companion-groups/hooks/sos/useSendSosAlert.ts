import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sosService } from '../../services/sosService';
import type { CreateSosAlertPayload } from '../../types/sos';
import { groupWorkspaceKeys } from '../groupWorkspaceKeys';

export function useSendSosAlert(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSosAlertPayload) => sosService.createSosAlert(groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.sosActive(groupId) });
    },
  });
}
