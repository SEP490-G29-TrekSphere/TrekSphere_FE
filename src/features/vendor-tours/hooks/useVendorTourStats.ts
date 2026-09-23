import { useQuery } from '@tanstack/react-query';
import { vendorTourService } from '../services/vendorTourService';

export const vendorTourStatsKeys = {
  all: ['vendor-tours', 'stats'] as const,
};

const SAMPLE_SIZE = 200;

export function useVendorTourStats() {
  return useQuery({
    queryKey: vendorTourStatsKeys.all,
    queryFn: async () => {
      const { tours, total } = await vendorTourService.listMyTours({}, 1, SAMPLE_SIZE);
      return {
        total,
        draft: tours.filter((tour) => tour.status === 'DRAFT').length,
        published: tours.filter((tour) => tour.status === 'PUBLISHED').length,
        hidden: tours.filter((tour) => tour.status === 'HIDDEN').length,
      };
    },
    staleTime: 0,
  });
}
