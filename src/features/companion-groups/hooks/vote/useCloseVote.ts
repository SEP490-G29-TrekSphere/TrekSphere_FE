import { useMutation, useQueryClient } from '@tanstack/react-query';
import { voteService } from '../../services/voteService';
import { groupWorkspaceKeys } from '../groupWorkspaceKeys';

export function useCloseVote(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (voteId: string) => voteService.closeVote(groupId, voteId),
    onSuccess: (_, voteId) => {
      queryClient.invalidateQueries({ queryKey: [...groupWorkspaceKeys.all, 'votes', groupId] });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.voteDetail(groupId, voteId) });
    },
  });
}
