import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import type { NotificationListParams } from '../types/notification';

export function useNotifications(params: NotificationListParams = {}) {
  const page = params.page ?? 1;
  const size = params.size ?? 10;
  const { isRead } = params;

  return useQuery({
    queryKey: ['notifications', page, size, isRead],
    queryFn: () => notificationService.list({ page, size, isRead }),
    refetchOnMount: 'always',
    gcTime: 0,
  });
}
