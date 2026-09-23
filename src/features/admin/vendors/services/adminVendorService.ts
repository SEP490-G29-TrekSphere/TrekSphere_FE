import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  AdminVendor,
  AdminVendorFilter,
  AdminVendorsResponse,
  VendorStatsResponse,
  VendorStatus,
} from '../types';

interface VendorResponseDto {
  vendorId: string;
  companyName: string;
  description?: string | null;
  logoUrl?: string | null;
  contactEmail: string;
  contactPhone?: string | null;
  taxCode?: string | null;
  businessLicenseUrl?: string | null;
  status: VendorStatus;
  manager?: {
    userId: string;
    email: string;
    fullName: string;
    phone: string;
    dateOfBirth?: string | null;
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
    avatarUrl?: string | null;
    status: 'ACTIVE' | 'LOCKED' | 'DEACTIVATED';
    emailVerified: boolean;
    roles: string[];
  } | null;
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

function mapVendor(dto: VendorResponseDto): AdminVendor {
  return {
    id: dto.vendorId,
    companyName: dto.companyName,
    description: dto.description ?? undefined,
    logoUrl: dto.logoUrl ?? undefined,
    contactEmail: dto.contactEmail,
    contactPhone: dto.contactPhone ?? undefined,
    taxCode: dto.taxCode ?? undefined,
    businessLicenseUrl: dto.businessLicenseUrl ?? undefined,
    status: dto.status,
    manager: dto.manager
      ? {
          userId: dto.manager.userId,
          email: dto.manager.email,
          fullName: dto.manager.fullName,
          phone: dto.manager.phone,
          dateOfBirth: dto.manager.dateOfBirth ?? undefined,
          gender: dto.manager.gender ?? undefined,
          avatarUrl: dto.manager.avatarUrl ?? undefined,
          status: dto.manager.status,
          emailVerified: dto.manager.emailVerified,
          roles: dto.manager.roles,
        }
      : undefined,
  };
}

function buildListParams(filter: AdminVendorFilter, page: number, pageSize: number) {
  const params: Record<string, string> = {
    page: String(page - 1),
    size: String(pageSize),
  };
  if (filter.search) {
    params.keyword = filter.search;
  }
  if (filter.status && filter.status !== 'ALL') {
    params.status = filter.status;
  }
  return params;
}

export const adminVendorService = {
  async listVendors(
    filter: AdminVendorFilter = {},
    page = 1,
    pageSize = 10
  ): Promise<AdminVendorsResponse> {
    const params = buildListParams(filter, page, pageSize);

    const response = await ApiService<PaginationResponseDto<VendorResponseDto>>(
      '/vendors',
      'GET',
      undefined,
      params
    );
    const data = unwrapResponse(response);

    return {
      vendors: data.content.map(mapVendor),
      total: data.totalElements,
      page,
      pageSize,
    };
  },

  async getStats(): Promise<VendorStatsResponse> {
    const fetchTotal = async (status?: VendorStatus) => {
      const response = await ApiService<PaginationResponseDto<VendorResponseDto>>(
        '/vendors',
        'GET',
        undefined,
        {
          page: '0',
          size: '1',
          ...(status ? { status } : {}),
        }
      );
      return unwrapResponse(response).totalElements ?? 0;
    };

    const [total, active, inactive, revoked] = await Promise.all([
      fetchTotal(),
      fetchTotal('ACTIVE'),
      fetchTotal('INACTIVE'),
      fetchTotal('REVOKED'),
    ]);

    return {
      total,
      active,
      inactive,
      revoked,
    };
  },

  async updateStatus(vendorId: string, status: VendorStatus): Promise<AdminVendor> {
    const response = await ApiService<VendorResponseDto>(`/vendors/${vendorId}/status`, 'PUT', {
      status,
    });
    return mapVendor(unwrapResponse(response));
  },
};
