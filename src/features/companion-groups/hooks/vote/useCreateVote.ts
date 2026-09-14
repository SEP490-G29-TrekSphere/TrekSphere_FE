import { useMutation, useQueryClient } from '@tanstack/react-query';
import { voteService } from '../../services/voteService';
import type { CreateGroupVotePayload } from '../../types/vote';
import { groupWorkspaceKeys } from '../groupWorkspaceKeys';

/** Mở bình chọn chung mới (voteType = OTHER) trong workspace nhóm. */
export function useCreateVote(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateGroupVotePayload) =>
      voteService.createGeneralPoll(groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...groupWorkspaceKeys.all, 'votes', groupId] });
    },
  });
}
