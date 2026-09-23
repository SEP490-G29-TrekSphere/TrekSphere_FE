
export type AccountStatus = 'ACTIVE' | 'LOCKED' | 'DEACTIVATED';

export type AccountRole = 'trekker' | 'vendor' | 'admin';

export interface AdminAccount {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  role: AccountRole;
  status: AccountStatus;
  createdAt?: string;
}

export interface AdminAccountsResponse {
  accounts: AdminAccount[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminAccountFilter {
  role?: AccountRole | 'ALL';
  search?: string;
}

export const ACCOUNT_ROLE_LABELS: Record<AccountRole, string> = {
  trekker: 'Khách du lịch',
  vendor: 'Nhà cung cấp',
  admin: 'Quản trị viên',
};

export const ACCOUNT_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'trekker', label: 'Khách du lịch' },
  { value: 'vendor', label: 'Nhà cung cấp' },
  { value: 'admin', label: 'Quản trị viên' },
] as const;
