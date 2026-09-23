import { AlertTriangle, ExternalLink, Loader2, ShieldCheck, UserCheck, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserProfilePath } from '@/constants';
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
  const isLowTrust = isApprove && typeof request.trustScore === 'number' && request.trustScore < 80;

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
      aria-label={
        isLowTrust
          ? 'Cảnh báo điểm uy tín thấp trước khi duyệt'
          : isApprove
            ? 'Duyệt thành viên tham gia nhóm'
            : 'Từ chối yêu cầu tham gia'
      }
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
          isLowTrust ? 'bg-amber-500/10' : isApprove ? 'bg-emerald-500/5' : 'bg-destructive/5'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isLowTrust
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                : isApprove
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-destructive/10 text-destructive'
            }`}
          >
            {isLowTrust ? (
              <AlertTriangle className="h-5 w-5" />
            ) : isApprove ? (
              <UserCheck className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
          </div>
          <div>
            <h2 className="font-bold text-foreground text-base">
              {isLowTrust
                ? 'Cảnh Báo Điểm Uy Tín Thấp'
                : isApprove
                  ? 'Duyệt Thành Viên'
                  : 'Từ Chối Yêu Cầu'}
            </h2>
            <p className="text-muted-foreground text-xs">
              {isLowTrust
                ? 'Ứng viên có điểm uy tín dưới mức tiêu chuẩn (80/100)'
                : isApprove
                  ? 'Chấp nhận thành viên gia nhập nhóm ghép của bạn'
                  : 'Từ chối đơn xin gia nhập nhóm của ứng viên'}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-4 p-6 text-xs">
        {/* Applicant Card */}
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-3.5">
          {request.userId ? (
            <Link
              to={getUserProfilePath(request.userId)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 min-w-0 flex-1 hover:opacity-85 transition-opacity"
              title="Xem trang cá nhân (mở trong tab mới)"
            >
              {request.avatarUrl ? (
                <img
                  src={request.avatarUrl}
                  alt={request.userName}
                  className="h-10 w-10 rounded-full object-cover border border-border shrink-0"
                />
              ) : (
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-sm ${
                    isLowTrust
                      ? 'bg-amber-500/10 text-amber-600'
                      : isApprove
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-destructive/10 text-destructive'
                  }`}
                >
                  {request.userName.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                    {request.userName}
                  </h3>
                  <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </div>
                <p className="text-muted-foreground text-[11px]">Ứng viên xin gia nhập nhóm</p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {request.avatarUrl ? (
                <img
                  src={request.avatarUrl}
                  alt={request.userName}
                  className="h-10 w-10 rounded-full object-cover border border-border shrink-0"
                />
              ) : (
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-sm ${
                    isLowTrust
                      ? 'bg-amber-500/10 text-amber-600'
                      : isApprove
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
          )}

          {typeof request.trustScore === 'number' && (
            <div className="shrink-0">
              {request.trustScore < 80 ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  {request.trustScore}/100
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  {request.trustScore}/100
                </span>
              )}
            </div>
          )}
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
          <div className="space-y-3">
            {isLowTrust && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300 text-xs">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>Lưu ý trước khi duyệt vào nhóm</span>
                </div>
                <p className="text-amber-900/80 dark:text-amber-200/90 text-xs leading-relaxed">
                  Ứng viên này có điểm uy tín là{' '}
                  <strong className="font-bold text-amber-700 dark:text-amber-300">
                    {request.trustScore}/100
                  </strong>{' '}
                  (thấp hơn mức tiêu chuẩn 80 điểm do từng nhận đánh giá thấp hoặc bị cảnh cáo).
                </p>
                <p className="text-amber-900/80 dark:text-amber-200/90 text-[11px] leading-relaxed italic">
                  Trưởng nhóm vui lòng cân nhắc kỹ trước khi quyết định đồng ý cho thành viên này
                  gia nhập đoàn.
                </p>
              </div>
            )}
            <p className="text-muted-foreground leading-relaxed">
              Khi được duyệt, thành viên này sẽ chính thức tham gia nhóm, có quyền truy cập vào danh
              sách thành viên, lịch trình và nhóm chat chung của đoàn.
            </p>
          </div>
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
            isLowTrust
              ? 'bg-amber-600 hover:bg-amber-700'
              : isApprove
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-destructive hover:bg-destructive/90'
          }`}
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>{isApprove ? 'Đang duyệt...' : 'Đang xử lý...'}</span>
            </>
          ) : isLowTrust ? (
            <>
              <UserCheck className="h-3.5 w-3.5" />
              <span>Xác nhận vẫn duyệt</span>
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
