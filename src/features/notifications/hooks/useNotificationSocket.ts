import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useChatWebSocket } from '@/features/chat/context/ChatWebSocketContext';
import { companionGroupKeys } from '@/features/companion-groups/hooks/companionGroupKeys';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import type { NotificationResponse } from '../types/notification';

/**
 * Tự động vô hiệu hóa (invalidate) cache của các React Query tương ứng
 * để trang hiện tại tự động refetch dữ liệu realtime ngay khi nhận được notification.
 */
function invalidateQueriesForNotification(
  queryClient: QueryClient,
  notification: NotificationResponse
) {
  // Luôn làm mới danh sách thông báo và số lượng chưa đọc
  queryClient.invalidateQueries({ queryKey: ['notifications'] });
  queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });

  const { eventType, referenceId, referenceType } = notification;

  switch (eventType) {
    // 1. Có yêu cầu tham gia nhóm mới (Trưởng nhóm nhận được thông báo)
    case 'GROUP_JOIN_REQUEST':
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.joinRequests() });
      if (referenceId) {
        queryClient.invalidateQueries({ queryKey: companionGroupKeys.detail(referenceId) });
      } else {
        queryClient.invalidateQueries({ queryKey: companionGroupKeys.details() });
      }
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.myGroups() });
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.lists() });
      break;

    // 2. Trạng thái đơn tham gia được duyệt / từ chối (Người xin nhận được thông báo)
    case 'GROUP_MEMBER_APPROVED':
    case 'GROUP_MEMBER_REJECTED':
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.myJoinRequests() });
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.myGroups() });
      if (referenceId) {
        queryClient.invalidateQueries({ queryKey: companionGroupKeys.detail(referenceId) });
      } else {
        queryClient.invalidateQueries({ queryKey: companionGroupKeys.details() });
      }
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.lists() });
      break;

    // 3. Thành viên rời nhóm hoặc bị mời ra
    case 'GROUP_MEMBER_LEFT':
    case 'GROUP_MEMBER_REMOVED':
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.myGroups() });
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.myJoinRequests() });
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.joinRequests() });
      if (referenceId) {
        queryClient.invalidateQueries({ queryKey: companionGroupKeys.detail(referenceId) });
      } else {
        queryClient.invalidateQueries({ queryKey: companionGroupKeys.details() });
      }
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.lists() });
      break;

    // 4. Vòng đời nhóm, giải tán, bắt đầu / kết thúc chuyến đi, đổi trưởng nhóm
    case 'GROUP_DISBANDED':
    case 'MATCHING_GROUP_CANCELLED':
    case 'GROUP_TRIP_STARTED':
    case 'GROUP_TRIP_ENDED':
    case 'GROUP_LEADER_CHANGED':
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.all });
      break;

    // 5. Bình chọn trong nhóm
    case 'GROUP_VOTE_OPENED':
    case 'GROUP_VOTE_CLOSED':
      queryClient.invalidateQueries({ queryKey: ['group-votes'] });
      queryClient.invalidateQueries({ queryKey: ['companion-group-votes'] });
      if (referenceId) {
        queryClient.invalidateQueries({ queryKey: companionGroupKeys.detail(referenceId) });
      }
      break;

    // 6. Chi phí và quyết toán trong nhóm
    case 'GROUP_EXPENSE_CREATED':
    case 'GROUP_SETTLEMENT_PROOF_SUBMITTED':
    case 'GROUP_SETTLEMENT_CONFIRMED':
      queryClient.invalidateQueries({ queryKey: ['group-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['group-settlements'] });
      queryClient.invalidateQueries({ queryKey: ['companion-group-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['companion-group-workspace'] });
      break;

    // 7. Tour được duyệt / từ chối / ẩn
    case 'TOUR_APPROVED':
    case 'TOUR_REJECTED':
    case 'TOUR_PENDING_APPROVAL':
    case 'TOUR_HIDDEN_VIOLATION':
    case 'TOUR_UNHIDDEN':
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-tours'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-tour-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      if (referenceId) {
        queryClient.invalidateQueries({ queryKey: ['tour', referenceId] });
        queryClient.invalidateQueries({ queryKey: ['vendor-tour', referenceId] });
      }
      break;

    // 8. Đặt tour và cập nhật lịch trình
    case 'BOOKING_CONFIRMED':
    case 'BOOKING_CANCELLED':
    case 'PAYMENT_SUCCESS':
    case 'SCHEDULE_UPDATED':
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['tour-schedules'] });
      break;

    // 9. Hoàn tiền
    case 'REFUND_PENDING':
    case 'REFUND_MANUAL_REVIEW':
    case 'REFUND_OVERDUE':
    case 'REFUND_COMPLETED':
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      queryClient.invalidateQueries({ queryKey: ['my-refunds'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-refunds'] });
      break;

    // 10. Báo động khẩn cấp SOS
    case 'SOS_ALERT_RAISED':
    case 'SOS_ALERT_RESOLVED':
      queryClient.invalidateQueries({ queryKey: ['active-sos-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['sos-alerts'] });
      if (referenceId) {
        queryClient.invalidateQueries({ queryKey: companionGroupKeys.detail(referenceId) });
      }
      break;

    // 11. Bài viết mới / Thông báo mới trong nhóm
    case 'GROUP_POST_CREATED':
    case 'GROUP_POST_ANNOUNCEMENT':
      queryClient.invalidateQueries({ queryKey: ['group-workspace'] });
      if (referenceId) {
        queryClient.invalidateQueries({ queryKey: companionGroupKeys.detail(referenceId) });
      }
      break;

    default:
      if (referenceType === 'MATCHING_GROUP') {
        queryClient.invalidateQueries({ queryKey: companionGroupKeys.all });
        queryClient.invalidateQueries({ queryKey: ['group-workspace'] });
      } else if (referenceType === 'TOUR') {
        queryClient.invalidateQueries({ queryKey: ['tours'] });
        queryClient.invalidateQueries({ queryKey: ['vendor-tours'] });
      }
      break;
  }
}

/**
 * Subscribe vào "/topic/notifications/{currentUserId}" bằng chung 1 kết nối STOMP đã có
 * sẵn từ chat (không mở thêm SockJS connection thứ 2). Khi có thông báo mới:
 * 1. Tự động invalidate các query API liên quan (duyệt yêu cầu, danh sách nhóm, tour,...) để refetch realtime.
 * 2. Invalidate cache số chưa đọc và danh sách thông báo.
 * 3. Hiển thị thông báo toast.
 */
export function useNotificationSocket() {
  const { client, isConnected } = useChatWebSocket();
  const queryClient = useQueryClient();
  const userId = useAppStore((state) => state.user?.id);

  useEffect(() => {
    if (!client || !isConnected || !userId) return;

    const subscription = client.subscribe(`/topic/notifications/${userId}`, (message) => {
      if (!message.body) return;
      try {
        const notification: NotificationResponse = JSON.parse(message.body);
        invalidateQueriesForNotification(queryClient, notification);
        toast.info(notification.content, {
          title: notification.title,
          actionUrl: notification.actionUrl ?? undefined,
        });
      } catch {
        // Bỏ qua payload không đúng định dạng, không làm crash app.
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [client, isConnected, userId, queryClient]);
}
