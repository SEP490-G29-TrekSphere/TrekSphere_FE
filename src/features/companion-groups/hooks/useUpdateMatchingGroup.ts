import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companionGroupService } from '../services/companionGroupService';
import type { MatchingGroupUpdateRequest } from '../types/matchingGroup';
import { companionGroupKeys } from './companionGroupKeys';

export function useUpdateMatchingGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, payload }: { groupId: string; payload: MatchingGroupUpdateRequest }) =>
      companionGroupService.updateMatchingGroup(groupId, payload),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.myGroups() });
    },
  });
}
