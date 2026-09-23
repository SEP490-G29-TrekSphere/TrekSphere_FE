import { useQuery } from '@tanstack/react-query';
import { vendorStaffService } from '../services/vendorStaffService';

const LOCKED_COUNT_SAMPLE_SIZE = 1000;

export const vendorStaffLockedCountKeys = {
  all: ['vendor-staff', 'locked-count'] as const,
};

export function useVendorStaffLockedCount() {
  return useQuery({
    queryKey: vendorStaffLockedCountKeys.all,
    queryFn: async () => {
      const { staff } = await vendorStaffService.listMyStaff({}, 1, LOCKED_COUNT_SAMPLE_SIZE);
      return staff.filter((member) => !member.isActive).length;
    },
    staleTime: 0,
  });
}
