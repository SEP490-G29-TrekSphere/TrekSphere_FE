import { AlertTriangle, Loader2, UserCheck, X } from 'lucide-react';
import { useState } from 'react';
import { AppModalShell } from '@/shared/ui';
import type { JoinRequestAction } from '../detail/JoinRequestsCard';

export type JoinRequestDecisionAction = 'approve' | 'reject';

interface ReviewJoinRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: JoinRequestDecisionAction | null;
  request: JoinRequestAction | null;
  applicantMessage?: string | null;
  isPending: boolean;
  onConfirmApprove: () => void;
  onConfirmReject: (reason?: string) => void;
}

const MAX_REJECT_REASON_LENGTH = 255;

export function ReviewJoinRequestModal({
  isOpen,
  onClose,
  action,
  request,
  applicantMessage,
  isPending,
  onConfirmApprove,
  onConfirmReject,
}: ReviewJoinRequestModalProps) {
  const [rejectReason, setRejectReason] = useState('');

  if (!isOpen || !action || !request) return null;

  const isApprove = action === 'approve';

  function handleConfirm() {
    if (isApprove) {
      onConfirmApprove();
    } else {
      onConfirmReject(rejectReason.trim() || undefined);
    }
  }

  function handleClose() {
    setRejectReason('');
    onClose();
  }

  return (
    <AppModalShell
      open
      onClose={handleClose}
      aria-label={isApprove ? 'Duyệt thành viên tham gia nhóm' : 'Từ chối yêu cầu tham gia'}
      className="flex max-w-md flex-col overflow-hidden border border-border p-0"
    >
      <button
        type="button"
        onClick={handleClose}
        disabled={isPending}
        className="absolute top-4 right-4 z-10 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer disabled:opacity-50"
        aria-label="Đóng"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Header */}
      <div
        className={`border-border border-b px-6 py-5 ${
          isApprove ? 'bg-emerald-500/5' : 'bg-destructive/5'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isApprove
                ? 'bg-emerald-500/10 text-emerald-600'
                : 'bg-destructive/10 text-destructive'
            }`}
          >
            {isApprove ? <UserCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="font-bold text-foreground text-base">
              {isApprove ? 'Duyệt Thành Viên' : 'Từ Chối Yêu Cầu'}
            </h2>
            <p className="text-muted-foreground text-xs">
              {isApprove
                ? 'Chấp nhận thành viên gia nhập nhóm ghép của bạn'
                : 'Từ chối đơn xin gia nhập nhóm của ứng viên'}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-4 p-6 text-xs">
        {/* Applicant Card */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3.5">
          {request.avatarUrl ? (
            <img
              src={request.avatarUrl}
              alt={request.userName}
              className="h-10 w-10 rounded-full object-cover border border-border"
            />
          ) : (
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-sm ${
                isApprove
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {request.userName.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="space-y-0.5 min-w-0 flex-1">
            <h3 className="font-bold text-foreground text-sm truncate">{request.userName}</h3>
            <p className="text-muted-foreground text-[11px]">Ứng viên xin gia nhập nhóm</p>
          </div>
        </div>

        {/* Applicant Message Note (if any) */}
        {applicantMessage && (
          <div className="space-y-1 rounded-xl bg-muted/40 p-3 text-muted-foreground">
            <span className="font-semibold text-foreground text-[11px] block">
              Lời nhắn của ứng viên:
            </span>
            <p className="italic leading-relaxed">"{applicantMessage}"</p>
          </div>
        )}

        {/* Approve info vs Reject reason textarea */}
        {isApprove ? (
          <p className="text-muted-foreground leading-relaxed">
            Khi được duyệt, thành viên này sẽ chính thức tham gia nhóm, có quyền truy cập vào danh
            sách thành viên, lịch trình và nhóm chat chung của đoàn.
          </p>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="review-reject-reason"
                className="font-semibold text-foreground text-xs"
              >
                Lý do từ chối (tùy chọn)
              </label>
              <span className="text-[10px] text-muted-foreground">
                {rejectReason.length}/{MAX_REJECT_REASON_LENGTH}
              </span>
            </div>
            <textarea
              id="review-reject-reason"
              rows={3}
              maxLength={MAX_REJECT_REASON_LENGTH}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              disabled={isPending}
              placeholder="VD: Cung đường yêu cầu thể lực nâng cao hoặc nhóm đã ưu tiên slot trước..."
              className="w-full resize-none rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-destructive focus:ring-1 focus:ring-destructive disabled:opacity-50"
            />
            <p className="text-[11px] text-muted-foreground">
              Lý do từ chối sẽ được lưu và hiển thị cho ứng viên khi họ kiểm tra trạng thái đơn.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2.5 border-border border-t bg-muted/10 px-6 py-4">
        <button
          type="button"
          onClick={handleClose}
          disabled={isPending}
          className="rounded-full border border-border bg-background px-4 py-2 font-semibold text-foreground text-xs hover:bg-muted cursor-pointer disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isPending}
          className={`flex items-center justify-center gap-1.5 rounded-full px-5 py-2 font-bold text-white text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50 ${
            isApprove
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-destructive hover:bg-destructive/90'
          }`}
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>{isApprove ? 'Đang duyệt...' : 'Đang xử lý...'}</span>
            </>
          ) : isApprove ? (
            <>
              <UserCheck className="h-3.5 w-3.5" />
              <span>Xác nhận duyệt</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Xác nhận từ chối</span>
            </>
          )}
        </button>
      </div>
    </AppModalShell>
  );
}
