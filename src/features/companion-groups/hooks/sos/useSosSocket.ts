import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useChatWebSocket } from '@/features/chat/context/ChatWebSocketContext';
import { toast } from '@/store/useToastStore';
import type { SosAlertResponse } from '../../types/sos';
import { groupWorkspaceKeys } from '../groupWorkspaceKeys';

export function useSosSocket(groupId?: string) {
  const { client, isConnected, connectionEpoch } = useChatWebSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!client || !isConnected || !groupId) return;

    if (import.meta.env.DEV) {
      console.log(
        `[STOMP] Subscribing to SOS topic for group ${groupId} (epoch ${connectionEpoch})`
      );
    }

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
      } catch {}
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [client, isConnected, connectionEpoch, groupId, queryClient]);
}
