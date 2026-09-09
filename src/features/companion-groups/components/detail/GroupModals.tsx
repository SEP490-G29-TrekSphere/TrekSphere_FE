import { AlertTriangle, LogOut, UserCheck } from 'lucide-react';
import { ConfirmActionDialog } from '@/shared/ui';
import type { UserRoleInGroup } from '../../types';
import type { JoinRequestAction } from './JoinRequestsCard';

type ActiveModal = 'leave' | 'reject' | 'approve' | 'addBackToChat' | null;

interface GroupModalsProps {
  activeModal: ActiveModal;
  setActiveModal: (modal: ActiveModal) => void;
  selectedRequest: JoinRequestAction | null;
  selectedAddBackMember?: { id: string; name: string } | null;
  currentUserRole: UserRoleInGroup;

  // Pending states
  isApprovePending: boolean;
  isRejectPending: boolean;
  isLeaveModalPending: boolean;
  isAddBackPending?: boolean;

  // Action Handlers
  onConfirmApprove: () => void;
  onConfirmReject: () => void;
  onConfirmLeaveGroup: () => void;
  onConfirmCancelJoinRequest: () => void;
  onConfirmAddBackToChat?: () => void;
}

/**
 * Nhóm modal xác nhận của trang chi tiết nhóm ghép.
 * Tất cả dùng chung `ConfirmActionDialog` nên có sẵn click ra ngoài / Esc để đóng.
 */
export function GroupModals({
  activeModal,
  setActiveModal,
  selectedRequest,
  selectedAddBackMember,
  currentUserRole,
  isApprovePending,
  isRejectPending,
  isLeaveModalPending,
  isAddBackPending = false,
  onConfirmApprove,
  onConfirmReject,
  onConfirmLeaveGroup,
  onConfirmCancelJoinRequest,
  onConfirmAddBackToChat,
}: GroupModalsProps) {
  const closeModal = () => setActiveModal(null);
  const isPendingRequest = currentUserRole === 'pending';

  return (
    <>
      {activeModal === 'approve' && selectedRequest && (
        <ConfirmActionDialog
          icon={<UserCheck className="h-5 w-5" />}
          title="Duyệt thành viên gia nhập"
          description={
            <>
              Bạn có chắc chắn muốn duyệt <strong>{selectedRequest.userName}</strong> tham gia vào
              nhóm ghép này?
            </>
          }
          confirmLabel="Xác nhận duyệt"
          pendingLabel="Đang duyệt..."
          isPending={isApprovePending}
          onConfirm={onConfirmApprove}
          onCancel={closeModal}
        />
      )}

      {activeModal === 'reject' && selectedRequest && (
        <ConfirmActionDialog
          variant="destructive"
          icon={<AlertTriangle className="h-5 w-5" />}
          title="Từ chối yêu cầu"
          description={
            <>
              Từ chối <strong>{selectedRequest.userName}</strong> gia nhập nhóm? Hành động này không
              thể hoàn tác.
            </>
          }
          confirmLabel="Xác nhận từ chối"
          pendingLabel="Đang từ chối..."
          isPending={isRejectPending}
          onConfirm={onConfirmReject}
          onCancel={closeModal}
        />
      )}

      {activeModal === 'leave' && (
        <ConfirmActionDialog
          variant="destructive"
          icon={<LogOut className="h-5 w-5" />}
          title={isPendingRequest ? 'Hủy yêu cầu tham gia' : 'Rời khỏi nhóm ghép'}
          description={
            isPendingRequest
              ? 'Bạn có chắc chắn muốn hủy yêu cầu xin tham gia nhóm ghép này?'
              : 'Bạn có chắc chắn muốn rời khỏi chuyến đi này?'
          }
          confirmLabel={isPendingRequest ? 'Xác nhận hủy' : 'Xác nhận rời'}
          pendingLabel={isPendingRequest ? 'Đang hủy...' : 'Đang thực hiện...'}
          isPending={isLeaveModalPending}
          onConfirm={isPendingRequest ? onConfirmCancelJoinRequest : onConfirmLeaveGroup}
          onCancel={closeModal}
        />
      )}

      {activeModal === 'addBackToChat' && selectedAddBackMember && (
        <ConfirmActionDialog
          icon={<UserCheck className="h-5 w-5" />}
          title="Thêm vào nhóm chat"
          description={
            <>
              Bạn có chắc chắn muốn thêm lại <strong>{selectedAddBackMember.name}</strong> vào nhóm
              chat?
            </>
          }
          confirmLabel="Xác nhận"
          pendingLabel="Đang thêm..."
          isPending={isAddBackPending}
          onConfirm={() => onConfirmAddBackToChat?.()}
          onCancel={closeModal}
        />
      )}
    </>
  );
}
