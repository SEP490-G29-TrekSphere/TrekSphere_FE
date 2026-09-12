import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companionGroupService } from '../services/companionGroupService';
import { companionGroupKeys } from './companionGroupKeys';

export type MatchingGroupLifecycleAction =
  | 'hide'
  | 'show'
  | 'close'
  | 'open'
  | 'start-trip'
  | 'complete-trip';

export function useMatchingGroupLifecycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      action,
    }: {
      groupId: string;
      action: MatchingGroupLifecycleAction;
    }) => {
      const lifecycleAction = {
        hide: companionGroupService.hideMatchingGroup,
        show: companionGroupService.showMatchingGroup,
        close: companionGroupService.closeMatchingGroup,
        open: companionGroupService.openMatchingGroup,
        'start-trip': companionGroupService.startTrip,
        'complete-trip': companionGroupService.completeTrip,
      }[action];
      return lifecycleAction(groupId);
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.myGroups() });
    },
  });
}
