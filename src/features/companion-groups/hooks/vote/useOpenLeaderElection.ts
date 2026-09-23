import { useMutation, useQueryClient } from '@tanstack/react-query';
import { voteService } from '../../services/voteService';
import type { OpenLeaderElectionPayload } from '../../types/vote';
import { groupWorkspaceKeys } from '../groupWorkspaceKeys';

/** Mở cuộc bầu Trưởng nhóm mới (voteType = LEADER_ELECTION). */
export function useOpenLeaderElection(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OpenLeaderElectionPayload) =>
      voteService.openLeaderElectionVote(groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...groupWorkspaceKeys.all, 'votes', groupId] });
    },
  });
}
