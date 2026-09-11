import { Bell } from 'lucide-react';
import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useMarkAllAsRead } from '../hooks/useMarkAllAsRead';
import { useMarkAsRead } from '../hooks/useMarkAsRead';
import { useNotifications } from '../hooks/useNotifications';
import { useUnreadCount } from '../hooks/useUnreadCount';
import NotificationsLayout from '../layout/NotificationsLayout';
import type { NotificationResponse } from '../types/notification';
import { formatRelativeTime } from '../utils/formatRelativeTime';

const filterTabs: { key: 'all' | 'unread'; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'unread', label: 'Chưa đọc' },
];

interface NotificationItemProps {
  notification: NotificationResponse;
  onClick: (notification: NotificationResponse) => void;
}

const NotificationItem = memo(function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(notification)}
      className={cn(
        'group relative flex items-start gap-4 px-5 py-4 transition-colors cursor-pointer text-left w-full border-none outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
        'border-b border-border last:border-b-0',
        notification.isRead
          ? 'bg-white hover:bg-muted/30'
          : 'bg-amber-50/70 dark:bg-amber-950/10 hover:bg-amber-50/90'
      )}
    >
      {!notification.isRead && (
        <span className="absolute right-4 top-5 size-2 rounded-full bg-primary" />
      )}

      <div className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Bell className="size-5 text-primary" strokeWidth={2.5} />
      </div>

      <div className="flex-1 min-w-0 pr-4">
        <p
          className={cn(
            'text-sm leading-snug',
            notification.isRead
              ? 'text-muted-foreground font-normal'
              : 'font-semibold text-foreground'
          )}
        >
          {notification.title}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">
          {notification.content}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(notification.createdAt)}
        </span>
      </div>
    </button>
  );
});

export default function Notifications() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const navigate = useNavigate();

  const { data: unreadCount } = useUnreadCount();
  const { data, isLoading, isError } = useNotifications({
    page: 1,
    size: 20,
    isRead: activeFilter === 'unread' ? false : undefined,
  });
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  const notifications = data?.content ?? [];

  const handleItemClick = (notification: NotificationResponse) => {
    if (!notification.isRead) {
      markAsRead(notification.notificationId);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <NotificationsLayout>
      <div className="mx-auto max-w-[800px] px-4 py-10 animate-fade-in">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Thông báo</h1>
            {(unreadCount ?? 0) > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
              >
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>
          <p className="text-base text-muted-foreground">
            Cập nhật những hoạt động mới nhất từ chuyến đi của bạn.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <button
                type="button"
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-full transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'border border-input bg-background text-muted-foreground hover:text-foreground hover:border-foreground/20'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Notification Container */}
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-muted-foreground">Đang tải...</p>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-destructive">Không thể tải thông báo. Vui lòng thử lại.</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                <Bell className="size-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Không có thông báo nào</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {activeFilter === 'all'
                    ? 'Bạn đã đọc tất cả thông báo'
                    : 'Không có thông báo chưa đọc'}
                </p>
              </div>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.notificationId}
                notification={notification}
                onClick={handleItemClick}
              />
            ))
          )}
        </div>
      </div>
    </NotificationsLayout>
  );
}
