import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock3,
  CreditCard,
  LoaderCircle,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from '../hooks/useNotifications';
import NotificationsLayout from '../layout/NotificationsLayout';
import type { Notification, NotificationEventType } from '../types/notification';

const bookingEvents = new Set([
  'BOOKING_CREATED',
  'BOOKING_PENDING_CONFIRMATION',
  'BOOKING_CONFIRMED',
  'BOOKING_REJECTED',
  'BOOKING_CANCELLED',
  'BOOKING_EXPIRED',
  'PAYMENT_SUCCESS',
]);

const eventConfig: Record<string, { icon: typeof Bell; background: string; foreground: string }> = {
  BOOKING_CREATED: { icon: Clock3, background: 'bg-blue-100', foreground: 'text-blue-600' },
  BOOKING_PENDING_CONFIRMATION: {
    icon: Clock3,
    background: 'bg-amber-100',
    foreground: 'text-amber-600',
  },
  BOOKING_CONFIRMED: {
    icon: CheckCircle,
    background: 'bg-emerald-100',
    foreground: 'text-emerald-600',
  },
  PAYMENT_SUCCESS: {
    icon: CreditCard,
    background: 'bg-emerald-100',
    foreground: 'text-emerald-600',
  },
  BOOKING_REJECTED: { icon: XCircle, background: 'bg-red-100', foreground: 'text-red-600' },
  BOOKING_CANCELLED: {
    icon: XCircle,
    background: 'bg-red-100',
    foreground: 'text-red-600',
  },
  BOOKING_EXPIRED: {
    icon: AlertTriangle,
    background: 'bg-amber-100',
    foreground: 'text-amber-600',
  },
};

function formatRelativeTime(value: string): string {
  const date = new Date(value);
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return 'Vừa xong';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(date);
}

function getEventConfig(eventType: NotificationEventType) {
  return (
    eventConfig[eventType] ?? {
      icon: Bell,
      background: 'bg-slate-100',
      foreground: 'text-slate-600',
    }
  );
}

interface NotificationItemProps {
  notification: Notification;
  onOpen: (notification: Notification) => void;
  isPending: boolean;
}

function NotificationItem({ notification, onOpen, isPending }: NotificationItemProps) {
  const config = getEventConfig(notification.eventType);
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={() => onOpen(notification)}
      disabled={isPending}
      className={cn(
        'group relative flex w-full cursor-pointer items-start gap-4 border-none border-b border-border px-5 py-4 text-left outline-none transition-colors last:border-b-0 focus-visible:ring-2 focus-visible:ring-primary/20',
        notification.isRead ? 'bg-white hover:bg-muted/30' : 'bg-amber-50/70 hover:bg-amber-50/90'
      )}
    >
      {!notification.isRead && (
        <span className="absolute right-4 top-5 size-2 rounded-full bg-primary" />
      )}
      <div
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full',
          config.background
        )}
      >
        <Icon className={cn('size-5', config.foreground)} strokeWidth={2.5} />
      </div>
      <div className="min-w-0 flex-1 pr-4">
        <p className={cn('text-sm leading-snug', !notification.isRead && 'font-semibold')}>
          {notification.title}
        </p>
        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
          {notification.content}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(notification.createdAt)}
        </span>
        {notification.actionUrl && (
          <span className="text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Xem chi tiết
          </span>
        )}
      </div>
    </button>
  );
}

export default function Notifications() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'all' | 'booking'>('all');
  const { data, isLoading, isError, refetch } = useNotifications(0);
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = useMemo(() => {
    const items = data?.content ?? [];
    if (activeFilter === 'all') return items;
    return items.filter((item) => bookingEvents.has(item.eventType));
  }, [activeFilter, data]);

  async function handleOpen(notification: Notification) {
    if (!notification.isRead) await markRead.mutateAsync(notification.notificationId);
    if (notification.actionUrl) navigate(notification.actionUrl);
  }

  return (
    <NotificationsLayout>
      <div className="mx-auto max-w-[800px] animate-fade-in px-4 py-10">
        <div className="mb-8">
          <div className="mb-1 flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Thông báo</h1>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                Đánh dấu đã đọc tất cả
              </button>
            )}
          </div>
          <p className="text-base text-muted-foreground">
            Theo dõi trạng thái booking và thanh toán của bạn.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {(
            [
              ['all', 'Tất cả'],
              ['booking', 'Booking'],
            ] as const
          ).map(([key, label]) => (
            <button
              type="button"
              key={key}
              onClick={() => setActiveFilter(key)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-all',
                activeFilter === key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'border border-input bg-background text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <LoaderCircle className="size-5 animate-spin" /> Đang tải thông báo...
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-sm text-destructive">Không thể tải danh sách thông báo.</p>
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={() => refetch()}
              >
                Thử lại
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                <Bell className="size-7 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">Không có thông báo nào</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.notificationId}
                notification={notification}
                onOpen={handleOpen}
                isPending={markRead.isPending}
              />
            ))
          )}
        </div>
      </div>
    </NotificationsLayout>
  );
}
