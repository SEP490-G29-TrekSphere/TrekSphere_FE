import { Bell } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PATHS } from '@/constants';
import { useMarkAllAsRead } from '@/features/notifications/hooks/useMarkAllAsRead';
import { useMarkAsRead } from '@/features/notifications/hooks/useMarkAsRead';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { useUnreadCount } from '@/features/notifications/hooks/useUnreadCount';
import type { NotificationResponse } from '@/features/notifications/types/notification';
import { formatRelativeTime } from '@/features/notifications/utils/formatRelativeTime';
import { cn } from '@/lib/utils';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { data: unreadCount } = useUnreadCount();
  const { data: recent, isLoading } = useNotifications({ page: 1, size: 5 });
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  const items = recent?.content ?? [];
  const hasUnread = (unreadCount ?? 0) > 0;

  const handleItemClick = (notification: NotificationResponse) => {
    if (!notification.isRead) {
      markAsRead(notification.notificationId);
    }
    setOpen(false);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
          <span className="text-sm font-semibold text-foreground">Thông báo</span>
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

        <div className="max-h-96 overflow-y-auto">
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

        <Link
          to={PATHS.NOTIFICATIONS}
          onClick={() => setOpen(false)}
          className="block border-t border-border px-3 py-2.5 text-center text-sm text-primary hover:bg-muted/40"
        >
          Xem tất cả
        </Link>
      </PopoverContent>
    </Popover>
  );
}
