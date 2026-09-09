import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { JoinRequestAction } from '../components/detail/JoinRequestsCard';
import {
  MATCHING_GROUP_FEEDBACK_DURATION_MS,
  MATCHING_GROUP_LEAVE_REDIRECT_DELAY_MS,
} from '../constants';
import { resolveGroupUserRole } from '../mappers';
import type { MatchingGroupDetailResponse } from '../types/matchingGroup';
import { useApproveMember } from './useApproveMember';
import { useCancelJoinRequest } from './useCancelJoinRequest';
import { useCompanionGroupChatActions } from './useCompanionGroupChatActions';
import { useJoinMatchingGroup } from './useJoinMatchingGroup';
import { useLeaveMatchingGroup } from './useLeaveMatchingGroup';
import { useRejectMember } from './useRejectMember';

export type ActiveGroupModal = 'leave' | 'reject' | 'approve' | 'addBackToChat' | null;

interface UseCompanionGroupDetailActionsOptions {
  groupId?: string;
  group?: MatchingGroupDetailResponse;
  currentUserId?: string;
  backPath: string;
  chatPath: string;
}

export function useCompanionGroupDetailActions({
  groupId,
  group,
  currentUserId,
  backPath,
  chatPath,
}: UseCompanionGroupDetailActionsOptions) {
  const navigate = useNavigate();
  const leaveMutation = useLeaveMatchingGroup();
  const withdrawMutation = useCancelJoinRequest();
  const joinMutation = useJoinMatchingGroup();
  const approveMutation = useApproveMember();
  const rejectMutation = useRejectMember();

  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveGroupModal>(null);
  const [selectedRequest, setSelectedRequest] = useState<JoinRequestAction | null>(null);
  const [selectedAddBackMember, setSelectedAddBackMember] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const currentUserRole = resolveGroupUserRole(group, currentUserId);

  function showFeedback(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), MATCHING_GROUP_FEEDBACK_DURATION_MS);
  }

  const chatActions = useCompanionGroupChatActions({
    groupId,
    group,
    currentUserId,
    chatPath,
    showFeedback,
  });

  function openRequestModal(action: 'approve' | 'reject', request: JoinRequestAction) {
    setSelectedRequest(request);
    setActiveModal(action);
  }

  function openAddMemberModal(memberId: string, memberName: string) {
    setSelectedAddBackMember({ id: memberId, name: memberName });
    setActiveModal('addBackToChat');
  }

  function confirmAddMemberToChat() {
    chatActions.confirmAddMemberToChat(selectedAddBackMember, () => {
      setActiveModal(null);
      setSelectedAddBackMember(null);
    });
  }

  function confirmApprove() {
    if (!selectedRequest || !groupId) return;
    approveMutation.mutate(
      { groupId, applicationId: selectedRequest.id },
      {
        onSuccess: () => {
          setActiveModal(null);
          showFeedback(`Đã duyệt thành viên ${selectedRequest.userName} gia nhập nhóm!`);
          setSelectedRequest(null);
        },
        onError: (error) =>
          showFeedback(
            error instanceof Error ? error.message : 'Có lỗi xảy ra khi duyệt thành viên.'
          ),
      }
    );
  }

  function confirmReject() {
    if (!selectedRequest || !groupId) return;
    rejectMutation.mutate(
      { groupId, applicationId: selectedRequest.id },
      {
        onSuccess: () => {
          setActiveModal(null);
          showFeedback(`Đã từ chối yêu cầu của ${selectedRequest.userName}`);
          setSelectedRequest(null);
        },
        onError: (error) =>
          showFeedback(
            error instanceof Error ? error.message : 'Có lỗi xảy ra khi từ chối yêu cầu.'
          ),
      }
    );
  }

  function confirmLeave() {
    if (!groupId) return;
    leaveMutation.mutate(groupId, {
      onSuccess: () => {
        setActiveModal(null);
        showFeedback('Bạn đã rời khỏi nhóm ghép thành công.');
        window.setTimeout(() => navigate(backPath), MATCHING_GROUP_LEAVE_REDIRECT_DELAY_MS);
      },
      onError: (error) =>
        showFeedback(error instanceof Error ? error.message : 'Có lỗi xảy ra khi rời khỏi nhóm.'),
    });
  }

  function joinGroup(message?: string) {
    if (!groupId) return;
    joinMutation.mutate(
      { matchingGroupId: groupId, message },
      {
        onSuccess: () => showFeedback('Đã gửi yêu cầu tham gia nhóm ghép.'),
        onError: (error) =>
          showFeedback(error instanceof Error ? error.message : 'Có lỗi xảy ra khi xin tham gia.'),
      }
    );
  }

  function confirmWithdraw() {
    if (!groupId) return;
    withdrawMutation.mutate(groupId, {
      onSuccess: () => {
        setActiveModal(null);
        showFeedback('Đã rút yêu cầu tham gia nhóm ghép.');
      },
      onError: (error) =>
        showFeedback(error instanceof Error ? error.message : 'Có lỗi xảy ra khi rút yêu cầu.'),
    });
  }

  return {
    feedback,
    activeModal,
    setActiveModal,
    selectedRequest,
    selectedAddBackMember,
    currentUserRole,
    isJoining: joinMutation.isPending,
    isApprovePending: approveMutation.isPending,
    isRejectPending: rejectMutation.isPending,
    isLeavePending:
      currentUserRole === 'pending' ? withdrawMutation.isPending : leaveMutation.isPending,
    isAddBackPending: chatActions.isAddBackPending,
    openRequestModal,
    openAddMemberModal,
    openGroupChat: chatActions.openGroupChat,
    openDirectChat: chatActions.openDirectChat,
    confirmAddMemberToChat,
    confirmApprove,
    confirmReject,
    confirmLeave,
    joinGroup,
    confirmWithdraw,
  };
}
