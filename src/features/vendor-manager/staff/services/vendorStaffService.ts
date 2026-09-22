import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  AddVendorStaffPayload,
  VendorStaffFilter,
  VendorStaffListResponse,
  VendorStaffMember,
  VendorStaffRole,
} from '../types';

interface VendorStaffUserDto {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  roles: string[];
}

interface VendorStaffResponseDto {
  vendorStaffId: string;
  vendorId: string;
  user: VendorStaffUserDto;
  isActive: boolean;
  deactivatedAt?: string;
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

export function formatShortId(id: string): string {
  return id.replace(/-/g, '').slice(0, 8).toUpperCase();
}

function resolveRole(roles: string[]): VendorStaffRole {
  return roles.some((role) => role.toUpperCase() === 'COORDINATOR')
    ? 'COORDINATOR'
    : 'VENDOR_STAFF';
}

function mapVendorStaff(dto: VendorStaffResponseDto): VendorStaffMember {
  const roles = dto.user.roles ?? [];

  return {
    id: dto.vendorStaffId,
    shortId: formatShortId(dto.vendorStaffId),
    userId: dto.user.id,
    fullName: dto.user.fullName,
    email: dto.user.email,
    avatarUrl: dto.user.avatarUrl ?? undefined,
    roles,
    role: resolveRole(roles),
    isActive: dto.isActive,
    deactivatedAt: dto.deactivatedAt ?? undefined,
  };
}

async function fetchStaffPage(
  path: string,
  filter: VendorStaffFilter,
  page: number,
  pageSize: number
): Promise<VendorStaffListResponse> {
  const params: Record<string, string> = {
    page: String(page - 1),
    size: String(pageSize),
  };
  if (filter.search) {
    params.keyword = filter.search;
  }

  const response = await ApiService<PaginationResponseDto<VendorStaffResponseDto>>(
    path,
    'GET',
    undefined,
    params
  );
  const data = unwrapResponse(response);

  return {
    staff: data.content.map(mapVendorStaff),
    total: data.totalElements,
    page,
    pageSize,
  };
}

export const vendorStaffService = {

  listMyStaff(
    filter: VendorStaffFilter = {},
    page = 1,
    pageSize = 10
  ): Promise<VendorStaffListResponse> {
    return fetchStaffPage('/vendor-staff/me', filter, page, pageSize);
  },

  listCoordinators(
    filter: VendorStaffFilter = {},
    page = 1,
    pageSize = 10
  ): Promise<VendorStaffListResponse> {
    return fetchStaffPage('/vendor-staff/coordinators', filter, page, pageSize);
  },

  async addStaff(payload: AddVendorStaffPayload): Promise<VendorStaffMember> {
    const response = await ApiService<VendorStaffResponseDto>('/vendor-staff', 'POST', payload);
    return mapVendorStaff(unwrapResponse(response));
  },

  async updateStatus(staffId: string, isActive: boolean): Promise<VendorStaffMember> {
    const response = await ApiService<VendorStaffResponseDto>(
      `/vendor-staff/${staffId}/status`,
      'PUT',
      { isActive }
    );
    return mapVendorStaff(unwrapResponse(response));
  },

  async updateRole(staffId: string, role: VendorStaffRole): Promise<VendorStaffMember> {
    const response = await ApiService<VendorStaffResponseDto>(
      `/vendor-staff/${staffId}/role`,
      'PATCH',
      { role }
    );
    return mapVendorStaff(unwrapResponse(response));
  },
};
