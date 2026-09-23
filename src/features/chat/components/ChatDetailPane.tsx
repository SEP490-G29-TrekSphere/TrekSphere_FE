import { MessageSquare } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Conversation, DetailMessage } from '@/features/chat/types/types';
import { ChatComposer } from './detail/ChatComposer';
import { ChatHeader } from './detail/ChatHeader';
import { MembersPanel } from './detail/MembersPanel';
import { MessageTimeline } from './detail/MessageTimeline';

interface ChatDetailPaneProps {
  selectedConversation: Conversation | undefined;
  currentMessages: DetailMessage[];
  isLoadingMessages: boolean;
  isSending: boolean;
  draftTour?: import('@/features/chat/types/types').DraftTourAttachment;
  onRemoveDraftTour?: () => void;
  initialDraftMessage?: string;
  onSendMessage: (message: string) => void;
  onBack: () => void;
  onDeleteConversation: (conversationId: string) => void;
  onRemoveMember: (conversationId: string, memberId: string) => void;
}

/**
 * Khung chat bên phải: header, dòng thời gian tin nhắn, ô soạn tin và
 * panel thành viên có thể ẩn/hiện.
 */
export function ChatDetailPane({
  selectedConversation,
  currentMessages,
  isLoadingMessages,
  isSending,
  draftTour,
  onRemoveDraftTour,
  initialDraftMessage,
  onSendMessage,
  onBack,
  onDeleteConversation,
  onRemoveMember,
}: ChatDetailPaneProps) {
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [unreadMarkerId, setUnreadMarkerId] = useState<string | null>(null);
  const markedConversationIdRef = useRef<string | undefined>(undefined);

  const conversationId = selectedConversation?.id;
  const unreadCount = selectedConversation?.unreadCount || 0;
  const isGroup =
    selectedConversation?.tag?.text !== 'DIRECT' &&
    selectedConversation?.virtualData?.type !== 'DIRECT';

  // Đóng panel thành viên khi chuyển sang chat 1v1
  useEffect(() => {
    if (!isGroup) {
      setIsMembersOpen(false);
    }
  }, [isGroup]);

  // Chốt vị trí vạch "tin nhắn chưa đọc" một lần khi mở cuộc hội thoại, để nó
  // không nhảy đi khi tin nhắn được đánh dấu đã đọc ngay sau đó.
  useEffect(() => {
    if (!conversationId || conversationId === markedConversationIdRef.current) return;
    if (currentMessages.length === 0) return;

    if (unreadCount > 0) {
      const incoming = currentMessages.filter((message) => !message.isOwn);
      setUnreadMarkerId(incoming[incoming.length - unreadCount]?.id ?? null);
    } else {
      setUnreadMarkerId(null);
    }
    markedConversationIdRef.current = conversationId;
  }, [conversationId, unreadCount, currentMessages]);

  if (!selectedConversation) {
    return (
      <div className="hidden flex-1 flex-col items-center justify-center bg-muted/10 p-8 text-center text-muted-foreground md:flex">
        <MessageSquare className="mb-4 h-12 w-12 stroke-1" />
        <h3 className="text-lg font-bold">Chưa chọn cuộc trò chuyện nào</h3>
        <p className="text-sm">Chọn một phòng chat ở thanh bên trái để bắt đầu.</p>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 bg-background">
      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          conversation={selectedConversation}
          isMembersOpen={isMembersOpen}
          onToggleMembers={() => setIsMembersOpen((open) => !open)}
          onBack={onBack}
          onDeleteConversation={onDeleteConversation}
          onRemoveMember={onRemoveMember}
        />

        <MessageTimeline
          messages={currentMessages}
          isLoading={isLoadingMessages}
          unreadMarkerId={unreadMarkerId}
          conversationId={selectedConversation.id}
        />

        <ChatComposer
          onSendMessage={onSendMessage}
          isSending={isSending}
          draftTour={draftTour}
          onRemoveDraftTour={onRemoveDraftTour}
          initialDraftMessage={initialDraftMessage}
          placeholder={`Nhắn cho ${selectedConversation.userName}...`}
        />
      </div>

      {isGroup && isMembersOpen && (
        <div className="hidden md:flex">
          <MembersPanel
            conversationId={selectedConversation.id}
            open={isMembersOpen}
            onClose={() => setIsMembersOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
