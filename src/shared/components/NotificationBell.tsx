import { Bell } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getRoleNotificationsPath } from '@/constants/roles';
import { useMarkAllAsRead } from '@/features/notifications/hooks/useMarkAllAsRead';
import { useMarkAsRead } from '@/features/notifications/hooks/useMarkAsRead';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { useUnreadCount } from '@/features/notifications/hooks/useUnreadCount';
import type { NotificationResponse } from '@/features/notifications/types/notification';
import { formatRelativeTime } from '@/features/notifications/utils/formatRelativeTime';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

const INITIAL_LIMIT = 5;
const LOAD_MORE_STEP = 5;

export interface NotificationBellProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function NotificationBell({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: NotificationBellProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const [limit, setLimit] = useState(INITIAL_LIMIT);
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);

  const { data: unreadCount } = useUnreadCount();
  const { data: recent, isLoading } = useNotifications({ page: 1, size: limit });
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  const items = recent?.content ?? [];
  const hasUnread = (unreadCount ?? 0) > 0;
  const hasMore = recent ? !recent.last : false;
  const notificationsPath = getRoleNotificationsPath(user?.roles);

  const handleItemClick = (notification: NotificationResponse) => {
    if (!notification.isRead) {
      markAsRead(notification.notificationId);
    }
    handleOpenChange(false);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    controlledOnOpenChange?.(nextOpen);
    if (!nextOpen) {
      setLimit(INITIAL_LIMIT);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
        aria-label="Thông báo"
      >
        <Bell className="size-5" />
        {hasUnread && (
          <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {(unreadCount ?? 0) > 9 ? '9+' : unreadCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <Link
            to={notificationsPath}
            onClick={() => handleOpenChange(false)}
            className="text-sm font-semibold text-foreground hover:underline"
          >
            Thông báo
          </Link>
          {hasUnread && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              className="text-xs text-primary hover:underline cursor-pointer"
            >
              Đánh dấu đã đọc tất cả
            </button>
          )}
        </div>

        <div className="scrollbar-hover max-h-96 overflow-y-auto">
          {isLoading ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">Đang tải...</p>
          ) : items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Không có thông báo nào
            </p>
          ) : (
            items.map((notification) => (
              <button
                type="button"
                key={notification.notificationId}
                onClick={() => handleItemClick(notification)}
                className={cn(
                  'flex w-full flex-col items-start gap-0.5 border-b border-border px-3 py-2.5 text-left transition-colors last:border-b-0 cursor-pointer',
                  notification.isRead
                    ? 'bg-white hover:bg-muted/40'
                    : 'bg-amber-50/70 hover:bg-amber-50'
                )}
              >
                <span
                  className={cn(
                    'text-sm leading-snug',
                    notification.isRead
                      ? 'font-normal text-muted-foreground'
                      : 'font-semibold text-foreground'
                  )}
                >
                  {notification.title}
                </span>
                <span className="line-clamp-2 text-xs text-muted-foreground">
                  {notification.content}
                </span>
                <span className="text-[11px] text-muted-foreground/80">
                  {formatRelativeTime(notification.createdAt)}
                </span>
              </button>
            ))
          )}
        </div>

        {hasMore && (
          <button
            type="button"
            onClick={() => setLimit((prev) => prev + LOAD_MORE_STEP)}
            className="block w-full border-t border-border px-3 py-2.5 text-center text-sm font-semibold text-primary hover:bg-muted/40 cursor-pointer"
          >
            Xem thêm
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
