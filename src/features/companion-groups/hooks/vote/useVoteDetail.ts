import { useQuery } from '@tanstack/react-query';
import { voteService } from '../../services/voteService';
import { groupWorkspaceKeys } from '../groupWorkspaceKeys';

export function useVoteDetail(groupId?: string, voteId?: string) {
  return useQuery({
    queryKey: groupWorkspaceKeys.voteDetail(groupId ?? '', voteId ?? ''),
    queryFn: () => voteService.getVoteDetail(groupId ?? '', voteId ?? ''),
    enabled: Boolean(groupId) && Boolean(voteId),
    staleTime: 15 * 1000,
  });
}
