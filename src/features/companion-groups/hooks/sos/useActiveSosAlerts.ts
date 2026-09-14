import { useQuery } from '@tanstack/react-query';
import { sosService } from '../../services/sosService';
import { groupWorkspaceKeys } from '../groupWorkspaceKeys';

/** Danh sách tín hiệu SOS đang mở của nhóm — refetch khi focus lại tab làm fallback cho socket rớt. */
export function useActiveSosAlerts(groupId?: string) {
  return useQuery({
    queryKey: groupWorkspaceKeys.sosActive(groupId ?? ''),
    queryFn: () => sosService.getActiveSosAlerts(groupId ?? ''),
    enabled: Boolean(groupId),
    refetchOnWindowFocus: true,
    staleTime: 15 * 1000,
  });
}
