import { useQuery } from '@tanstack/react-query';
import { chatService } from '../services/chatService';

/**
 * Danh sách thành viên của một cuộc hội thoại.
 * `enabled` cho phép chỉ gọi API khi panel thành viên thực sự được mở.
 */
export function useConversationMembers(conversationId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['chatConversationMembers', conversationId],
    queryFn: () => chatService.getConversationMembers(conversationId as string),
    enabled: Boolean(conversationId) && enabled,
    staleTime: 60_000,
  });
}
