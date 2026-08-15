import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store/useAppStore';
import { notificationService } from '../services/notificationService';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (page: number, isRead?: boolean) =>
    [...notificationKeys.all, 'list', page, isRead ?? 'all'] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

export function useNotifications(page = 0, isRead?: boolean) {
  const isAuthenticated = useAppStore((state) => Boolean(state.user));
  return useQuery({
    queryKey: notificationKeys.list(page, isRead),
    queryFn: () => notificationService.getNotifications(page, 20, isRead),
    enabled: isAuthenticated,
    staleTime: 15_000,
  });
}

export function useUnreadNotificationCount() {
  const isAuthenticated = useAppStore((state) => Boolean(state.user));
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: notificationService.getUnreadCount,
    enabled: isAuthenticated,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}
