import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sosService } from '../services/sosService';
import { sosAlertKeys } from './useActiveSosAlerts';

export function useResolveSosAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sosId: string) => sosService.resolveAlert(sosId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sosAlertKeys.all });
    },
  });
}
