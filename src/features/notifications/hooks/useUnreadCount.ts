import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.unreadCount(),
    refetchOnMount: 'always',
  });
}
