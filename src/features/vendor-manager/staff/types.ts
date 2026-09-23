// src/features/vendor-manager/staff/types.ts

export type VendorStaffRole = 'VENDOR_STAFF' | 'COORDINATOR';

export const VENDOR_STAFF_ROLES: VendorStaffRole[] = ['VENDOR_STAFF', 'COORDINATOR'];

export const VENDOR_STAFF_ROLE_LABELS: Record<VendorStaffRole, string> = {
  VENDOR_STAFF: 'Nhân viên',
  COORDINATOR: 'Hướng Dẫn Viên',
};

export interface VendorStaffMember {
  id: string;

  shortId: string;

  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string;

  roles: string[];

  role: VendorStaffRole;
  isActive: boolean;
  deactivatedAt?: string;
}

export interface VendorStaffFilter {
  search?: string;
}

export interface VendorStaffListResponse {
  staff: VendorStaffMember[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AddVendorStaffPayload {
  email: string;
  fullName?: string;

  role?: VendorStaffRole;
}
