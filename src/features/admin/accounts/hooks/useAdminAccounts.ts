import { useQuery } from '@tanstack/react-query';
import { adminAccountService } from '../services/adminAccountService';
import type { AdminAccountFilter, AdminAccountsResponse } from '../types';

export const adminAccountKeys = {
  all: ['admin', 'accounts'] as const,
  lists: () => [...adminAccountKeys.all, 'list'] as const,
  list: (filter: AdminAccountFilter, page: number, pageSize: number) =>
    [...adminAccountKeys.lists(), { filter, page, pageSize }] as const,
};

export function useAdminAccounts(filter: AdminAccountFilter, page: number, pageSize: number) {
  return useQuery<AdminAccountsResponse>({
    queryKey: adminAccountKeys.list(filter, page, pageSize),
    queryFn: async () => {
      const res = await adminAccountService.listAccounts(filter, page, pageSize);
      return res;
    },
  });
}
