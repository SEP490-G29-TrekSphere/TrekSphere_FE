import { useQuery } from '@tanstack/react-query';
import { sosService } from '../../services/sosService';
import { groupWorkspaceKeys } from '../groupWorkspaceKeys';

export function useSosAlertHistory(groupId: string, page = 0, size = 10) {
  return useQuery({
    queryKey: groupWorkspaceKeys.sosHistory(groupId, page, size),
    queryFn: () => sosService.getSosAlertHistory(groupId, page, size),
    enabled: Boolean(groupId),
    staleTime: 30 * 1000,
  });
}
