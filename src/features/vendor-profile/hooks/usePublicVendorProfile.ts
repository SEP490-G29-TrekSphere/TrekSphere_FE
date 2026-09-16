import { useQuery } from '@tanstack/react-query';
import { publicVendorProfileService } from '../services/publicVendorProfileService';
import type { PublicVendorProfile } from '../types';

/**
 * Hook lấy hồ sơ công khai của 1 Vendor — dùng cho trang Guest xem hồ sơ Vendor.
 * `retry: false` để lỗi 404 (vendor không tồn tại/không active) hiện ngay, không chờ retry.
 */
export function usePublicVendorProfile(vendorId: string | undefined) {
  return useQuery<PublicVendorProfile>({
    queryKey: ['vendor-profile', 'public', vendorId ?? ''],
    queryFn: () => publicVendorProfileService.getPublicProfile(vendorId as string),
    enabled: Boolean(vendorId),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
