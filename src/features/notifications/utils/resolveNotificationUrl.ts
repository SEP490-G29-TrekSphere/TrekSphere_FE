import { sanitizeInternalUrl } from '@/utils/sanitize';
import type { NotificationEventType, NotificationReferenceType } from '../types/notification';

export interface ResolveNotificationUrlParams {
  actionUrl?: string | null;
  eventType?: NotificationEventType;
  referenceType?: NotificationReferenceType | null;
  referenceId?: string | null;
}

/**
 * Tự động phân giải đường dẫn điều hướng chính xác từ thông báo.
 * - Ưu tiên actionUrl được gửi từ Backend nếu có và hợp lệ.
 * - Nếu actionUrl thiếu / null (dữ liệu cũ hoặc backend chưa gán), tự động suy ra
 *   đúng URL và tab tương ứng dựa trên eventType, referenceType và referenceId.
 */
export function resolveNotificationUrl(
  params: ResolveNotificationUrlParams | null | undefined
): string | undefined {
  if (!params) return undefined;

  const { actionUrl, eventType, referenceType, referenceId } = params;

  if (actionUrl && typeof actionUrl === 'string') {
    const safeUrl = sanitizeInternalUrl(actionUrl);
    if (safeUrl) return safeUrl;
  }

  // Fallback dựa trên eventType
  switch (eventType) {
    case 'GROUP_EXPENSE_CREATED':
    case 'GROUP_SETTLEMENT_CREATED':
    case 'GROUP_SETTLEMENT_PROOF_SUBMITTED':
    case 'GROUP_SETTLEMENT_CONFIRMED':
    case 'GROUP_SETTLEMENT_REJECTED':
      return referenceId ? `/trekker/my-groups/${referenceId}?tab=budget` : '/trekker/my-groups';

    case 'GROUP_POST_CREATED':
    case 'GROUP_POST_ANNOUNCEMENT':
    case 'GROUP_POST_COMMENT_ADDED':
      return referenceId ? `/trekker/my-groups/${referenceId}?tab=feed` : '/trekker/my-groups';

    case 'GROUP_VOTE_OPENED':
    case 'GROUP_VOTE_CLOSED':
      return referenceId ? `/trekker/my-groups/${referenceId}?tab=votes` : '/trekker/my-groups';

    case 'GROUP_LEADER_CHANGED':
    case 'MATCHING_GROUP_CANCELLED':
    case 'GROUP_DISBANDED':
    case 'GROUP_MEMBER_APPROVED':
    case 'GROUP_MEMBER_LEFT':
      return referenceId ? `/trekker/my-groups/${referenceId}` : '/trekker/my-groups';

    case 'GROUP_MEMBER_REJECTED':
      return '/trekker/my-join-requests';

    case 'GROUP_MEMBER_REMOVED':
      return '/trekker/my-groups';

    case 'GROUP_JOIN_REQUEST':
      return referenceId
        ? `/trekker/my-groups/${referenceId}?tab=members&subTab=requests`
        : '/trekker/my-groups';

    case 'GROUP_TRIP_STARTED':
    case 'GROUP_CHECKPOINT_CHECKED_IN':
    case 'GROUP_CHECKPOINT_SKIPPED':
      return referenceId ? `/trekker/my-groups/${referenceId}?tab=itinerary` : '/trekker/my-groups';

    case 'GROUP_TRIP_ENDED':
      return referenceId
        ? `/trekker/my-groups/${referenceId}?tab=members&subTab=reviews`
        : '/trekker/my-groups';

    case 'GROUP_MOMENT_CREATED':
      return referenceId ? `/trekker/my-groups/${referenceId}?tab=moments` : '/trekker/my-groups';

    case 'SOS_ALERT_RAISED':
    case 'SOS_ALERT_RESOLVED':
      return referenceId ? `/trekker/my-groups/${referenceId}?tab=sos` : '/trekker/my-groups';

    case 'BOOKING_CONFIRMED':
    case 'BOOKING_CANCELLED':
    case 'PAYMENT_SUCCESS':
    case 'SCHEDULE_UPDATED':
      return '/trekker/my-groups';

    case 'REFUND_PENDING':
    case 'REFUND_MANUAL_REVIEW':
    case 'REFUND_OVERDUE':
    case 'REFUND_COMPLETED':
      return '/trekker/profile';

    case 'NEW_MESSAGE':
    case 'CONVERSATION_MEMBER_ADDED':
      return '/chat';

    case 'TOUR_APPROVED':
    case 'TOUR_REJECTED':
    case 'TOUR_PENDING_APPROVAL':
    case 'TOUR_HIDDEN_VIOLATION':
    case 'TOUR_UNHIDDEN':
      return referenceId ? `/vendor/tours/${referenceId}/preview` : '/vendor/tours';

    case 'VENDOR_APPLICATION_SUBMITTED':
      return referenceId ? `/admin/applications/${referenceId}` : '/admin/applications';

    case 'VENDOR_APPLICATION_APPROVED':
    case 'VENDOR_APPLICATION_REJECTED':
      return '/trekker/vendor-applications';

    case 'VENDOR_STATUS_CHANGED':
      return '/vendor/profile';

    case 'BLOG_COMMENT_ADDED':
    case 'BLOG_HIDDEN':
    case 'BLOG_DELETED':
      return referenceId ? `/news/${referenceId}` : '/trekker/blog';

    case 'REPORT_SUBMITTED':
    case 'REPORT_RESOLVED':
    case 'REPORT_WARNING_ISSUED':
      return referenceId ? `/admin/reports/${referenceId}` : '/admin/reports';

    case 'USER_STATUS_CHANGED':
      return '/profile';

    default:
      if (
        referenceType === 'MATCHING_GROUP' ||
        referenceType === 'GROUP_TRIP' ||
        referenceType === 'GROUP_EXPENSE' ||
        referenceType === 'GROUP_VOTE' ||
        referenceType === 'SOS' ||
        referenceType === 'MOMENT'
      ) {
        return referenceId ? `/trekker/my-groups/${referenceId}` : '/trekker/my-groups';
      }
      if (referenceType === 'TOUR') {
        return referenceId ? `/tours/${referenceId}` : '/tours';
      }
      if (referenceType === 'BLOG') {
        return referenceId ? `/news/${referenceId}` : '/news';
      }
      if (referenceType === 'CONVERSATION') {
        return '/chat';
      }
      return undefined;
  }
}
