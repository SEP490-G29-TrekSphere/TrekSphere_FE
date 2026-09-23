import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminVendorService } from '../services/adminVendorService';
import type { VendorStatus } from '../types';
import { adminVendorKeys } from './useAdminVendors';

export function useUpdateVendorStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, status }: { vendorId: string; status: VendorStatus }) =>
      adminVendorService.updateStatus(vendorId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminVendorKeys.all });
    },
  });
}
