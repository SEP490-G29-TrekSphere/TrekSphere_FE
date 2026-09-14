import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useChatWebSocket } from '@/features/chat/context/ChatWebSocketContext';
import { toast } from '@/store/useToastStore';
import type { SosAlertResponse } from '../../types/sos';
import { groupWorkspaceKeys } from '../groupWorkspaceKeys';

/**
 * Subscribe vào "/topic/matching-groups/{groupId}/sos" bằng chung 1 kết nối STOMP đã có
 * sẵn từ chat (không mở thêm SockJS connection thứ 2) — copy pattern từ
 * `useNotificationSocket`. Khi có alert mới/được đóng: invalidate cache active + history,
 * hiện toast tương ứng. Mount 1 lần trong `GroupWorkspace` (nơi đã biết `groupId`).
 */
export function useSosSocket(groupId?: string) {
  const { client, isConnected } = useChatWebSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!client || !isConnected || !groupId) return;

    const subscription = client.subscribe(`/topic/matching-groups/${groupId}/sos`, (message) => {
      if (!message.body) return;
      try {
        const alert: SosAlertResponse = JSON.parse(message.body);
        queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.sosActive(groupId) });
        queryClient.invalidateQueries({
          queryKey: [...groupWorkspaceKeys.all, 'sos-history', groupId],
        });

        if (alert.status === 'OPEN') {
          toast.sos(`${alert.senderName} vừa phát tín hiệu SOS trong nhóm. Hãy kiểm tra ngay!`, {
            title: '🚨 Tín hiệu SOS khẩn cấp',
            duration: 15000,
          });
        } else {
          toast.info('Tín hiệu SOS đã được đóng. Sự cố đã được xử lý, mọi người có thể yên tâm.', {
            title: 'Tín hiệu SOS đã được xử lý',
          });
        }
      } catch {
        // Bỏ qua payload không đúng định dạng, không làm crash app.
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [client, isConnected, groupId, queryClient]);
}
