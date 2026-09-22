import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAccountService } from '../services/adminAccountService';
import { adminAccountDetailKeys } from './useAdminAccountDetail';
import { adminAccountKeys } from './useAdminAccounts';

export function useAccountMutations(accountId = '') {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: adminAccountKeys.all });
    queryClient.invalidateQueries({ queryKey: adminAccountDetailKeys.all });
  };

  const lock = useMutation({
    mutationFn: (targetAccountId?: string) =>
      adminAccountService.updateStatus(targetAccountId ?? accountId, 'LOCKED'),
    onSuccess: invalidate,
  });

  const unlock = useMutation({
    mutationFn: (targetAccountId?: string) =>
      adminAccountService.updateStatus(targetAccountId ?? accountId, 'ACTIVE'),
    onSuccess: invalidate,
  });

  return { lock, unlock };
}
