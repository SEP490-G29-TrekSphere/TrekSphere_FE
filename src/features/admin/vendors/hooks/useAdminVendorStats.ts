import { useQuery } from '@tanstack/react-query';
import { adminVendorService } from '../services/adminVendorService';
import { adminVendorKeys } from './useAdminVendors';

export function useAdminVendorStats() {
  return useQuery({
    queryKey: adminVendorKeys.stats(),
    queryFn: () => adminVendorService.getStats(),
  });
}
