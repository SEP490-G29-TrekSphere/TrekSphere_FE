export type NotificationEventType =
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'PAYMENT_SUCCESS'
  | 'NEW_MESSAGE'
  | 'TOUR_APPROVED'
  | 'TOUR_PENDING_APPROVAL'
  | 'TOUR_HIDDEN_VIOLATION'
  | 'TOUR_UNHIDDEN'
  | 'GROUP_JOIN_REQUEST'
  | 'GROUP_MEMBER_APPROVED'
  | 'GROUP_MEMBER_REJECTED'
  | 'GROUP_MEMBER_LEFT'
  | 'GROUP_MEMBER_REMOVED'
  | 'GROUP_DISBANDED'
  | 'GROUP_TRIP_STARTED'
  | 'GROUP_TRIP_ENDED'
  | 'GROUP_MOMENT_CREATED'
  | 'GROUP_POST_CREATED'
  | 'GROUP_POST_ANNOUNCEMENT'
  | 'GROUP_POST_COMMENT_ADDED'
  | 'GROUP_EXPENSE_CREATED'
  | 'GROUP_SETTLEMENT_CREATED'
  | 'GROUP_SETTLEMENT_PROOF_SUBMITTED'
  | 'GROUP_SETTLEMENT_CONFIRMED'
  | 'GROUP_SETTLEMENT_REJECTED'
  | 'SCHEDULE_UPDATED'
  | 'TOUR_REJECTED'
  | 'REFUND_PENDING'
  | 'REFUND_MANUAL_REVIEW'
  | 'REFUND_OVERDUE'
  | 'REFUND_COMPLETED'
  | 'SOS_ALERT_RAISED'
  | 'SOS_ALERT_RESOLVED'
  | 'GROUP_VOTE_OPENED'
  | 'GROUP_VOTE_CLOSED'
  | 'GROUP_LEADER_CHANGED'
  | 'MATCHING_GROUP_CANCELLED'
  | 'GROUP_CHECKPOINT_CHECKED_IN'
  | 'GROUP_CHECKPOINT_SKIPPED'
  | 'GROUP_CHECKLIST_ASSIGNED'
  | 'BLOG_COMMENT_ADDED'
  | 'BLOG_HIDDEN'
  | 'BLOG_DELETED'
  | 'VENDOR_APPLICATION_SUBMITTED'
  | 'VENDOR_APPLICATION_APPROVED'
  | 'VENDOR_APPLICATION_REJECTED'
  | 'VENDOR_STATUS_CHANGED'
  | 'CONVERSATION_MEMBER_ADDED'
  | 'REPORT_SUBMITTED'
  | 'REPORT_RESOLVED'
  | 'REPORT_WARNING_ISSUED'
  | 'USER_STATUS_CHANGED'
  | (string & {});

export type NotificationReferenceType =
  | 'TOUR'
  | 'BLOG'
  | 'MATCHING_GROUP'
  | 'CONVERSATION'
  | 'GROUP_TRIP'
  | 'GROUP_EXPENSE'
  | 'GROUP_VOTE'
  | 'MOMENT'
  | 'POST'
  | 'SETTLEMENT'
  | 'SOS'
  | (string & {});

export interface NotificationResponse {
  notificationId: string;
  title: string;
  content: string;
  eventType: NotificationEventType;
  referenceType: NotificationReferenceType | null;
  referenceId: string | null;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface PaginationResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface NotificationListParams {
  page?: number;
  size?: number;
  isRead?: boolean;
}
