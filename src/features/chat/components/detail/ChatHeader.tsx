import { ArrowLeft, Compass, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Conversation } from '../../types/types';
import { getInitials } from '../../utils/messageContent';
import { ChatActionsMenu } from '../ChatActionsMenu';

interface ChatHeaderProps {
  conversation: Conversation;
  isMembersOpen: boolean;
  onToggleMembers: () => void;
  onBack: () => void;
  onDeleteConversation: (conversationId: string) => void;
  onRemoveMember: (conversationId: string, memberId: string) => void;
}

export function ChatHeader({
  conversation,
  isMembersOpen,
  onToggleMembers,
  onBack,
  onDeleteConversation,
  onRemoveMember,
}: ChatHeaderProps) {
  const isGroup = conversation.tag?.text !== 'DIRECT';

  return (
    <header className="flex min-h-16 items-center justify-between gap-3 border-b border-border bg-background px-3 py-2.5 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full md:hidden"
          onClick={onBack}
          aria-label="Quay lại danh sách"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Avatar size="lg" className="shrink-0 bg-primary/10 font-bold text-primary">
          {conversation.avatarUrl ? (
            <AvatarImage src={conversation.avatarUrl} alt={conversation.userName} />
          ) : null}
          <AvatarFallback>{getInitials(conversation.userName)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <h2 className="truncate text-base font-bold leading-tight text-foreground">
            {conversation.userName}
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            {isGroup ? 'Nhóm trò chuyện' : 'Trò chuyện riêng'}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {conversation.tag?.text && (
          <Badge
            variant="secondary"
            className="hidden gap-1.5 rounded-full px-3 py-1.5 text-[11px] sm:inline-flex"
          >
            <Compass className="h-3.5 w-3.5" />
            {conversation.tag.text}
          </Badge>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMembers}
          aria-label="Danh sách thành viên"
          aria-pressed={isMembersOpen}
          className={cn('rounded-full', isMembersOpen && 'bg-muted text-foreground')}
        >
          <Users className="h-5 w-5" />
        </Button>

        <ChatActionsMenu
          conversation={conversation}
          onDeleteConversation={onDeleteConversation}
          onRemoveMember={onRemoveMember}
        />
      </div>
    </header>
  );
}
