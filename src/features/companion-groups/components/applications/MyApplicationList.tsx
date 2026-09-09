import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  RotateCcw,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppButton } from '@/shared/ui';
import { formatDate } from '@/utils/format';
import { MATCHING_GROUP_APPLICATION_STATUS_META } from '../../constants';
import type { MyMatchingJoinRequestItem } from '../../types/matchingGroup';

interface MyApplicationListProps {
  applications: MyMatchingJoinRequestItem[];
  isLoading: boolean;
  isError: boolean;
  isWithdrawing: boolean;
  page: number;
  totalPages: number;
  isFiltered: boolean;
  onRetry: () => void;
  onWithdraw: (groupId: string) => void;
  onViewDetail: (groupId: string) => void;
  onPageChange: (page: number) => void;
}

export function MyApplicationList({
  applications,
  isLoading,
  isError,
  isWithdrawing,
  page,
  totalPages,
  isFiltered,
  onRetry,
  onWithdraw,
  onViewDetail,
  onPageChange,
}: MyApplicationListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
        <p className="font-semibold text-muted-foreground text-sm">Đang tải danh sách yêu cầu...</p>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <RotateCcw className="mb-4 h-8 w-8 text-destructive" />
        <h3 className="font-bold text-base text-primary">Không thể tải yêu cầu</h3>
        <p className="mb-6 max-w-sm text-muted-foreground text-xs">
          Đã xảy ra lỗi kết nối với máy chủ.
        </p>
        <AppButton onClick={onRetry}>Thử lại</AppButton>
      </div>
    );
  }
  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-white py-16 text-center">
        <AlertCircle className="mb-3 h-10 w-10 text-muted-foreground" />
        <h3 className="font-bold text-base text-primary">Không tìm thấy yêu cầu nào</h3>
        <p className="mt-1 max-w-xs text-muted-foreground text-xs">
          {isFiltered
            ? 'Không có yêu cầu nào có trạng thái được chọn.'
            : 'Bạn chưa gửi yêu cầu tham gia bất kỳ nhóm ghép nào.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {applications.map((application) => {
          const meta = MATCHING_GROUP_APPLICATION_STATUS_META[application.status];
          return (
            <article
              key={application.applicationId}
              className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-white p-5 shadow-2xs transition-shadow hover:shadow-xs sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-4">
                {application.ownerAvatarUrl ? (
                  <img
                    src={application.ownerAvatarUrl}
                    alt={application.ownerName}
                    className="h-11 w-11 rounded-full border border-border object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-emerald-50 font-bold text-primary text-xs">
                    {application.ownerName.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onViewDetail(application.matchingGroupId)}
                      className="cursor-pointer text-left font-bold text-primary text-sm hover:underline"
                    >
                      {application.groupName}
                    </button>
                    <span
                      className={cn(
                        'rounded-full border px-2.5 py-0.5 font-bold text-[10px]',
                        meta.className
                      )}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>
                      {application.tourName ??
                        application.customJourneyTitle ??
                        application.location}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Khởi hành: {formatDate(application.targetDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      Sĩ số: {application.currentSize}/{application.maxSize} thành viên
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto">
                {application.status === 'PENDING' && application.canWithdraw && (
                  <AppButton
                    variant="outline"
                    disabled={isWithdrawing}
                    onClick={() => onWithdraw(application.matchingGroupId)}
                    className="shrink-0 rounded-full border-destructive px-4 py-1 font-semibold text-destructive text-xs hover:bg-destructive/5"
                  >
                    Rút yêu cầu
                  </AppButton>
                )}
                <AppButton
                  onClick={() => onViewDetail(application.matchingGroupId)}
                  className="shrink-0 rounded-full px-4 py-1 font-semibold text-xs"
                >
                  Chi tiết nhóm
                </AppButton>
              </div>
            </article>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-muted-foreground text-xs">
            Trang {page + 1} / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Trang trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={page === totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Trang sau"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
