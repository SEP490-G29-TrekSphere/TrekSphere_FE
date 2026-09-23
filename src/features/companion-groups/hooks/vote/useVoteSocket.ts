import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useChatWebSocket } from '@/features/chat/context/ChatWebSocketContext';
import { toast } from '@/store/useToastStore';
import type { GroupVoteResponse } from '../../types/vote';
import { groupWorkspaceKeys } from '../groupWorkspaceKeys';

export function useVoteSocket(groupId?: string) {
  const { client, isConnected } = useChatWebSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!client || !isConnected || !groupId) return;

    const subscription = client.subscribe(`/topic/matching-groups/${groupId}/votes`, (message) => {
      if (!message.body) return;
      try {
        const vote: GroupVoteResponse = JSON.parse(message.body);
        queryClient.invalidateQueries({ queryKey: [...groupWorkspaceKeys.all, 'votes', groupId] });
        queryClient.invalidateQueries({
          queryKey: groupWorkspaceKeys.voteDetail(groupId, vote.groupVoteId),
        });

        if (vote.status === 'OPEN') {
          toast.info(
            `${vote.createdByName} vừa mở bình chọn "${vote.title}". Hãy vào bỏ phiếu nhé!`,
            {
              title: 'Có bình chọn mới trong nhóm',
            }
          );
        } else {
          toast.info(`Bình chọn "${vote.title}" đã có kết quả.`, {
            title: 'Bình chọn đã kết thúc',
          });
        }
      } catch {

      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [client, isConnected, groupId, queryClient]);
}
