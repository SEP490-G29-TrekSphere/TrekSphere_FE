import { useMutation, useQueryClient } from '@tanstack/react-query';
import { voteService } from '../../services/voteService';
import { groupWorkspaceKeys } from '../groupWorkspaceKeys';

/** Huỷ sớm bởi người mở vote hoặc Leader, không tính kết quả. */
export function useCancelVote(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (voteId: string) => voteService.cancelVote(groupId, voteId),
    onSuccess: (_, voteId) => {
      queryClient.invalidateQueries({ queryKey: [...groupWorkspaceKeys.all, 'votes', groupId] });
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.voteDetail(groupId, voteId) });
    },
  });
}
