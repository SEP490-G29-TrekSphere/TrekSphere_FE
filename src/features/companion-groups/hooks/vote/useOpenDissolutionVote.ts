import { useMutation, useQueryClient } from '@tanstack/react-query';
import { voteService } from '../../services/voteService';
import type { OpenDissolutionVotePayload } from '../../types/vote';
import { groupWorkspaceKeys } from '../groupWorkspaceKeys';

export function useOpenDissolutionVote(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OpenDissolutionVotePayload) =>
      voteService.openDissolutionVote(groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...groupWorkspaceKeys.all, 'votes', groupId] });
    },
  });
}
