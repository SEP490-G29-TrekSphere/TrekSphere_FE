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
import { useMatchingGroupLifecycle } from './useMatchingGroupLifecycle';
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
  const lifecycleMutation = useMatchingGroupLifecycle();

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

  function confirmReject(reason?: string) {
    if (!selectedRequest || !groupId) return;
    rejectMutation.mutate(
      { groupId, applicationId: selectedRequest.id, reviewNote: reason },
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

  function handleLifecycleAction(
    action: 'hide' | 'show' | 'close' | 'open',
    successMsg: string,
    errorMsg: string
  ) {
    if (!groupId) return;
    lifecycleMutation.mutate(
      { groupId, action },
      {
        onSuccess: () => showFeedback(successMsg),
        onError: (error) => showFeedback(error instanceof Error ? error.message : errorMsg),
      }
    );
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
    isLifecyclePending: lifecycleMutation.isPending,
    hideGroup: () =>
      handleLifecycleAction(
        'hide',
        'Đã tạm ẩn nhóm ghép khỏi kết quả tìm kiếm.',
        'Không thể ẩn nhóm ghép.'
      ),
    showGroup: () =>
      handleLifecycleAction(
        'show',
        'Đã hiển thị lại nhóm ghép ra công khai.',
        'Không thể hiển thị nhóm ghép.'
      ),
    closeGroup: () =>
      handleLifecycleAction(
        'close',
        'Đã đóng tuyển thành viên mới cho nhóm.',
        'Không thể đóng tuyển thành viên.'
      ),
    openGroup: () =>
      handleLifecycleAction(
        'open',
        'Đã mở lại tuyển thành viên cho nhóm.',
        'Không thể mở lại tuyển thành viên.'
      ),
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
