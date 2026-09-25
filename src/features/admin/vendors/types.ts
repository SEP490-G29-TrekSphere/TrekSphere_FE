export type VendorStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';

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
  pending: number;
  active: number;
  suspended: number;
}

export const VENDOR_STATUS_LABELS: Record<VendorStatus, string> = {
  PENDING: 'Chờ hoạt động',
  ACTIVE: 'Đang hoạt động',
  SUSPENDED: 'Tạm ngưng hoạt động',
};

export const VENDOR_STATUS_FILTER_OPTIONS: Array<{ value: VendorStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'PENDING', label: 'Chờ hoạt động' },
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'SUSPENDED', label: 'Tạm ngưng hoạt động' },
];
