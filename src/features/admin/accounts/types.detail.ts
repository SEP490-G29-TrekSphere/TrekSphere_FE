import type { AccountRole, AccountStatus } from './types';

export type AccountGender = 'MALE' | 'FEMALE' | 'OTHER';

export interface AdminAccountDetail extends Record<string, unknown> {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: AccountRole;
  status: AccountStatus;
  gender?: AccountGender;
  dateOfBirth?: string;
  emailVerified: boolean;
}

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  ACTIVE: 'Đang hoạt động',
  LOCKED: 'Bị khóa',
  DEACTIVATED: 'Bị khóa',
};

export const ACCOUNT_GENDER_LABELS: Record<AccountGender, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
};
