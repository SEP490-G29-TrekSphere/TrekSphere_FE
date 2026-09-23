import { LogOut, UserCheck, UserMinus } from 'lucide-react';
import { ConfirmActionDialog } from '@/shared/ui';
import type { UserRoleInGroup } from '../../types';
import { ReviewJoinRequestModal } from '../modals/ReviewJoinRequestModal';
import type { JoinRequestAction } from './JoinRequestsCard';

type ActiveModal = 'leave' | 'reject' | 'approve' | 'addBackToChat' | 'removeMember' | null;

interface GroupModalsProps {
  activeModal: ActiveModal;
  setActiveModal: (modal: ActiveModal) => void;
  selectedRequest: JoinRequestAction | null;
  selectedAddBackMember?: { id: string; name: string } | null;
  selectedRemoveMember?: { id: string; name: string } | null;
  currentUserRole: UserRoleInGroup;

  // Pending states
  isApprovePending: boolean;
  isRejectPending: boolean;
  isLeaveModalPending: boolean;
  isAddBackPending?: boolean;
  isRemoveMemberPending?: boolean;

  // Action Handlers
  onConfirmApprove: () => void;
  onConfirmReject: (reason?: string) => void;
  onConfirmLeaveGroup: () => void;
  onConfirmCancelJoinRequest: () => void;
  onConfirmAddBackToChat?: () => void;
  onConfirmRemoveMember?: () => void;
}

export function GroupModals({
  activeModal,
  setActiveModal,
  selectedRequest,
  selectedAddBackMember,
  selectedRemoveMember,
  currentUserRole,
  isApprovePending,
  isRejectPending,
  isLeaveModalPending,
  isAddBackPending = false,
  isRemoveMemberPending = false,
  onConfirmApprove,
  onConfirmReject,
  onConfirmLeaveGroup,
  onConfirmCancelJoinRequest,
  onConfirmAddBackToChat,
  onConfirmRemoveMember,
}: GroupModalsProps) {
  const closeModal = () => setActiveModal(null);
  const isPendingRequest = currentUserRole === 'pending';

  const isReviewDecisionModalOpen = activeModal === 'approve' || activeModal === 'reject';

  return (
    <>
      <ReviewJoinRequestModal
        isOpen={isReviewDecisionModalOpen}
        onClose={closeModal}
        action={activeModal === 'approve' || activeModal === 'reject' ? activeModal : null}
        request={selectedRequest}
        isPending={activeModal === 'approve' ? isApprovePending : isRejectPending}
        onConfirmApprove={onConfirmApprove}
        onConfirmReject={onConfirmReject}
      />

      {activeModal === 'leave' && (
        <ConfirmActionDialog
          variant="destructive"
          icon={<LogOut className="h-5 w-5" />}
          title={isPendingRequest ? 'Hủy yêu cầu tham gia' : 'Rời khỏi nhóm ghép'}
          description={
            isPendingRequest ? (
              'Bạn có chắc chắn muốn hủy yêu cầu xin tham gia nhóm ghép này?'
            ) : (
              <div className="space-y-2">
                <p>
                  Bạn có chắc chắn muốn rời khỏi chuyến đi này? Bạn sẽ mất quyền truy cập vào khu
                  làm việc của nhóm.
                </p>
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400 space-y-1">
                  <p className="font-bold">Lưu ý quan trọng:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    <li>
                      Bạn phải hoàn tất mọi khoản chi tiêu và quyết toán trong nhóm trước khi rời.
                    </li>
                    <li>Bài đăng và khoảnh khắc nội bộ của bạn sẽ được ẩn khỏi nhóm.</li>
                    <li>Khoảnh khắc đã chia sẻ công khai lên trang cá nhân vẫn được bảo lưu.</li>
                  </ul>
                </div>
              </div>
            )
          }
          confirmLabel={isPendingRequest ? 'Xác nhận hủy' : 'Xác nhận rời'}
          pendingLabel={isPendingRequest ? 'Đang hủy...' : 'Đang thực hiện...'}
          isPending={isLeaveModalPending}
          onConfirm={isPendingRequest ? onConfirmCancelJoinRequest : onConfirmLeaveGroup}
          onCancel={closeModal}
        />
      )}

      {activeModal === 'removeMember' && selectedRemoveMember && (
        <ConfirmActionDialog
          variant="destructive"
          icon={<UserMinus className="h-5 w-5" />}
          title="Xoá thành viên khỏi nhóm"
          description={
            <div className="space-y-2">
              <p>
                Bạn có chắc chắn muốn xoá <strong>{selectedRemoveMember.name}</strong> khỏi nhóm
                ghép này? Thành viên sẽ mất quyền truy cập ngay lập tức.
              </p>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400 space-y-1">
                <p className="font-bold">Lưu ý nghiệp vụ:</p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  <li>
                    Thành viên phải hoàn tất mọi khoản chi tiêu và quyết toán trước khi bị xóa.
                  </li>
                  <li>Bài đăng và khoảnh khắc của thành viên sẽ được ẩn khỏi nhóm.</li>
                  <li>
                    Khoảnh khắc chia sẻ công khai của họ vẫn được giữ trên trang cá nhân của họ.
                  </li>
                </ul>
              </div>
            </div>
          }
          confirmLabel="Xác nhận xoá"
          pendingLabel="Đang xoá..."
          isPending={isRemoveMemberPending}
          onConfirm={() => onConfirmRemoveMember?.()}
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
