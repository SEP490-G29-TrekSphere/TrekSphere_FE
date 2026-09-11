import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { MATCHING_GROUP_APPLICATION_MESSAGE_MAX_LENGTH } from '../../constants';
import { useScheduleConflicts } from '../../hooks/useScheduleConflicts';
import type { MatchingMemberStatus } from '../../types/matchingGroup';
import {
  JOIN_GROUP_APPLICATION_DEFAULT_VALUES,
  type JoinGroupApplicationFormValues,
  joinGroupApplicationSchema,
} from '../../validations';
import { ScheduleConflictNotice } from '../ScheduleConflictNotice';

interface JoinGroupApplicationPanelProps {
  existingStatus?: MatchingMemberStatus;
  /** Nhóm đang xin tham gia — cần để đối chiếu trùng ngày với lịch hiện có. */
  matchingGroupId: string;
  targetDate?: string;
  endDate?: string | null;
  isPending: boolean;
  onCancel: () => void;
  onViewDetail: () => void;
  onSubmit: (values: JoinGroupApplicationFormValues) => void;
}

export function JoinGroupApplicationPanel({
  existingStatus,
  matchingGroupId,
  targetDate,
  endDate,
  isPending,
  onCancel,
  onViewDetail,
  onSubmit,
}: JoinGroupApplicationPanelProps) {
  const form = useForm<JoinGroupApplicationFormValues>({
    resolver: zodResolver(joinGroupApplicationSchema),
    defaultValues: JOIN_GROUP_APPLICATION_DEFAULT_VALUES,
  });
  const { findConflicts, isLoading: isCheckingSchedule } = useScheduleConflicts();
  const conflicts = findConflicts({ start: targetDate, end: endDate }, matchingGroupId);
  const hasConflict = conflicts.length > 0;
  // Chưa tải xong lịch cũ thì chưa kết luận được, khoá tạm nút gửi.
  const isSubmitBlocked = hasConflict || isCheckingSchedule;

  if (existingStatus === 'PENDING' || existingStatus === 'ACCEPTED') {
    const isApplicationPending = existingStatus === 'PENDING';
    return (
      <section className="space-y-6 lg:col-span-7">
        <div>
          <h1 className="font-extrabold text-2xl text-foreground tracking-tight sm:text-3xl">
            {isApplicationPending ? 'Yêu cầu đang chờ duyệt' : 'Đã tham gia nhóm'}
          </h1>
          <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
            {isApplicationPending
              ? 'Bạn đã gửi yêu cầu tham gia nhóm này. Vui lòng chờ trưởng nhóm xét duyệt.'
              : 'Bạn đã là thành viên chính thức của nhóm ghép này.'}
          </p>
        </div>
        <div className="space-y-4 rounded-[2rem] border border-border/60 bg-card p-6 text-center shadow-2xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <p className="font-semibold text-foreground text-sm">
            {isApplicationPending
              ? 'Yêu cầu của bạn đang ở trạng thái chờ duyệt.'
              : 'Bạn đã tham gia nhóm thành công.'}
          </p>
          <button
            type="button"
            onClick={onViewDetail}
            className="cursor-pointer rounded-full bg-primary px-6 py-2.5 font-bold text-primary-foreground text-xs transition-colors hover:bg-primary/90"
          >
            Xem chi tiết nhóm
          </button>
        </div>
      </section>
    );
  }

  const message = form.watch('message') ?? '';
  return (
    <section className="space-y-6 lg:col-span-7">
      <div>
        <h1 className="font-extrabold text-2xl text-foreground tracking-tight sm:text-3xl">
          Gửi yêu cầu tham gia
        </h1>
        <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
          Bạn có thể gửi lời giới thiệu ngắn để trưởng nhóm xem xét.
        </p>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ScheduleConflictNotice
          conflicts={conflicts}
          hint="Hãy rút đơn hoặc rời nhóm trùng ngày trước, rồi quay lại gửi yêu cầu này."
        />

        <div>
          <label
            htmlFor="application-message"
            className="mb-2 block font-bold text-foreground text-xs"
          >
            Lời nhắn gửi đến trưởng nhóm{' '}
            <span className="font-normal text-muted-foreground">(không bắt buộc)</span>
          </label>
          <div className="relative">
            <textarea
              id="application-message"
              rows={4}
              maxLength={MATCHING_GROUP_APPLICATION_MESSAGE_MAX_LENGTH}
              {...form.register('message')}
              placeholder="Chào trưởng nhóm, mình rất muốn tham gia hành trình này vì..."
              className="w-full resize-none rounded-2xl border border-input bg-muted/60 p-4 text-foreground text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
            />
            <span className="absolute right-3 bottom-3 text-muted-foreground text-xs">
              {message.length}/{MATCHING_GROUP_APPLICATION_MESSAGE_MAX_LENGTH}
            </span>
          </div>
          {form.formState.errors.message && (
            <p className="mt-1 pl-2 font-medium text-destructive text-xs">
              {form.formState.errors.message.message}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4 pt-2">
          <button
            type="button"
            disabled={isPending}
            onClick={onCancel}
            className="flex-1 cursor-pointer rounded-full border border-input bg-card px-6 py-3.5 text-center font-bold text-foreground text-sm transition-colors hover:bg-muted disabled:opacity-55"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isPending || isSubmitBlocked}
            title={
              hasConflict
                ? 'Ngày đi của nhóm trùng với một chuyến khác của bạn'
                : isCheckingSchedule
                  ? 'Đang kiểm tra lịch các chuyến bạn đã đăng ký...'
                  : undefined
            }
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-bold text-primary-foreground text-sm shadow-md transition-all hover:bg-primary/90 disabled:opacity-55"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <span>{isPending ? 'Đang gửi...' : 'Xác nhận gửi yêu cầu'}</span>
          </button>
        </div>
      </form>
    </section>
  );
}
