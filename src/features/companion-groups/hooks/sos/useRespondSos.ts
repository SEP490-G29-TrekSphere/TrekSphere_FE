import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sosService } from '../../services/sosService';
import { groupWorkspaceKeys } from '../groupWorkspaceKeys';

export function useRespondSos(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sosAlertId: string) => sosService.respondToSosAlert(groupId, sosAlertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.sosActive(groupId) });
      queryClient.invalidateQueries({
        queryKey: [...groupWorkspaceKeys.all, 'sos-history', groupId],
      });
    },
  });
}
