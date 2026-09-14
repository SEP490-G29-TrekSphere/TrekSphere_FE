import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from '@/components/ui/message-scroller';
import { cn } from '@/lib/utils';
import { AppModalShell, AppSpinner } from '@/shared/ui';
import type { DetailMessage } from '../../types/types';
import {
  buildTimeline,
  formatMessageTime,
  getInitials,
  getMessageImageUrl,
  type MessageGroup,
} from '../../utils/messageContent';

interface MessageTimelineProps {
  messages: DetailMessage[];
  isLoading: boolean;
  unreadMarkerId: string | null;
  /** Đổi giá trị này để cuộn xuống cuối (thường là id cuộc hội thoại đang mở). */
  conversationId: string;
}

export function MessageTimeline({
  messages,
  isLoading,
  unreadMarkerId,
  conversationId,
}: MessageTimelineProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const timeline = buildTimeline(messages, unreadMarkerId);

  return (
    <MessageScrollerProvider autoScroll>
      <AutoScrollOnChange dependencies={[messages.length, conversationId, isLoading]} />
      <MessageScroller className="flex-1 bg-muted/5">
        <MessageScrollerViewport className="px-3 py-6 sm:px-4">
          <MessageScrollerContent>
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <AppSpinner size="lg" className="text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <EmptyConversation />
            ) : (
              timeline.map((item) => {
                if (item.kind === 'day') {
                  return (
                    <MessageScrollerItem key={item.id} messageId={item.id}>
                      <DayDivider label={item.label} />
                    </MessageScrollerItem>
                  );
                }

                if (item.kind === 'unread') {
                  return (
                    <MessageScrollerItem key={item.id} messageId={item.id}>
                      <UnreadDivider />
                    </MessageScrollerItem>
                  );
                }

                return (
                  <MessageScrollerItem key={item.id} messageId={item.id} scrollAnchor={!item.isOwn}>
                    <MessageGroupRow group={item} onOpenImage={setLightboxUrl} />
                  </MessageScrollerItem>
                );
              })
            )}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>

      <AppModalShell
        open={lightboxUrl !== null}
        onClose={() => setLightboxUrl(null)}
        showCloseButton
        aria-label="Xem ảnh"
        className="max-w-3xl bg-transparent p-0 shadow-none"
        backdropClassName="bg-black/80"
      >
        {lightboxUrl && (
          <img
            src={lightboxUrl}
            alt="Ảnh trong cuộc trò chuyện"
            className="max-h-[85vh] w-full rounded-xl object-contain"
          />
        )}
      </AppModalShell>
    </MessageScrollerProvider>
  );
}

function MessageGroupRow({
  group,
  onOpenImage,
}: {
  group: MessageGroup;
  onOpenImage: (url: string) => void;
}) {
  const lastMessage = group.messages.at(-1);
  const showSeen = group.isOwn && lastMessage?.isSeen;

  if (group.isOwn) {
    return (
      <div className="flex flex-col items-end px-1 py-1">
        <div className="flex max-w-[85%] flex-col items-end gap-0.5 sm:max-w-[75%] md:max-w-[65%]">
          {group.messages.map((message, index) => {
            const imageUrl = getMessageImageUrl(message.text);
            const isFirst = index === 0;
            const isLast = index === group.messages.length - 1;
            const timeStr = formatMessageTime(message.createdAt);

            if (imageUrl) {
              return (
                <div key={message.id} className="relative py-0.5" title={timeStr}>
                  <button
                    type="button"
                    onClick={() => onOpenImage(imageUrl)}
                    className="block cursor-zoom-in overflow-hidden rounded-2xl ring-1 ring-border/50 transition-opacity hover:opacity-95 shadow-xs"
                  >
                    <img
                      src={imageUrl}
                      alt="Ảnh đã gửi"
                      loading="lazy"
                      className="max-h-72 max-w-xs object-cover"
                    />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={message.id}
                title={timeStr}
                className={cn(
                  'bg-primary text-primary-foreground px-3.5 py-1.5 text-sm leading-relaxed break-words whitespace-pre-wrap shadow-xs transition-colors',
                  'rounded-2xl',
                  // Hiệu ứng bo góc Messenger: các tin nhắn liên tiếp ép sát nhau
                  group.messages.length > 1 && [
                    isFirst && 'rounded-br-sm',
                    !isFirst && !isLast && 'rounded-r-sm',
                    isLast && 'rounded-tr-sm',
                  ]
                )}
              >
                {message.text}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 px-1 mt-0.5">
          <span className="text-[10px] text-muted-foreground">
            {formatMessageTime(group.createdAt)}
          </span>
          {showSeen && (
            <span className="text-[10px] font-medium text-muted-foreground">· Đã xem</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 px-1 py-1">
      <Avatar className="mt-0.5 h-8 w-8 shrink-0 bg-primary/10 text-xs font-bold text-primary">
        {group.avatarUrl ? <AvatarImage src={group.avatarUrl} alt={group.senderName} /> : null}
        <AvatarFallback>{getInitials(group.senderName)}</AvatarFallback>
      </Avatar>

      <div className="flex max-w-[85%] flex-col items-start gap-0.5 sm:max-w-[75%] md:max-w-[65%]">
        <div className="flex items-baseline gap-2 px-1 mb-0.5">
          <span className="text-xs font-semibold text-foreground/90">{group.senderName}</span>
          <span className="text-[10px] text-muted-foreground">
            {formatMessageTime(group.createdAt)}
          </span>
        </div>

        {group.messages.map((message, index) => {
          const imageUrl = getMessageImageUrl(message.text);
          const isFirst = index === 0;
          const isLast = index === group.messages.length - 1;
          const timeStr = formatMessageTime(message.createdAt);

          if (imageUrl) {
            return (
              <div key={message.id} className="relative py-0.5" title={timeStr}>
                <button
                  type="button"
                  onClick={() => onOpenImage(imageUrl)}
                  className="block cursor-zoom-in overflow-hidden rounded-2xl ring-1 ring-border/50 transition-opacity hover:opacity-95 shadow-xs"
                >
                  <img
                    src={imageUrl}
                    alt="Ảnh đã nhận"
                    loading="lazy"
                    className="max-h-72 max-w-xs object-cover"
                  />
                </button>
              </div>
            );
          }

          return (
            <div
              key={message.id}
              title={timeStr}
              className={cn(
                'bg-muted/80 text-foreground px-3.5 py-1.5 text-sm leading-relaxed break-words whitespace-pre-wrap shadow-xs transition-colors',
                'rounded-2xl',
                // Hiệu ứng bo góc Messenger cho chuỗi tin nhắn bên trái
                group.messages.length > 1 && [
                  isFirst && 'rounded-bl-sm',
                  !isFirst && !isLast && 'rounded-l-sm',
                  isLast && 'rounded-tl-sm',
                ]
              )}
            >
              {message.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-4">
      <span className="h-px flex-1 bg-border" />
      <span className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

function UnreadDivider() {
  return (
    <div className="flex items-center gap-3 px-3 py-3">
      <span className="h-2 w-2 shrink-0 rounded-full bg-destructive" />
      <span className="h-px flex-1 bg-destructive/40" />
      <span className="text-[11px] font-bold tracking-wide text-destructive uppercase">
        Tin nhắn chưa đọc
      </span>
      <span className="h-px flex-1 bg-destructive/40" />
    </div>
  );
}

function EmptyConversation() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-sm font-semibold text-foreground">Chưa có tin nhắn nào</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Gửi lời chào để bắt đầu cuộc trò chuyện nhé.
      </p>
    </div>
  );
}

/** Cuộn xuống cuối mỗi khi danh sách tin nhắn hoặc cuộc hội thoại thay đổi. */
function AutoScrollOnChange({ dependencies }: { dependencies: unknown[] }) {
  const { scrollToBottom } = useMessageScroller();

  useEffect(
    () => {
      const timeoutId = setTimeout(() => scrollToBottom(), 10);
      return () => clearTimeout(timeoutId);
    },
    // biome-ignore lint/correctness/useExhaustiveDependencies: mảng dependency được truyền từ ngoài vào
    dependencies
  );

  return null;
}
