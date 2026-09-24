import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/store/useToastStore';
import { MATCHING_GROUP_LEAVE_REDIRECT_DELAY_MS } from '../constants';
import { useApproveMember } from './useApproveMember';
import { useCancelJoinRequest } from './useCancelJoinRequest';
import { useCompanionGroupChatActions } from './useCompanionGroupChatActions';
import {
  type ActiveGroupModal,
  type JoinRequestAction,
  resolveGroupUserRole,
  type UseCompanionGroupDetailActionsOptions,
} from './useCompanionGroupDetailActions.types';
import { useJoinMatchingGroup } from './useJoinMatchingGroup';
import { useLeaveMatchingGroup } from './useLeaveMatchingGroup';
import {
  type MatchingGroupLifecycleAction,
  useMatchingGroupLifecycle,
} from './useMatchingGroupLifecycle';
import { useRejectMember } from './useRejectMember';
import { useRemoveMember } from './useRemoveMember';

export function useCompanionGroupDetailActions({
  groupId,
  group,
  currentUserId,
  chatPath,
  backPath,
}: UseCompanionGroupDetailActionsOptions) {
  const navigate = useNavigate();

  const joinMutation = useJoinMatchingGroup();
  const leaveMutation = useLeaveMatchingGroup();
  const withdrawMutation = useCancelJoinRequest();
  const approveMutation = useApproveMember();
  const rejectMutation = useRejectMember();
  const removeMemberMutation = useRemoveMember();
  const lifecycleMutation = useMatchingGroupLifecycle();

  const [activeModal, setActiveModal] = useState<ActiveGroupModal>(null);
  const [selectedRequest, setSelectedRequest] = useState<JoinRequestAction | null>(null);
  const [selectedAddBackMember, setSelectedAddBackMember] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedRemoveMember, setSelectedRemoveMember] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const currentUserRole = resolveGroupUserRole(group, currentUserId);

  const chatActions = useCompanionGroupChatActions({
    groupId,
    group,
    currentUserId,
    chatPath,
  });

  function openRequestModal(action: 'approve' | 'reject', request: JoinRequestAction) {
    setSelectedRequest(request);
    setActiveModal(action);
  }

  function openAddMemberModal(memberId: string, memberName: string) {
    setSelectedAddBackMember({ id: memberId, name: memberName });
    setActiveModal('addBackToChat');
  }

  function openRemoveMemberModal(memberId: string, memberName: string) {
    setSelectedRemoveMember({ id: memberId, name: memberName });
    setActiveModal('removeMember');
  }

  function confirmRemoveMember() {
    if (!groupId || !selectedRemoveMember) return;
    removeMemberMutation.mutate(
      { groupId, memberId: selectedRemoveMember.id },
      {
        onSuccess: () => {
          setActiveModal(null);
          toast.success(`Đã xoá ${selectedRemoveMember.name} khỏi nhóm ghép.`);
          setSelectedRemoveMember(null);
        },
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi xoá thành viên.'),
      }
    );
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
          toast.success(`Đã duyệt thành viên ${selectedRequest.userName} gia nhập nhóm!`);
          setSelectedRequest(null);
        },
        onError: (error) =>
          toast.error(
            error instanceof Error ? error.message : 'Có lỗi xảy ra khi duyệt thành viên.'
          ),
      }
    );
  }

  function confirmReject(reason?: string) {
    if (!selectedRequest || !groupId) return;
    rejectMutation.mutate(
      { groupId, applicationId: selectedRequest.id, rejectReason: reason },
      {
        onSuccess: () => {
          setActiveModal(null);
          toast.success(`Đã từ chối yêu cầu của ${selectedRequest.userName}`);
          setSelectedRequest(null);
        },
        onError: (error) =>
          toast.error(
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
        toast.success('Bạn đã rời khỏi nhóm ghép thành công.');
        window.setTimeout(() => navigate(backPath), MATCHING_GROUP_LEAVE_REDIRECT_DELAY_MS);
      },
      onError: (error) =>
        toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi rời khỏi nhóm.'),
    });
  }

  function joinGroup(message?: string, onSuccessCallback?: () => void) {
    if (!groupId) return;
    joinMutation.mutate(
      { matchingGroupId: groupId, message },
      {
        onSuccess: () => {
          toast.success(
            'Đã gửi yêu cầu tham gia thành công! Trưởng nhóm sẽ xét duyệt yêu cầu của bạn.'
          );
          onSuccessCallback?.();
        },
        onError: (error) => {
          const msg = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xin tham gia.';
          toast.error(msg);
        },
      }
    );
  }

  function confirmWithdraw() {
    if (!groupId) return;
    withdrawMutation.mutate(groupId, {
      onSuccess: () => {
        setActiveModal(null);
        toast.success('Đã rút yêu cầu tham gia nhóm ghép.');
      },
      onError: (error) =>
        toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi rút yêu cầu.'),
    });
  }

  function handleLifecycleAction(
    action: MatchingGroupLifecycleAction,
    successMsg: string,
    errorMsg: string
  ) {
    if (!groupId) return;
    lifecycleMutation.mutate(
      { groupId, action },
      {
        onSuccess: () => toast.success(successMsg),
        onError: (error) => toast.error(error instanceof Error ? error.message : errorMsg),
      }
    );
  }

  return {
    activeModal,
    setActiveModal,
    selectedRequest,
    selectedAddBackMember,
    selectedRemoveMember,
    currentUserRole,
    isJoining: joinMutation.isPending,
    joinError: joinMutation.error instanceof Error ? joinMutation.error.message : null,
    resetJoinError: joinMutation.reset,
    isApprovePending: approveMutation.isPending,
    isRejectPending: rejectMutation.isPending,
    isRemoveMemberPending: removeMemberMutation.isPending,
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
    startTrip: () =>
      handleLifecycleAction(
        'start-trip',
        'Chuyến đi đã chính thức bắt đầu! Chúc cả đoàn có một hành trình an toàn và trọn vẹn.',
        'Không thể bắt đầu chuyến đi.'
      ),
    completeTrip: () =>
      handleLifecycleAction(
        'complete-trip',
        'Chúc mừng cả đoàn đã hoàn thành chuyến đi! Bạn có thể bắt đầu đánh giá đồng đội.',
        'Không thể hoàn thành chuyến đi.'
      ),
    openRequestModal,
    openAddMemberModal,
    openRemoveMemberModal,
    openGroupChat: chatActions.openGroupChat,
    openDirectChat: chatActions.openDirectChat,
    confirmAddMemberToChat,
    confirmApprove,
    confirmReject,
    confirmLeave,
    confirmRemoveMember,
    joinGroup,
    confirmWithdraw,
  };
}
