import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sosService } from '../../services/sosService';
import type { UpdateSosLocationPayload } from '../../types/sos';
import { groupWorkspaceKeys } from '../groupWorkspaceKeys';

export function useUpdateSosLocation(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sosAlertId,
      payload,
    }: {
      sosAlertId: string;
      payload: UpdateSosLocationPayload;
    }) => sosService.updateSosLocation(groupId, sosAlertId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.sosActive(groupId) });
      queryClient.invalidateQueries({
        queryKey: [...groupWorkspaceKeys.all, 'sos-history', groupId],
      });
    },
  });
}
