import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companionGroupService } from '../services/companionGroupService';
import { companionGroupKeys } from './companionGroupKeys';

export function useJoinMatchingGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ matchingGroupId, message }: { matchingGroupId: string; message?: string }) =>
      companionGroupService.submitApplication(matchingGroupId, { message }),
    onSuccess: (_, { matchingGroupId }) => {
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.detail(matchingGroupId) });
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.myJoinRequests() });
    },
  });
}
