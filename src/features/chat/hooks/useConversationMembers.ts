import { useQuery } from '@tanstack/react-query';
import { chatService } from '../services/chatService';

export function useConversationMembers(conversationId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['chatConversationMembers', conversationId],
    queryFn: () => chatService.getConversationMembers(conversationId as string),
    enabled: Boolean(conversationId) && enabled,
    staleTime: 60_000,
  });
}
