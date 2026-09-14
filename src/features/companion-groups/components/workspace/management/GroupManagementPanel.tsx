import { Eye, EyeOff, Flag, Lock, Play, Settings, Unlock, Vote } from 'lucide-react';
import type { MatchingGroupStatus } from '../../../services/companionGroupService';

interface GroupManagementPanelProps {
  groupStatus: MatchingGroupStatus;
  matchingDeadline?: string | null;
  targetDate?: string | null;
  endDate?: string | null;
  isLifecyclePending?: boolean;
  onEditGroup?: () => void;
  onHideGroup?: () => void;
  onShowGroup?: () => void;
  onCloseGroup?: () => void;
  onOpenGroup?: () => void;
  onStartTrip?: () => void;
  onCompleteTrip?: () => void;
  onOpenLeaderElection?: () => void;
}

const STATUS_LABELS: Partial<Record<MatchingGroupStatus, string>> = {
  OPEN: 'Đang mở tuyển thành viên',
  FULL: 'Đã đủ thành viên',
  CLOSED: 'Đã dừng tuyển thành viên',
  HIDDEN: 'Đang ẩn khỏi tìm kiếm',
  IN_PROGRESS: 'Chuyến đi đang diễn ra',
  COMPLETED: 'Chuyến đi đã hoàn thành',
  CANCELLED: 'Nhóm đã hủy',
};

const ACTION_BASE =
  'flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full py-2.5 font-bold text-xs shadow-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50';

/**
 * Bảng điều khiển vòng đời nhóm dành cho Trưởng nhóm.
 *
 * Trước đây nằm ở cột hành động bên phải nên luôn hiện trên mọi tab — các thao tác
 * nhạy cảm (dừng tuyển, ẩn nhóm, bắt đầu / hoàn thành chuyến đi) bị đặt ngay cạnh
 * nội dung đọc thường ngày. Nay gom vào tab "Quản lý nhóm" trong workspace.
 */
export function GroupManagementPanel({
  groupStatus,
  matchingDeadline,
  targetDate,
  endDate,
  isLifecyclePending = false,
  onEditGroup,
  onHideGroup,
  onShowGroup,
  onCloseGroup,
  onOpenGroup,
  onStartTrip,
  onCompleteTrip,
  onOpenLeaderElection,
}: GroupManagementPanelProps) {
  const isHidden = groupStatus === 'HIDDEN';
  const isClosed = groupStatus === 'CLOSED';
  const isOpen = groupStatus === 'OPEN';

  const isDeadlinePassed = matchingDeadline
    ? new Date(matchingDeadline).getTime() <= Date.now()
    : false;
  const isTargetDatePassed = targetDate
    ? new Date(targetDate).getTime() < new Date().setHours(0, 0, 0, 0)
    : false;
  const isWithinAllowedRecruitment = !isDeadlinePassed && !isTargetDatePassed;

  const isTripEndDatePassed = endDate
    ? new Date(endDate).getTime() < new Date().setHours(0, 0, 0, 0)
    : isTargetDatePassed;

  const canToggleVisibility = isOpen || groupStatus === 'FULL' || isClosed || isHidden;
  const canRunLifecycle = groupStatus !== 'COMPLETED' && groupStatus !== 'CANCELLED';

  return (
    <section className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-xs">
      <div className="flex flex-col gap-2 border-border border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-base text-foreground">Quản lý nhóm ghép</h3>
        </div>
        <span className="inline-flex w-fit items-center rounded-full bg-muted px-3 py-1 font-semibold text-[11px] text-muted-foreground">
          {STATUS_LABELS[groupStatus] ?? groupStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-2.5">
          <h4 className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
            Thông tin & Tuyển thành viên
          </h4>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Điều chỉnh cài đặt nhóm, trạng thái tuyển thành viên và hiển thị công khai.
          </p>

          {onEditGroup && (
            <button
              type="button"
              onClick={onEditGroup}
              disabled={isLifecyclePending}
              className={`${ACTION_BASE} border border-border bg-background text-foreground hover:bg-muted`}
            >
              Chỉnh sửa thông tin nhóm
            </button>
          )}

          {(isOpen || groupStatus === 'FULL') && onCloseGroup && (
            <button
              type="button"
              onClick={onCloseGroup}
              disabled={isLifecyclePending}
              className={`${ACTION_BASE} border border-amber-500/30 bg-amber-500/5 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400`}
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Tạm dừng tuyển thành viên</span>
            </button>
          )}

          {isClosed && onOpenGroup && isWithinAllowedRecruitment && (
            <button
              type="button"
              onClick={onOpenGroup}
              disabled={isLifecyclePending}
              className={`${ACTION_BASE} border border-emerald-500/30 bg-emerald-500/5 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400`}
            >
              <Unlock className="h-3.5 w-3.5" />
              <span>Mở lại tuyển thành viên</span>
            </button>
          )}

          {canToggleVisibility && !isHidden && onHideGroup && (
            <button
              type="button"
              onClick={onHideGroup}
              disabled={isLifecyclePending}
              className={`${ACTION_BASE} border border-border bg-background text-muted-foreground hover:bg-muted`}
            >
              <EyeOff className="h-3.5 w-3.5" />
              <span>Tạm ẩn nhóm khỏi tìm kiếm</span>
            </button>
          )}

          {canToggleVisibility && isHidden && onShowGroup && (
            <button
              type="button"
              onClick={onShowGroup}
              disabled={isLifecyclePending}
              className={`${ACTION_BASE} border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Hiển thị nhóm ra công khai</span>
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          <h4 className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
            Vòng đời chuyến đi
          </h4>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Chuyển trạng thái chuyến đi. Sau khi hoàn thành, tab Đánh giá bạn đồng hành sẽ mở cho cả
            đoàn.
          </p>

          {!canRunLifecycle ? (
            <p className="rounded-2xl border border-border/60 bg-muted/30 p-3 text-muted-foreground text-xs">
              Chuyến đi đã kết thúc — không còn thao tác vòng đời nào khả dụng.
            </p>
          ) : (
            <>
              {groupStatus !== 'IN_PROGRESS' && onStartTrip && !isTripEndDatePassed && (
                <button
                  type="button"
                  onClick={onStartTrip}
                  disabled={isLifecyclePending}
                  className={`${ACTION_BASE} bg-emerald-600 text-white hover:bg-emerald-700`}
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Bắt đầu chuyến đi</span>
                </button>
              )}

              {groupStatus === 'IN_PROGRESS' && onCompleteTrip && (
                <button
                  type="button"
                  onClick={onCompleteTrip}
                  disabled={isLifecyclePending}
                  className={`${ACTION_BASE} bg-primary text-primary-foreground hover:bg-primary/90`}
                >
                  <Flag className="h-3.5 w-3.5" />
                  <span>Hoàn thành chuyến đi</span>
                </button>
              )}

              {groupStatus !== 'IN_PROGRESS' && isTripEndDatePassed && (
                <p className="rounded-2xl border border-border/60 bg-muted/30 p-3 text-muted-foreground text-xs">
                  Đã quá ngày kết thúc dự kiến nên không thể bắt đầu chuyến đi. Hãy cập nhật lại
                  lịch trình trong phần chỉnh sửa thông tin nhóm.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {onOpenLeaderElection && (
        <div className="space-y-2.5 border-border border-t pt-5">
          <h4 className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
            Bầu cử & Giải tán nhóm
          </h4>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Đổi Trưởng nhóm chỉ thực hiện được qua bầu cử — toàn bộ thành viên bỏ phiếu, người nhiều
            phiếu nhất thắng.
          </p>
          <button
            type="button"
            onClick={onOpenLeaderElection}
            disabled={isLifecyclePending}
            className={`${ACTION_BASE} border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 md:w-auto md:px-5`}
          >
            <Vote className="h-3.5 w-3.5" />
            <span>Mở bầu Trưởng nhóm mới</span>
          </button>
        </div>
      )}
    </section>
  );
}
