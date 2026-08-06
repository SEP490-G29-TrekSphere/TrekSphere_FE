import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/useAppStore';
import { companionGroupService } from '../services/companionGroupService';

export function useMatchingGroupDetail(matchingGroupId?: string) {
  const viewerId = useAppStore((state) => state.user?.id ?? 'guest');

  return useQuery({
    queryKey: ['matching-group-detail', matchingGroupId, viewerId],
    queryFn: () => {
      if (!matchingGroupId) throw new Error('Matching Group ID is required');
      return companionGroupService.getMatchingGroupDetail(matchingGroupId);
    },
    enabled: Boolean(matchingGroupId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
