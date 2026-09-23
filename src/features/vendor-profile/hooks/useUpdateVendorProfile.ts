import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorProfileService } from '../services/vendorProfileService';
import { vendorProfileKeys } from './useVendorProfile';

export function useUpdateVendorProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vendorProfileService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorProfileKeys.all });
    },
  });
}
