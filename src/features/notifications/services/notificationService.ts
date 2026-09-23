import { ApiService } from '@/config/apiClient';
import type {
  NotificationListParams,
  NotificationResponse,
  PaginationResponse,
} from '../types/notification';

export const notificationService = {
  list: async (
    params: NotificationListParams
  ): Promise<PaginationResponse<NotificationResponse>> => {
    const queryParams: Record<string, string> = {};
    if (params.page !== undefined) {
      queryParams.page = String(params.page);
    }
    if (params.size !== undefined) {
      queryParams.size = String(params.size);
    }
    if (params.isRead !== undefined) {
      queryParams.isRead = String(params.isRead);
    }

    const response = await ApiService<PaginationResponse<NotificationResponse>>(
      '/notifications',
      'GET',
      undefined,
      queryParams
    );

    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('No data returned from notifications API');
    }
    return response.data;
  },

  unreadCount: async (): Promise<number> => {
    const response = await ApiService<number>('/notifications/unread-count', 'GET');

    if (response.error) {
      throw new Error(response.error);
    }
    return response.data ?? 0;
  },

  markAsRead: async (id: string): Promise<void> => {
    const response = await ApiService<void>(`/notifications/${id}/read`, 'PATCH');
    if (response.error) {
      throw new Error(response.error);
    }
  },

  markAllAsRead: async (): Promise<void> => {
    const response = await ApiService<void>('/notifications/read-all', 'PATCH');
    if (response.error) {
      throw new Error(response.error);
    }
  },

  deleteNotification: async (id: string): Promise<void> => {
    const response = await ApiService<void>(`/notifications/${id}`, 'DELETE');
    if (response.error) {
      throw new Error(response.error);
    }
  },
};
