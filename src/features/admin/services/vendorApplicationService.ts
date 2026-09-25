import { type ApiResponse, ApiService, ApiUpload } from '@/config/apiClient';

export type ApplicationStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Applicant {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  roles: string[];
}

export interface VendorApplication {
  vendorApplicationId: string;
  applicant: Applicant;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  businessDescription?: string;
  applicationStatus: ApplicationStatus;
  rejectionReason?: string;
  taxCode?: string;
  businessLicenseUrl?: string;
  businessAddress?: string;
  legalRepresentativeName?: string;
  legalRepresentativePosition?: string;
  createdAt: string;
}

export type VendorApplicationDetail = VendorApplication;

export interface VendorApplicationsResponse {
  content: VendorApplication[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface VendorApplicationFilter {
  status?: ApplicationStatus | 'ALL';
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
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

export const vendorApplicationService = {
  async getApplications(filter: VendorApplicationFilter = {}): Promise<VendorApplicationsResponse> {
    const { status, keyword, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc' } = filter;

    const params: Record<string, string> = {
      page: String(page),
      size: String(size),
      sortBy,
      sortDir,
    };

    if (status && status !== 'ALL') {
      params.status = status;
    }
    if (keyword && keyword.trim() !== '') {
      params.keyword = keyword.trim();
    }

    const response = await ApiService<VendorApplicationsResponse>(
      '/vendors/applications',
      'GET',
      undefined,
      params
    );

    return unwrapResponse(response);
  },

  async getStats(): Promise<{
    all: number;
    draft: number;
    pending: number;
    approved: number;
    rejected: number;
  }> {
    const [allRes, draftRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
      vendorApplicationService.getApplications({ page: 0, size: 1 }),
      vendorApplicationService.getApplications({ status: 'DRAFT', page: 0, size: 1 }),
      vendorApplicationService.getApplications({ status: 'PENDING', page: 0, size: 1 }),
      vendorApplicationService.getApplications({ status: 'APPROVED', page: 0, size: 1 }),
      vendorApplicationService.getApplications({ status: 'REJECTED', page: 0, size: 1 }),
    ]);

    return {
      all: allRes.totalElements ?? 0,
      draft: draftRes.totalElements ?? 0,
      pending: pendingRes.totalElements ?? 0,
      approved: approvedRes.totalElements ?? 0,
      rejected: rejectedRes.totalElements ?? 0,
    };
  },

  async getApplicationById(id: string): Promise<VendorApplicationDetail> {
    const response = await ApiService<VendorApplicationDetail>(
      `/vendors/applications/${id}`,
      'GET'
    );
    return unwrapResponse(response);
  },

  async getMyApplications(
    filter: VendorApplicationFilter = {}
  ): Promise<VendorApplicationsResponse> {
    const { status, keyword, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc' } = filter;

    const params: Record<string, string> = {
      page: String(page),
      size: String(size),
      sortBy,
      sortDir,
    };

    if (status && status !== 'ALL') {
      params.status = status;
    }
    if (keyword && keyword.trim() !== '') {
      params.keyword = keyword.trim();
    }

    const response = await ApiService<VendorApplicationsResponse>(
      '/vendors/applications/my-history',
      'GET',
      undefined,
      params
    );

    return unwrapResponse(response);
  },

  async createDraftApplication(formData: FormData): Promise<VendorApplicationDetail> {
    const response = await ApiUpload<VendorApplicationDetail>('/vendors/applications', formData);
    return unwrapResponse(response);
  },

  async updateApplication(id: string, formData: FormData): Promise<VendorApplicationDetail> {
    const response = await ApiUpload<VendorApplicationDetail>(
      `/vendors/applications/${id}`,
      formData,
      'PUT'
    );
    return unwrapResponse(response);
  },

  async submitApplication(id: string): Promise<VendorApplicationDetail> {
    const response = await ApiService<VendorApplicationDetail>(
      `/vendors/applications/${id}/submit`,
      'POST'
    );
    return unwrapResponse(response);
  },

  async resubmitApplication(id: string): Promise<VendorApplicationDetail> {
    const response = await ApiService<VendorApplicationDetail>(
      `/vendors/applications/${id}/resubmit`,
      'POST'
    );
    return unwrapResponse(response);
  },

  async reviewApplication(
    id: string,
    payload: { status: ApplicationStatus; rejectionReason?: string }
  ): Promise<VendorApplicationDetail> {
    const response = await ApiService<VendorApplicationDetail>(
      `/vendors/applications/${id}/review`,
      'POST',
      payload
    );
    return unwrapResponse(response);
  },
};
