import { useQuery } from '@tanstack/react-query';
import { voteService } from '../../services/voteService';
import type { GetGroupVotesParams } from '../../types/vote';
import { groupWorkspaceKeys } from '../groupWorkspaceKeys';

export function useGroupVotes(groupId?: string, params: GetGroupVotesParams = {}) {
  return useQuery({
    queryKey: groupWorkspaceKeys.votes(
      groupId ?? '',
      params.voteType,
      params.status,
      params.page,
      params.size
    ),
    queryFn: () => voteService.getVotes(groupId ?? '', params),
    enabled: Boolean(groupId),
    staleTime: 15 * 1000,
  });
}
