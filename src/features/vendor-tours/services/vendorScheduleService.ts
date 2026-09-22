import { type ApiResponse, ApiService } from '@/config/apiClient';
import type { CreateSchedulePayload, TourSchedule, UpdateSchedulePayload } from '../types';

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.error) {
    throw new Error(response.error);
  }
  if (response.data === undefined) {
    throw new Error('Không nhận được dữ liệu từ máy chủ');
  }
  return response.data;
}

export const vendorScheduleService = {

  async createSchedule(tourId: string, payload: CreateSchedulePayload): Promise<TourSchedule> {
    const response = await ApiService<TourSchedule>(
      `/vendor/tours/${tourId}/schedules`,
      'POST',
      payload
    );
    return unwrapResponse(response);
  },

  async updateSchedule(scheduleId: string, payload: UpdateSchedulePayload): Promise<TourSchedule> {
    const response = await ApiService<TourSchedule>(
      `/vendor/tours/schedules/${scheduleId}`,
      'PUT',
      payload
    );
    return unwrapResponse(response);
  },

  async deleteSchedule(scheduleId: string): Promise<void> {
    const response = await ApiService<void>(`/vendor/tours/schedules/${scheduleId}`, 'DELETE');
    if (response.error) {
      throw new Error(response.error);
    }
  },
};
