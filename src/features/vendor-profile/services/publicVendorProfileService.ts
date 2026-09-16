import { type ApiResponse, ApiService } from '@/config/apiClient';
import type { PublicVendorProfile } from '../types';

/**
 * Service gọi API hồ sơ Vendor công khai (Guest xem, không cần đăng nhập).
 *
 *   GET /vendors/{vendorId}/public
 */

/** Shape thô mà BE trả về trong `data` (PublicVendorProfileResponse). */
interface PublicVendorProfileDto {
  vendorId: string;
  companyName: string;
  description?: string | null;
  logoUrl?: string | null;
  businessAddress?: string | null;
  websiteUrl?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  partnerSince: string;
  publishedTourCount: number;
}

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.error) {
    throw new Error(response.error);
  }
  if (response.data === undefined) {
    throw new Error('Không nhận được dữ liệu từ máy chủ');
  }
  return response.data;
}

function mapPublicProfile(dto: PublicVendorProfileDto): PublicVendorProfile {
  return {
    vendorId: dto.vendorId,
    companyName: dto.companyName,
    description: dto.description ?? undefined,
    logoUrl: dto.logoUrl ?? undefined,
    businessAddress: dto.businessAddress ?? undefined,
    websiteUrl: dto.websiteUrl ?? undefined,
    contactEmail: dto.contactEmail ?? undefined,
    contactPhone: dto.contactPhone ?? undefined,
    partnerSince: dto.partnerSince,
    publishedTourCount: dto.publishedTourCount,
  };
}

export const publicVendorProfileService = {
  /** Lấy hồ sơ công khai của 1 Vendor theo id. */
  async getPublicProfile(vendorId: string): Promise<PublicVendorProfile> {
    const response = await ApiService<PublicVendorProfileDto>(`/vendors/${vendorId}/public`, 'GET');
    return mapPublicProfile(unwrapResponse(response));
  },
};
