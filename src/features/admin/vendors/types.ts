export type VendorStatus = 'ACTIVE' | 'INACTIVE' | 'REVOKED';

export interface VendorManager {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  avatarUrl?: string;
  status: 'ACTIVE' | 'LOCKED' | 'DEACTIVATED';
  emailVerified: boolean;
  roles: string[];
}

export interface AdminVendor {
  id: string;
  companyName: string;
  description?: string;
  logoUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  taxCode?: string;
  businessLicenseUrl?: string;
  status: VendorStatus;
  manager?: VendorManager;
}

export interface AdminVendorsResponse {
  vendors: AdminVendor[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminVendorFilter {
  search?: string;
  status?: VendorStatus | 'ALL';
}

export interface VendorStatsResponse {
  total: number;
  active: number;
  inactive: number;
  revoked: number;
}

export const VENDOR_STATUS_LABELS: Record<VendorStatus, string> = {
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Ngừng hoạt động',
  REVOKED: 'Đã thu hồi',
};

export const VENDOR_STATUS_FILTER_OPTIONS: Array<{ value: VendorStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'INACTIVE', label: 'Ngừng hoạt động' },
  { value: 'REVOKED', label: 'Đã thu hồi' },
];
