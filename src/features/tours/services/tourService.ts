import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  CreateReviewRequest,
  ReviewListParams,
  ReviewResponse,
  ReviewSummaryResponse,
  TourCheckpoint,
  TourDetailFromApi,
  TourDetailScheduleApi,
  TourListApiResponse,
  TourListParams,
} from '@/features/tours/types';

export interface TourListResponse {
  content: TourListApiResponse['content'];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  last: boolean;
}

/**
 * Serialize a `TourListParams` object into a query string. Only includes
 * keys with defined, non-empty values — the backend treats `keyword=` as
 * a meaningful (empty) search, but `keyword` absent means "no filter".
 */
function buildQuery(params: TourListParams): string {
  const search = new URLSearchParams();

  if (params.keyword !== undefined && params.keyword !== '') {
    search.set('keyword', params.keyword);
  }
  if (params.location !== undefined && params.location !== '') {
    search.set('location', params.location);
  }
  if (params.difficulty) {
    search.set('difficulty', params.difficulty);
  }
  if (params.departureDate !== undefined && params.departureDate !== '') {
    search.set('departureDate', params.departureDate);
  }
  if (params.returnDate !== undefined && params.returnDate !== '') {
    search.set('returnDate', params.returnDate);
  }
  if (params.page !== undefined) {
    search.set('page', String(params.page));
  }
  if (params.size !== undefined) {
    search.set('size', String(params.size));
  }
  if (params.sortBy) {
    search.set('sortBy', params.sortBy);
  }
  if (params.sortDir) {
    search.set('sortDir', params.sortDir);
  }

  return search.toString();
}

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.error) {
    throw new Error(response.error);
  }
  if (!response.data) {
    throw new Error('No data received from API');
  }
  return response.data;
}

export const tourService = {
  async getTours(params: TourListParams = {}): Promise<TourListResponse> {
    const queryString = buildQuery(params);
    const path = queryString ? `/tours?${queryString}` : '/tours';

    const response = await ApiService<TourListApiResponse>(path, 'GET');
    const data = unwrapResponse(response);

    return {
      content: data.content,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      pageNumber: data.pageNumber,
      pageSize: data.pageSize,
      last: data.last,
    };
  },

  async getTourById(tourId: string): Promise<TourDetailFromApi> {
    const response = await ApiService<TourDetailFromApi>(`/tours/${tourId}`, 'GET');
    const data = unwrapResponse(response);
    const hasRequiredPolicies = Boolean(data.paymentPolicy && data.participationPolicy);
    return {
      ...data,
      onlineBookingEnabled: data.onlineBookingEnabled === true && hasRequiredPolicies,
      onlineBookingDisabledReason:
        data.onlineBookingDisabledReason ??
        (!data.participationPolicy
          ? 'Tour chưa có điều kiện tham gia.'
          : !data.paymentPolicy
            ? 'Tour chưa có chính sách thanh toán.'
            : 'Tour chưa sẵn sàng nhận đặt online.'),
    };
  },

  async validateVoucher(
    code: string,
    subtotal: number,
    vendorId?: string
  ): Promise<{ discountAmount: number; isValid: boolean }> {
    const response = await ApiService<{
      discountAmount: number;
      message: string;
      valid: boolean;
    }>('/vouchers/validate', 'POST', {
      code,
      orderValue: subtotal,
      vendorId: vendorId || '',
    });

    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.data) {
      throw new Error(response.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
    }

    return {
      discountAmount: response.data.discountAmount,
      isValid: response.data.valid,
    };
  },

  /** `POST /tracking/sos` — gửi tín hiệu cấp cứu kèm toạ độ GPS thực tế. */
  async sendSos(payload: {
    tourSessionId: string;
    latitude: number;
    longitude: number;
    message?: string;
  }): Promise<{ sosAlertId: string; status: 'PENDING' | 'RESOLVED'; createdAt: string }> {
    const response = await ApiService<{
      sosAlertId: string;
      status: 'PENDING' | 'RESOLVED';
      createdAt: string;
    }>('/tracking/sos', 'POST', payload);
    return unwrapResponse(response);
  },

  async getTourCheckpoints(tourId: string): Promise<TourCheckpoint[]> {
    const response = await ApiService<TourCheckpoint[]>(`/tours/${tourId}/checkpoints`, 'GET');
    return unwrapResponse(response);
  },

  async getTourSchedules(tourId: string): Promise<TourDetailScheduleApi[]> {
    const response = await ApiService<TourDetailScheduleApi[]>(`/tours/${tourId}/schedules`, 'GET');
    return unwrapResponse(response);
  },

  async getTourReviews(
    tourId: string,
    params: ReviewListParams = {}
  ): Promise<ReviewSummaryResponse> {
    const searchParams = new URLSearchParams();
    if (params.rating !== undefined) {
      searchParams.set('rating', String(params.rating));
    }
    if (params.keyword !== undefined && params.keyword !== '') {
      searchParams.set('keyword', params.keyword);
    }
    if (params.page !== undefined) {
      searchParams.set('page', String(params.page));
    }
    if (params.size !== undefined) {
      searchParams.set('size', String(params.size));
    }
    if (params.sortBy) {
      searchParams.set('sortBy', params.sortBy);
    }
    if (params.sortDir) {
      searchParams.set('sortDir', params.sortDir);
    }
    const queryString = searchParams.toString();
    const path = queryString
      ? `/tours/${tourId}/reviews?${queryString}`
      : `/tours/${tourId}/reviews`;
    const response = await ApiService<ReviewSummaryResponse>(path, 'GET');
    return unwrapResponse(response);
  },

  async createReview(reviewData: CreateReviewRequest): Promise<ReviewResponse> {
    const response = await ApiService<ReviewResponse>('/reviews', 'POST', reviewData);
    return unwrapResponse(response);
  },

  async updateReviewStatus(
    reviewId: string,
    status: 'PENDING' | 'APPROVED' | 'HIDDEN'
  ): Promise<ReviewResponse> {
    const response = await ApiService<ReviewResponse>(`/reviews/${reviewId}/status`, 'PATCH', {
      status,
    });
    return unwrapResponse(response);
  },
};
