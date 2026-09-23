import { useQuery } from '@tanstack/react-query';
import {
  type VendorTourStatisticsFilter,
  vendorStatisticsService,
} from '../services/vendorStatisticsService';

export const vendorTourStatisticsKeys = {
  all: ['vendor-tours', 'statistics'] as const,
  list: (filter: VendorTourStatisticsFilter) => [...vendorTourStatisticsKeys.all, filter] as const,
};

export function useVendorTourStatistics(filter: VendorTourStatisticsFilter) {
  return useQuery({
    queryKey: vendorTourStatisticsKeys.list(filter),
    queryFn: () => vendorStatisticsService.getStatistics(filter),
    placeholderData: (previous) => previous,
  });
}
