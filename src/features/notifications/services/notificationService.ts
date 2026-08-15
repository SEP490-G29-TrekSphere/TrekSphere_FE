import { type ApiResponse, ApiService } from '@/config/apiClient';
import type { Notification, NotificationPage } from '../types/notification';

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.error) throw new Error(response.message || response.error);
  if (response.data === undefined) throw new Error('Không nhận được dữ liệu từ máy chủ');
  return response.data;
}

export const notificationService = {
  async getNotifications(page = 0, size = 20, isRead?: boolean): Promise<NotificationPage> {
    const params: Record<string, string> = {
      page: page.toString(),
      size: size.toString(),
      sort: 'createdAt,desc',
    };
    if (isRead !== undefined) params.isRead = isRead.toString();
    return unwrapResponse(
      await ApiService<NotificationPage>('/notifications', 'GET', undefined, params)
    );
  },

  async getUnreadCount(): Promise<number> {
    const data = unwrapResponse(
      await ApiService<{ count: number }>('/notifications/unread-count', 'GET')
    );
    return data.count;
  },

  async markAsRead(notificationId: string): Promise<Notification> {
    return unwrapResponse(
      await ApiService<Notification>(`/notifications/${notificationId}/read`, 'PATCH')
    );
  },

  async markAllAsRead(): Promise<number> {
    const data = unwrapResponse(
      await ApiService<{ updatedCount: number }>('/notifications/read-all', 'PATCH')
    );
    return data.updatedCount;
  },
};
