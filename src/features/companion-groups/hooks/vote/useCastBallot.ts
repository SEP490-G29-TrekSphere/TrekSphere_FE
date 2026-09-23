import { useMutation, useQueryClient } from '@tanstack/react-query';
import { voteService } from '../../services/voteService';
import { groupWorkspaceKeys } from '../groupWorkspaceKeys';

export function useCastBallot(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ voteId, optionId }: { voteId: string; optionId: string }) =>
      voteService.castBallot(groupId, voteId, { optionId }),
    onSuccess: (_, { voteId }) => {
      queryClient.invalidateQueries({ queryKey: [...groupWorkspaceKeys.all, 'votes', groupId] });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.voteDetail(groupId, voteId) });
    },
  });
}
