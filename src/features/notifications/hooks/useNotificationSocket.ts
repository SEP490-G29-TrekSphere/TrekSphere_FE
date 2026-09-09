import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useChatWebSocket } from '@/features/chat/context/ChatWebSocketContext';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import type { NotificationResponse } from '../types/notification';

/**
 * Subscribe vào "/topic/notifications/{currentUserId}" bằng chung 1 kết nối STOMP đã có
 * sẵn từ chat (không mở thêm SockJS connection thứ 2). Khi có thông báo mới: invalidate
 * cache số chưa đọc/danh sách + hiện toast. Chỉ cần mount 1 lần gần app root.
 */
export function useNotificationSocket() {
  const { client, isConnected } = useChatWebSocket();
  const queryClient = useQueryClient();
  const userId = useAppStore((state) => state.user?.id);

  useEffect(() => {
    if (!client || !isConnected || !userId) return;

    const subscription = client.subscribe(`/topic/notifications/${userId}`, (message) => {
      if (!message.body) return;
      try {
        const notification: NotificationResponse = JSON.parse(message.body);
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        toast.info(notification.content, { title: notification.title });
      } catch {
        // Bỏ qua payload không đúng định dạng, không làm crash app.
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [client, isConnected, userId, queryClient]);
}
