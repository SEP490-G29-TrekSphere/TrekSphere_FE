import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companionGroupService } from '../services/companionGroupService';
import { companionGroupKeys } from './companionGroupKeys';

export function useApproveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, applicationId }: { groupId: string; applicationId: string }) =>
      companionGroupService.approveApplication(groupId, applicationId),
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.joinRequests() });
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.myJoinRequests() });
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.myGroups() });
    },
  });
}
