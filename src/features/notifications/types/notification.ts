// Khớp đúng NotificationEventType.java / ReferenceType.java phía backend.
// Dùng `| (string & {})` để các giá trị mới thêm ở BE (phase sau) không làm vỡ type ở FE
// trong lúc vẫn giữ được gợi ý autocomplete cho các giá trị đã biết.
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
  | 'GROUP_POST_ANNOUNCEMENT'
  | 'GROUP_POST_COMMENT_ADDED'
  | 'GROUP_EXPENSE_CREATED'
  | 'GROUP_SETTLEMENT_PROOF_SUBMITTED'
  | 'GROUP_SETTLEMENT_CONFIRMED'
  | 'SCHEDULE_UPDATED'
  | 'TOUR_REJECTED'
  | 'REFUND_PENDING'
  | 'REFUND_MANUAL_REVIEW'
  | 'REFUND_OVERDUE'
  | 'REFUND_COMPLETED'
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
