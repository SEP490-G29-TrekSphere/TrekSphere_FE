import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useChatWebSocket } from '@/features/chat/context/ChatWebSocketContext';
import { companionGroupKeys } from '@/features/companion-groups/hooks/companionGroupKeys';
import { groupWorkspaceKeys } from '@/features/companion-groups/hooks/groupWorkspaceKeys';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import type { NotificationResponse } from '../types/notification';
import { resolveNotificationUrl } from '../utils/resolveNotificationUrl';

function invalidateQueriesForNotification(
  queryClient: QueryClient,
  notification: NotificationResponse
) {
  queryClient.invalidateQueries({ queryKey: ['notifications'] });
  queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });

  const { eventType, referenceId, referenceType } = notification;

  switch (eventType) {
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

    case 'GROUP_DISBANDED':
    case 'MATCHING_GROUP_CANCELLED':
    case 'GROUP_TRIP_STARTED':
    case 'GROUP_TRIP_ENDED':
    case 'GROUP_LEADER_CHANGED':
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.all });
      break;

    case 'GROUP_VOTE_OPENED':
    case 'GROUP_VOTE_CLOSED':
      queryClient.invalidateQueries({ queryKey: ['group-votes'] });
      queryClient.invalidateQueries({ queryKey: ['companion-group-votes'] });
      if (referenceId) {
        queryClient.invalidateQueries({ queryKey: companionGroupKeys.detail(referenceId) });
      }
      break;

    case 'GROUP_EXPENSE_CREATED':
    case 'GROUP_SETTLEMENT_CREATED':
    case 'GROUP_SETTLEMENT_PROOF_SUBMITTED':
    case 'GROUP_SETTLEMENT_CONFIRMED':
    case 'GROUP_SETTLEMENT_REJECTED':
      queryClient.invalidateQueries({ queryKey: groupWorkspaceKeys.all });
      queryClient.invalidateQueries({ queryKey: companionGroupKeys.all });
      if (referenceId) {
        queryClient.invalidateQueries({ queryKey: companionGroupKeys.detail(referenceId) });
      }
      break;

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

    case 'BOOKING_CONFIRMED':
    case 'BOOKING_CANCELLED':
    case 'PAYMENT_SUCCESS':
    case 'SCHEDULE_UPDATED':
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['tour-schedules'] });
      break;

    case 'REFUND_PENDING':
    case 'REFUND_MANUAL_REVIEW':
    case 'REFUND_OVERDUE':
    case 'REFUND_COMPLETED':
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      queryClient.invalidateQueries({ queryKey: ['my-refunds'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-refunds'] });
      break;

    case 'SOS_ALERT_RAISED':
    case 'SOS_ALERT_RESOLVED':
      queryClient.invalidateQueries({ queryKey: ['active-sos-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['sos-alerts'] });
      if (referenceId) {
        queryClient.invalidateQueries({ queryKey: companionGroupKeys.detail(referenceId) });
      }
      break;

    // Bài viết mới / Thông báo mới / Bình luận trong nhóm
    case 'GROUP_POST_CREATED':
    case 'GROUP_POST_ANNOUNCEMENT':
    case 'GROUP_POST_COMMENT_ADDED':
    case 'GROUP_CHECKLIST_ASSIGNED':
      queryClient.invalidateQueries({ queryKey: ['group-workspace'] });
      if (referenceId) {
        queryClient.invalidateQueries({ queryKey: companionGroupKeys.detail(referenceId) });
      }
      break;

    case 'NEW_MESSAGE':
    case 'CONVERSATION_MEMBER_ADDED':
      queryClient.invalidateQueries({ queryKey: ['chatConversations'] });
      if (referenceId) {
        queryClient.invalidateQueries({ queryKey: ['chatMessages', referenceId] });
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

export function useNotificationSocket() {
  const { client, isConnected, connectionEpoch } = useChatWebSocket();
  const queryClient = useQueryClient();
  const userId = useAppStore((state) => state.user?.id);

  useEffect(() => {
    if (!client || !isConnected || !userId) return;

    if (import.meta.env.DEV) {
      console.log(
        `[STOMP] Subscribing to /topic/notifications/${userId} (epoch ${connectionEpoch})`
      );
    }

    const subscription = client.subscribe(`/topic/notifications/${userId}`, (message) => {
      if (!message.body) return;
      try {
        const notification: NotificationResponse = JSON.parse(message.body);
        invalidateQueriesForNotification(queryClient, notification);
        const actionUrl = resolveNotificationUrl(notification);
        toast.info(notification.content, {
          title: notification.title,
          actionUrl: actionUrl,
        });
      } catch {
        // Ignore parse error
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [client, isConnected, connectionEpoch, userId, queryClient]);
}
