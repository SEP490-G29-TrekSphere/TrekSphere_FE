import { type ApiResponse, ApiService } from '@/config/apiClient';
import { normalizeRoleList } from '@/constants/roles';
import type {
  AccountRole,
  AccountStatus,
  AdminAccount,
  AdminAccountFilter,
  AdminAccountsResponse,
} from '../types';
import type { AccountGender, AdminAccountDetail } from '../types.detail';

interface UserProfileResponseDto {
  userId: string;
  email: string;
  fullName: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  avatarUrl?: string | null;
  status: AccountStatus;
  emailVerified: boolean;
  roles: string[];
}

interface PaginationResponseDto<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
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

const ROLE_PRIORITY: AccountRole[] = ['admin', 'vendor', 'trekker'];

function pickPrimaryRole(roles: string[]): AccountRole {
  const owned = new Set(normalizeRoleList(roles));
  return ROLE_PRIORITY.find((role) => owned.has(role)) ?? 'trekker';
}

function toAccountGender(raw?: string | null): AccountGender | undefined {
  const upper = raw?.toUpperCase();
  if (upper === 'MALE' || upper === 'FEMALE' || upper === 'OTHER') return upper;
  return undefined;
}

function mapAccount(dto: UserProfileResponseDto): AdminAccount {
  return {
    id: dto.userId,
    fullName: dto.fullName,
    email: dto.email,
    avatarUrl: dto.avatarUrl ?? undefined,
    role: pickPrimaryRole(dto.roles ?? []),
    status: dto.status,
  };
}

function mapAccountDetail(dto: UserProfileResponseDto): AdminAccountDetail {
  return {
    ...mapAccount(dto),
    phone: dto.phone ?? undefined,
    gender: toAccountGender(dto.gender),
    dateOfBirth: dto.dateOfBirth ?? undefined,
    emailVerified: dto.emailVerified,
  };
}

export const adminAccountService = {
  async listAccounts(
    filter: AdminAccountFilter = {},
    page = 1,
    pageSize = 10
  ): Promise<AdminAccountsResponse> {
    const params: Record<string, string> = {
      page: String(page - 1),
      size: String(pageSize),
    };
    if (filter.role && filter.role !== 'ALL') {
      params.roleName = filter.role.toUpperCase();
    }
    if (filter.search) {
      params.keyword = filter.search;
    }

    const response = await ApiService<PaginationResponseDto<UserProfileResponseDto>>(
      '/users',
      'GET',
      undefined,
      params
    );
    const data = unwrapResponse(response);

    return {
      accounts: data.content.map(mapAccount),
      total: data.totalElements,
      page,
      pageSize,
    };
  },

  async getAccountDetailById(id: string): Promise<AdminAccountDetail | null> {
    const response = await ApiService<UserProfileResponseDto>(`/users/${id}`, 'GET');
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) return null;
    return mapAccountDetail(response.data);
  },

  async updateStatus(id: string, status: 'ACTIVE' | 'LOCKED' | 'DEACTIVATED'): Promise<void> {
    const response = await ApiService<void>(`/users/${id}/status`, 'PUT', undefined, { status });
    if (response.error) {
      throw new Error(response.error);
    }
  },
};
