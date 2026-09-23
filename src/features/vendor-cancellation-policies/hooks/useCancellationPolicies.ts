import { useQuery } from '@tanstack/react-query';
import { cancellationPolicyService } from '../services/cancellationPolicyService';

export const cancellationPolicyKeys = {
  all: ['vendor-cancellation-policies'] as const,
};

export function useCancellationPolicies() {
  return useQuery({
    queryKey: cancellationPolicyKeys.all,
    queryFn: () => cancellationPolicyService.list(),
    staleTime: 0,
  });
}
