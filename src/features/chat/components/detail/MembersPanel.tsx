import { Users, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AppSpinner } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { useConversationMembers } from '../../hooks/useConversationMembers';
import { getInitials } from '../../utils/messageContent';

interface MembersPanelProps {
  conversationId: string;
  open: boolean;
  onClose: () => void;
}

/** Panel thành viên bên phải khung chat (ẩn/hiện bằng nút trên header). */
export function MembersPanel({ conversationId, open, onClose }: MembersPanelProps) {
  const { user } = useAppStore();
  const { data: members, isLoading, error } = useConversationMembers(conversationId, open);

  if (!open) return null;

  return (
    <aside className="flex w-full shrink-0 flex-col border-l border-border bg-background md:w-64 lg:w-72">
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <h2 className="flex items-center gap-2 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
          <Users className="h-3.5 w-3.5" />
          Thành viên{members ? ` (${members.length})` : ''}
        </h2>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Đóng danh sách thành viên"
          className="rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex h-24 items-center justify-center">
            <AppSpinner className="text-primary" />
          </div>
        ) : error ? (
          <p className="px-4 py-6 text-center text-xs text-muted-foreground">
            Không tải được danh sách thành viên
          </p>
        ) : !members || members.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-muted-foreground">
            Chưa có thành viên nào
          </p>
        ) : (
          <ul className="space-y-1 p-2">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/50"
              >
                <Avatar className="h-8 w-8 bg-primary/10 text-[11px] font-bold text-primary">
                  {member.avatarUrl ? (
                    <AvatarImage src={member.avatarUrl} alt={member.fullName} />
                  ) : null}
                  <AvatarFallback>{getInitials(member.fullName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {member.fullName}
                    {member.id === user?.id && (
                      <span className="ml-1.5 text-[11px] font-medium text-muted-foreground">
                        (Bạn)
                      </span>
                    )}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">{member.email}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </aside>
  );
}
