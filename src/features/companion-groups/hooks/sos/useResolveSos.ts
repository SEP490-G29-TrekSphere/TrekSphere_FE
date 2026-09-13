import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sosService } from '../../services/sosService';
import { groupWorkspaceKeys } from '../groupWorkspaceKeys';

/** Đóng tín hiệu SOS (Sender của chính alert đó, hoặc Leader) — action duy nhất trên alert. */
export function useResolveSos(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sosAlertId: string) => sosService.resolveSosAlert(groupId, sosAlertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.sosActive(groupId) });
      queryClient.invalidateQueries({
        queryKey: [...groupWorkspaceKeys.all, 'sos-history', groupId],
      });
    },
  });
}
