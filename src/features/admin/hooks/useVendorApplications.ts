import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type ApplicationStatus,
  type VendorApplicationFilter,
  type VendorApplicationsResponse,
  vendorApplicationService,
} from '../services/vendorApplicationService';

export const vendorApplicationKeys = {
  all: ['admin', 'vendorApplications'] as const,
  lists: () => [...vendorApplicationKeys.all, 'list'] as const,
  list: (filter: VendorApplicationFilter) =>
    [...vendorApplicationKeys.lists(), { filter }] as const,
  details: () => [...vendorApplicationKeys.all, 'detail'] as const,
  detail: (id: string) => [...vendorApplicationKeys.details(), id] as const,
  stats: () => [...vendorApplicationKeys.all, 'stats'] as const,
};

export function useVendorApplications(filter: VendorApplicationFilter) {
  return useQuery<VendorApplicationsResponse>({
    queryKey: vendorApplicationKeys.list(filter),
    queryFn: () => vendorApplicationService.getApplications(filter),
  });
}

export function useVendorApplicationDetail(id?: string) {
  return useQuery({
    queryKey: vendorApplicationKeys.detail(id || ''),
    queryFn: () => vendorApplicationService.getApplicationById(id || ''),
    enabled: Boolean(id),
  });
}

export function useVendorApplicationStats() {
  return useQuery({
    queryKey: vendorApplicationKeys.stats(),
    queryFn: () => vendorApplicationService.getStats(),
  });
}

export function useReviewVendorApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      rejectionReason,
    }: {
      id: string;
      status: ApplicationStatus;
      rejectionReason?: string;
    }) => vendorApplicationService.reviewApplication(id, { status, rejectionReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorApplicationKeys.all });
    },
  });
}
