import { useQuery } from '@tanstack/react-query';
import { publicVendorProfileService } from '../services/publicVendorProfileService';
import type { PublicVendorProfile } from '../types';

export function usePublicVendorProfile(vendorId: string | undefined) {
  return useQuery<PublicVendorProfile>({
    queryKey: ['vendor-profile', 'public', vendorId ?? ''],
    queryFn: () => publicVendorProfileService.getPublicProfile(vendorId as string),
    enabled: Boolean(vendorId),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
