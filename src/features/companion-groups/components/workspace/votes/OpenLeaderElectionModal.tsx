import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Users, Vote, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AppFormDatePicker, AppModalShell } from '@/shared/ui';
import { useOpenLeaderElection } from '../../../hooks/vote/useOpenLeaderElection';
import type { MatchingMemberItem } from '../../../services/companionGroupService';
import {
  type OpenLeaderElectionFormValues,
  openLeaderElectionSchema,
} from '../../../validations/vote.schema';

interface OpenLeaderElectionModalProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
  members: MatchingMemberItem[];
  onSuccess?: () => void;
}

function defaultClosesAtLocal(): string {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function OpenLeaderElectionModal({
  groupId,
  isOpen,
  onClose,
  members,
  onSuccess,
}: OpenLeaderElectionModalProps) {
  const openElection = useOpenLeaderElection(groupId);

  const candidates = members.filter(
    (m) => m.status === 'ACCEPTED' && m.role !== 'LEADER' && m.matchingMemberId
  );

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<OpenLeaderElectionFormValues>({
    resolver: zodResolver(openLeaderElectionSchema),
    defaultValues: {
      reason: '',
      closesAt: defaultClosesAtLocal(),
      candidateMemberIds: [],
    },
    mode: 'onChange',
  });

  const candidateIds = watch('candidateMemberIds') || [];

  // biome-ignore lint/correctness/useExhaustiveDependencies: rule suppressed for specific design requirements
  useEffect(() => {
    if (isOpen) {
      reset({
        reason: '',
        closesAt: defaultClosesAtLocal(),
        candidateMemberIds: [],
      });
      openElection.reset();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function toggleCandidate(memberId: string) {
    const current = candidateIds;
    const next = current.includes(memberId)
      ? current.filter((id) => id !== memberId)
      : [...current, memberId];
    setValue('candidateMemberIds', next, { shouldValidate: true, shouldDirty: true });
  }

  const onSubmit = handleSubmit((data) => {
    openElection.mutate(
      {
        reason: data.reason.trim(),
        closesAt: new Date(data.closesAt).toISOString(),
        candidateMemberIds: data.candidateMemberIds,
      },
      { onSuccess: () => onSuccess?.() }
    );
  });

  return (
    <AppModalShell
      open
      onClose={onClose}
      aria-label="Mở bầu Trưởng nhóm mới"
      className="flex max-w-lg flex-col overflow-hidden border border-border p-0 max-h-[90vh]"
    >
      <button
        type="button"
        onClick={onClose}
        disabled={openElection.isPending}
        className="absolute top-4 right-4 z-10 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer disabled:opacity-50"
        aria-label="Đóng"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="border-border border-b bg-primary/5 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Vote className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <h2 className="font-extrabold text-foreground text-base sm:text-lg">
              Mở bầu Trưởng nhóm mới
            </h2>
            <p className="text-muted-foreground text-xs">
              Tất cả thành viên sẽ bỏ phiếu; người có nhiều phiếu nhất trở thành Trưởng nhóm mới.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
        <form onSubmit={onSubmit} className="space-y-4 p-6 text-xs">
          {/* Action Impact Warning */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-primary text-xs">
              <Vote className="h-4 w-4 shrink-0" />
              <span>Cảnh báo chuyển giao quyền Trưởng nhóm</span>
            </div>
            <ul className="space-y-1 text-muted-foreground list-disc pl-4 text-[10.5px] leading-relaxed">
              <li>
                <strong className="text-foreground">Chuyển giao quyền quản trị:</strong> Ứng viên
                đạt số phiếu cao nhất khi kết thúc biểu quyết sẽ trở thành{' '}
                <strong>Trưởng nhóm mới</strong>.
              </li>
              <li>
                <strong className="text-foreground">Thay đổi vai trò:</strong> Vai trò của bạn sẽ tự
                động chuyển thành <strong>Thành viên (Member)</strong>.
              </li>
              <li>
                <strong className="text-foreground">Dữ liệu đoàn:</strong> Toàn bộ lịch trình, bài
                viết, hóa đơn chi phí và thành viên hiện tại được giữ nguyên vẹn.
              </li>
            </ul>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="election-reason" className="font-bold text-foreground text-xs">
              Lý do mở bầu cử <span className="text-destructive">*</span>
            </label>
            <textarea
              id="election-reason"
              rows={3}
              {...register('reason')}
              disabled={openElection.isPending}
              placeholder="VD: Trưởng nhóm hiện tại bận việc đột xuất, không thể tiếp tục điều phối chuyến đi..."
              className="w-full resize-none rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            {errors.reason && (
              <p className="text-[11px] font-medium text-destructive">{errors.reason.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="election-closes-at" className="font-bold text-foreground text-xs">
              Thời hạn bỏ phiếu <span className="text-destructive">*</span>
            </label>
            <AppFormDatePicker
              id="election-closes-at"
              name="closesAt"
              control={control}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="Giờ"
              disabled={openElection.isPending}
              className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            {errors.closesAt && (
              <p className="text-[11px] font-medium text-destructive">{errors.closesAt.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground text-xs">
                Chọn ứng viên (tối thiểu 2) <span className="text-destructive">*</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                Đã chọn {candidateIds.length}
              </span>
            </div>
            {candidates.length < 2 ? (
              <p className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-[11px] text-amber-700 dark:text-amber-400">
                Cần tối thiểu 2 thành viên khác (không phải Trưởng nhóm hiện tại) để mở bầu cử.
              </p>
            ) : (
              <div className="max-h-52 space-y-1.5 overflow-y-auto rounded-xl border border-border p-2">
                {candidates.map((member) => (
                  <label
                    key={member.matchingMemberId}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg p-2 hover:bg-muted select-none"
                  >
                    <input
                      type="checkbox"
                      checked={candidateIds.includes(member.matchingMemberId as string)}
                      onChange={() => toggleCandidate(member.matchingMemberId as string)}
                      disabled={openElection.isPending}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    />
                    <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">{member.fullName}</span>
                  </label>
                ))}
              </div>
            )}
            {errors.candidateMemberIds && (
              <p className="text-[11px] font-medium text-destructive">
                {errors.candidateMemberIds.message}
              </p>
            )}
          </div>

          {openElection.isError && (
            <p className="text-[11px] font-semibold text-destructive">
              {openElection.error instanceof Error
                ? openElection.error.message
                : 'Không thể mở bầu cử, vui lòng thử lại.'}
            </p>
          )}

          <div className="flex justify-end gap-2.5 border-border border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={openElection.isPending}
              className="rounded-full border border-border bg-background px-4 py-2 font-semibold text-foreground text-xs hover:bg-muted cursor-pointer transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!isValid || openElection.isPending}
              className="flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2 font-bold text-primary-foreground text-xs hover:bg-primary-hover transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {openElection.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Đang mở...</span>
                </>
              ) : (
                <>
                  <Vote className="h-3.5 w-3.5" />
                  <span>Mở bầu cử</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppModalShell>
  );
}
