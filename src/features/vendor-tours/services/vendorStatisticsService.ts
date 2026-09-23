import { type ApiResponse, ApiService } from '@/config/apiClient';
import type { ApiStatus } from '../types';

export interface VendorStatisticsOverview {
  totalTours: number;
  draftTours: number;
  publishedTours: number;
  hiddenTours: number;
  futureOpenSchedules: number;
  matchingGroupCount: number;

  averageFillRate: number;

  fullGroupRate: number;
}

export interface VendorTourStatisticItem {
  tourId: string;
  tourName: string;
  status: ApiStatus;
  createdAt: string;
  publishedAt: string | null;
  openScheduleCount: number;
  closedScheduleCount: number;
  cancelledScheduleCount: number;
  matchingGroupCount: number;
  averageFillRate: number;
  fullGroupRate: number;
}

export interface VendorTourStatisticsFilter {
  keyword?: string;
  status?: ApiStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface VendorTourStatisticsResult {
  overview: VendorStatisticsOverview;
  tours: VendorTourStatisticItem[];
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

interface PaginationResponseDto<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

interface VendorTourStatisticsResponseDto {
  overview: VendorStatisticsOverview;
  tours: PaginationResponseDto<VendorTourStatisticItem>;
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

export const vendorStatisticsService = {
  async getStatistics(
    filter: VendorTourStatisticsFilter = {}
  ): Promise<VendorTourStatisticsResult> {
    const params: Record<string, string> = {
      page: String(filter.page ?? 0),
      size: String(filter.size ?? 10),
      sortBy: filter.sortBy ?? 'createdAt',
      sortDir: filter.sortDir ?? 'desc',
    };
    if (filter.keyword) params.keyword = filter.keyword;
    if (filter.status) params.status = filter.status;

    const response = await ApiService<VendorTourStatisticsResponseDto>(
      '/vendors/profile/statistics',
      'GET',
      undefined,
      params
    );
    const data = unwrapResponse(response);

    return {
      overview: data.overview,
      tours: data.tours.content,
      page: data.tours.pageNumber,
      pageSize: data.tours.pageSize,
      totalElements: data.tours.totalElements,
      totalPages: data.tours.totalPages,
    };
  },
};
