import { MessageSquare, Search, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Conversation } from '@/features/chat/types/types';
import { cn } from '@/lib/utils';
import { AppSpinner } from '@/shared/ui';
import { getConversationPreview, getInitials } from '../utils/messageContent';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelectConversation: (id: string) => void;
}

export function ConversationList({
  conversations,
  selectedId,
  isLoading,
  searchQuery,
  onSearchChange,
  onSelectConversation,
}: ConversationListProps) {
  const totalUnread = conversations.reduce(
    (total, conversation) => total + (conversation.unreadCount || 0),
    0
  );

  return (
    <div
      className={cn(
        'w-full shrink-0 flex-col border-r border-border bg-background md:flex md:w-80 lg:w-96',
        selectedId ? 'hidden' : 'flex'
      )}
    >
      <div className="space-y-3 border-b border-border px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground">Phòng chat</h1>
          {totalUnread > 0 && (
            <span className="rounded-full bg-destructive px-2 py-0.5 text-[11px] font-bold text-destructive-foreground">
              {totalUnread > 99 ? '99+' : totalUnread} mới
            </span>
          )}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm cuộc trò chuyện..."
            aria-label="Tìm cuộc trò chuyện"
            className="h-10 w-full rounded-full border border-border bg-muted/40 pr-9 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:bg-background"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Xoá từ khoá"
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <AppSpinner size="lg" className="text-primary" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <MessageSquare className="mb-2 h-8 w-8 stroke-1" />
            <p className="text-sm">
              {searchQuery
                ? `Không có kết quả cho "${searchQuery}"`
                : 'Không tìm thấy cuộc trò chuyện nào'}
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((item) => {
              const isSelected = item.id === selectedId;

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => onSelectConversation(item.id)}
                  className={cn(
                    'relative flex w-full cursor-pointer gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none',
                    isSelected && 'bg-secondary/30 hover:bg-secondary/40'
                  )}
                >
                  {isSelected && (
                    <span className="absolute top-1/2 left-0 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                  )}

                  <Avatar size="lg" className="shrink-0 bg-primary/10 font-bold text-primary">
                    {item.avatarUrl ? (
                      <AvatarImage src={item.avatarUrl} alt={item.userName} />
                    ) : null}
                    <AvatarFallback>{getInitials(item.userName)}</AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-baseline justify-between gap-2">
                      <h3
                        className={cn(
                          'truncate text-sm text-foreground',
                          item.unread ? 'font-bold' : 'font-semibold'
                        )}
                      >
                        {item.userName}
                      </h3>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {item.lastMessageTime}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          'truncate text-xs',
                          item.unread ? 'font-medium text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {getConversationPreview(item.lastMessage)}
                      </p>
                      {item.unreadCount ? (
                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
                          {item.unreadCount > 99 ? '99+' : item.unreadCount}
                        </span>
                      ) : null}
                    </div>

                    {item.tag?.text && (
                      <span className="mt-1.5 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                        {item.tag.text === 'DIRECT' ? 'Riêng tư' : 'Nhóm'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
