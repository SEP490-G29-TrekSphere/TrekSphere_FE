
export type VendorProfileStatus = 'ACTIVE' | 'INACTIVE' | 'REVOKED';

export interface VendorProfileDetail {
  vendorId: string;
  companyName: string;
  description?: string;
  logoUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  taxCode?: string;
  businessLicenseUrl?: string;
  status: VendorProfileStatus;
}

export interface UpdateVendorProfilePayload {
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  logo?: File;
}

export const VENDOR_PROFILE_STATUS_LABELS: Record<VendorProfileStatus, string> = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Ngừng hoạt động',
  REVOKED: 'Đã thu hồi',
};

export interface PublicVendorProfile {
  vendorId: string;
  companyName: string;
  description?: string;
  logoUrl?: string;
  businessAddress?: string;
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;

  partnerSince: string;
  publishedTourCount: number;
}
