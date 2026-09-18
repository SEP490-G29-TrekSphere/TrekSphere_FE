import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info,
  MapPin,
  RotateCcw,
  User,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppButton, AppModalShell } from '@/shared/ui';
import { formatDate, formatDateTime } from '@/utils/format';
import { MATCHING_GROUP_APPLICATION_STATUS_META } from '../../constants';
import type { MyMatchingJoinRequestItem } from '../../types/matchingGroup';

interface ApplicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: MyMatchingJoinRequestItem | null;
  isJoinedGroup?: boolean;
  canReapply?: boolean;
  onWithdraw?: (application: MyMatchingJoinRequestItem) => void;
  onReapply?: (application: MyMatchingJoinRequestItem) => void;
  onViewDetail: (groupId: string) => void;
  onViewWorkspace?: (groupId: string) => void;
}

export function ApplicationDetailModal({
  isOpen,
  onClose,
  application,
  isJoinedGroup,
  canReapply,
  onWithdraw,
  onReapply,
  onViewDetail,
  onViewWorkspace,
}: ApplicationDetailModalProps) {
  if (!isOpen || !application) return null;

  const meta = MATCHING_GROUP_APPLICATION_STATUS_META[application.status];
  const isPending = application.status === 'PENDING';
  const isAccepted = application.status === 'ACCEPTED';
  const isRejected = application.status === 'REJECTED';
  const isWithdrawn = application.status === 'WITHDRAWN';

  return (
    <AppModalShell
      open
      onClose={onClose}
      aria-label="Chi tiết đơn xin tham gia nhóm ghép"
      className="flex max-w-lg flex-col overflow-hidden border border-border p-0 shadow-xl"
    >
      {/* Header */}
      <div className="relative border-border border-b bg-muted/30 px-6 py-5">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
          aria-label="Đóng"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-base">Chi Tiết Đơn Tham Gia</h2>
            <p className="text-muted-foreground text-xs">
              Mã đơn:{' '}
              <span className="font-mono">{application.applicationId.substring(0, 8)}...</span>
            </p>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="max-h-[75vh] space-y-5 overflow-y-auto p-6 text-xs">
        {/* Status Alert Banner */}
        <div
          className={cn(
            'flex items-start gap-3 rounded-2xl border p-4',
            isPending && 'border-amber-500/20 bg-amber-500/5 text-amber-800 dark:text-amber-300',
            isAccepted &&
              'border-emerald-500/20 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300',
            isRejected && 'border-destructive/20 bg-destructive/5 text-destructive',
            isWithdrawn && 'border-border bg-muted/40 text-muted-foreground'
          )}
        >
          <div className="mt-0.5 shrink-0">
            {isPending && <Clock className="h-4 w-4 text-amber-600" />}
            {isAccepted && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
            {isRejected && <XCircle className="h-4 w-4 text-destructive" />}
            {isWithdrawn && <AlertCircle className="h-4 w-4 text-muted-foreground" />}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">Trạng thái:</span>
              <span
                className={cn(
                  'rounded-full border px-2.5 py-0.5 font-bold text-[10px]',
                  meta.className
                )}
              >
                {meta.label}
              </span>
            </div>
            <p className="text-xs leading-relaxed opacity-90">
              {isPending && 'Yêu cầu của bạn đang chờ Trưởng nhóm xét duyệt thông tin.'}
              {isAccepted && 'Bạn đã được chấp nhận tham gia nhóm ghép này.'}
              {isRejected && 'Yêu cầu tham gia của bạn đã bị Trưởng nhóm từ chối.'}
              {isWithdrawn && 'Bạn đã chủ động rút yêu cầu tham gia nhóm này.'}
            </p>
          </div>
        </div>

        {/* Group Information */}
        <div className="space-y-2.5 rounded-2xl border border-border bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">
              Thông tin nhóm ghép
            </h3>
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewDetail(application.matchingGroupId);
              }}
              className="inline-flex items-center gap-1 font-semibold text-primary text-[11px] hover:underline cursor-pointer"
            >
              <span>Xem trang nhóm</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2 pt-1">
            <div className="font-bold text-foreground text-sm">{application.groupName}</div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate">
                  {application.tourName ??
                    application.customJourneyTitle ??
                    application.location ??
                    'Chưa xác định'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span>
                  Trưởng nhóm: <strong>{application.ownerName}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span>Khởi hành: {formatDate(application.targetDate)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span>
                  Sĩ số: {application.currentSize}/{application.maxSize} thành viên
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Application Message */}
        <div className="space-y-1.5 rounded-2xl border border-border bg-card p-4 shadow-2xs">
          <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">
            Lời nhắn đã gửi
          </h3>
          {application.message ? (
            <p className="rounded-xl bg-muted/40 p-3 italic text-foreground/90 leading-relaxed">
              "{application.message}"
            </p>
          ) : (
            <p className="italic text-muted-foreground">Không có lời nhắn kèm theo.</p>
          )}
        </div>

        {/* Rejection Reason Notice */}
        {isRejected && (
          <div className="space-y-1.5 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-destructive shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Lý do từ chối từ Trưởng nhóm</span>
            </div>
            <p className="rounded-xl border border-destructive/20 bg-background/90 p-3 font-medium text-destructive leading-relaxed">
              {application.rejectReason || 'Trưởng nhóm không kèm theo lý do cụ thể.'}
            </p>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-2 rounded-2xl border border-border bg-card p-4 shadow-2xs">
          <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">
            Dòng thời gian xử lý
          </h3>
          <div className="space-y-2 text-muted-foreground pt-1">
            <div className="flex items-center justify-between">
              <span>Thời điểm gửi đơn:</span>
              <span className="font-medium text-foreground">
                {formatDateTime(application.createdAt)}
              </span>
            </div>
            {application.reviewedAt && (
              <div className="flex items-center justify-between">
                <span>Thời điểm xét duyệt:</span>
                <span className="font-medium text-foreground">
                  {formatDateTime(application.reviewedAt)}
                </span>
              </div>
            )}
            {application.withdrawnAt && (
              <div className="flex items-center justify-between">
                <span>Thời điểm rút đơn:</span>
                <span className="font-medium text-foreground">
                  {formatDateTime(application.withdrawnAt)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span>Hạn chót ghép nhóm:</span>
              <span className="font-medium text-foreground">
                {formatDateTime(application.matchingDeadline)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-border border-t bg-muted/10 px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-border bg-background px-4 py-2 font-semibold text-foreground text-xs hover:bg-muted cursor-pointer transition-colors"
        >
          Đóng
        </button>

        <div className="flex items-center gap-2">
          {/* Action: Withdraw */}
          {isPending && onWithdraw && (
            <AppButton
              variant="outline"
              onClick={() => {
                onClose();
                onWithdraw(application);
              }}
              className="rounded-full border-destructive px-4 py-2 font-semibold text-destructive text-xs hover:bg-destructive/5"
            >
              Rút yêu cầu
            </AppButton>
          )}

          {/* Action: Reapply */}
          {(isRejected || isWithdrawn) && canReapply && onReapply && (
            <AppButton
              variant="outline"
              onClick={() => {
                onClose();
                onReapply(application);
              }}
              className="rounded-full border-primary px-4 py-2 font-semibold text-primary text-xs hover:bg-primary/5 inline-flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Nộp lại đơn</span>
            </AppButton>
          )}

          {/* Action: Group detail / Workspace */}
          {isAccepted || isJoinedGroup ? (
            <AppButton
              onClick={() => {
                onClose();
                (onViewWorkspace ?? onViewDetail)(application.matchingGroupId);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2 font-bold text-white text-xs hover:bg-emerald-700 shadow-xs"
            >
              <span>Vào nhóm</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </AppButton>
          ) : (
            <AppButton
              onClick={() => {
                onClose();
                onViewDetail(application.matchingGroupId);
              }}
              className="rounded-full px-5 py-2 font-bold text-xs shadow-xs"
            >
              Xem chi tiết nhóm
            </AppButton>
          )}
        </div>
      </div>
    </AppModalShell>
  );
}
