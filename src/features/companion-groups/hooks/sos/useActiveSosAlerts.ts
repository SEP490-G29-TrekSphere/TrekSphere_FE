import { useQuery } from '@tanstack/react-query';
import { sosService } from '../../services/sosService';
import { groupWorkspaceKeys } from '../groupWorkspaceKeys';

export function useActiveSosAlerts(groupId?: string) {
  return useQuery({
    queryKey: groupWorkspaceKeys.sosActive(groupId ?? ''),
    queryFn: () => sosService.getActiveSosAlerts(groupId ?? ''),
    enabled: Boolean(groupId),
    refetchOnWindowFocus: true,
    staleTime: 15 * 1000,
  });
}
