import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useChatWebSocket } from '@/features/chat/context/ChatWebSocketContext';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { notificationKeys } from '../hooks/useNotifications';
import type { Notification } from '../types/notification';

export function NotificationRealtimeBridge() {
  const user = useAppStore((state) => state.user);
  const { client, isConnected } = useChatWebSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user || !client || !isConnected) return;

    const subscription = client.subscribe('/user/queue/notifications', (message) => {
      const notification = JSON.parse(message.body) as Notification;
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.info(notification.title);
    });

    queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    return () => subscription.unsubscribe();
  }, [client, isConnected, queryClient, user]);

  return null;
}
