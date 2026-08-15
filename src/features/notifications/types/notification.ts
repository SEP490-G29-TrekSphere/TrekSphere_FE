export type NotificationEventType =
  | 'BOOKING_CREATED'
  | 'BOOKING_PENDING_CONFIRMATION'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_REJECTED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_EXPIRED'
  | 'PAYMENT_SUCCESS'
  | string;

export type NotificationReferenceType = 'BOOKING' | string;

export interface Notification {
  notificationId: string;
  title: string;
  content: string;
  eventType: NotificationEventType;
  referenceType?: NotificationReferenceType | null;
  referenceId?: string | null;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPage {
  content: Notification[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
