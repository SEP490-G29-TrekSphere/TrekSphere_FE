import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  type VendorApplicationFilter,
  type VendorApplicationsResponse,
  vendorApplicationService,
} from '@/features/admin/services/vendorApplicationService';

export const myVendorApplicationKeys = {
  all: ['profile', 'myVendorApplications'] as const,
  lists: () => [...myVendorApplicationKeys.all, 'list'] as const,
  list: (filter: VendorApplicationFilter) =>
    [...myVendorApplicationKeys.lists(), { filter }] as const,
};

export function useMyVendorApplications(filter: VendorApplicationFilter) {
  return useQuery<VendorApplicationsResponse>({
    queryKey: myVendorApplicationKeys.list(filter),
    queryFn: () => vendorApplicationService.getMyApplications(filter),
  });
}

export function useCreateDraftApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => vendorApplicationService.createDraftApplication(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myVendorApplicationKeys.all });
    },
  });
}

export function useSubmitVendorApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vendorApplicationService.submitApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myVendorApplicationKeys.all });
    },
  });
}

export function useUpdateVendorApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      vendorApplicationService.updateApplication(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myVendorApplicationKeys.all });
    },
  });
}

export function useResubmitVendorApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vendorApplicationService.resubmitApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myVendorApplicationKeys.all });
    },
  });
}
