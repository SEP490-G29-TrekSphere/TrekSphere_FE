import { ApiService } from '@/config/apiClient';
import type { TourListApiResponse, TourListParams } from '../types';

export interface TourListResponse {
  content: TourListApiResponse['content'];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  last: boolean;
}

export const tourService = {
  async getTours(params: TourListParams = {}): Promise<TourListResponse> {
    const { page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc' } = params;

    const queryParams = new URLSearchParams({
      page: String(page),
      size: String(size),
      sortBy,
      sortDir,
    });

    const response = await ApiService<TourListApiResponse>(`/tours?${queryParams}`, 'GET');

    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.data) {
      throw new Error('No data received from API');
    }

    return {
      content: response.data.content,
      totalElements: response.data.totalElements,
      totalPages: response.data.totalPages,
      pageNumber: response.data.pageNumber,
      last: response.data.last,
    };
  },
};
