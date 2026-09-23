import { useQuery } from '@tanstack/react-query';
import { vendorStaffService } from '../services/vendorStaffService';
import type { VendorStaffFilter } from '../types';

export const vendorStaffKeys = {
  all: ['vendor-staff'] as const,
  list: (filter: VendorStaffFilter, page: number, pageSize: number) =>
    ['vendor-staff', 'list', filter, page, pageSize] as const,
};

export function useVendorStaffList(filter: VendorStaffFilter, page: number, pageSize: number) {
  return useQuery({
    queryKey: vendorStaffKeys.list(filter, page, pageSize),
    queryFn: () => vendorStaffService.listMyStaff(filter, page, pageSize),
  });
}
