import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Ban, CreditCard, Loader2, Receipt, ShieldAlert, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AppModalShell } from '@/shared/ui';
import { useGroupSettlement } from '../../../hooks/useGroupSettlement';
import { useOpenDissolutionVote } from '../../../hooks/vote/useOpenDissolutionVote';
import {
  type OpenDissolutionVoteFormValues,
  openDissolutionVoteSchema,
} from '../../../validations/vote.schema';

interface OpenDissolutionVoteModalProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/** Trả về datetime-local mặc định = hiện tại + 24 giờ, theo múi giờ local của trình duyệt. */
function defaultClosesAtLocal(): string {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function OpenDissolutionVoteModal({
  groupId,
  isOpen,
  onClose,
  onSuccess,
}: OpenDissolutionVoteModalProps) {
  const openDissolution = useOpenDissolutionVote(groupId);
  const { summary: settlementSummary } = useGroupSettlement({
    groupId,
    autoFetch: isOpen,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<OpenDissolutionVoteFormValues>({
    resolver: zodResolver(openDissolutionVoteSchema),
    defaultValues: {
      reason: '',
      closesAt: defaultClosesAtLocal(),
      confirmed: false,
    },
    mode: 'onChange',
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: chỉ muốn reset form khi isOpen đổi (mở lại modal)
  useEffect(() => {
    if (isOpen) {
      reset({
        reason: '',
        closesAt: defaultClosesAtLocal(),
        confirmed: false,
      });
      openDissolution.reset();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const onSubmit = handleSubmit((data) => {
    openDissolution.mutate(
      {
        reason: data.reason.trim(),
        closesAt: new Date(data.closesAt).toISOString(),
      },
      { onSuccess: () => onSuccess?.() }
    );
  });

  const totalExpense = settlementSummary?.totalGroupExpense ?? 0;
  const hasExpense = totalExpense > 0;

  return (
    <AppModalShell
      open
      onClose={onClose}
      aria-label="Mở biểu quyết giải tán nhóm"
      className="flex max-w-xl flex-col overflow-hidden border border-border p-0 max-h-[90vh]"
    >
      <button
        type="button"
        onClick={onClose}
        disabled={openDissolution.isPending}
        className="absolute top-4 right-4 z-10 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer disabled:opacity-50"
        aria-label="Đóng"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="border-border border-b bg-destructive/5 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <h2 className="font-extrabold text-foreground text-base sm:text-lg">
              Mở biểu quyết giải tán nhóm
            </h2>
            <p className="text-muted-foreground text-xs">
              Đề xuất tất cả thành viên trong nhóm bỏ phiếu quyết định dừng chuyến đi và hủy nhóm.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
        <form onSubmit={onSubmit} className="space-y-4 p-6 text-xs">
          {/* Warning and Consequence Breakdown */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-3">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
              <span>Cảnh báo trước khi tạo biểu quyết giải tán</span>
            </div>

            {/* Financial status summary */}
            {hasExpense && (
              <div className="rounded-lg bg-background/80 p-2.5 border border-amber-500/20 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <Receipt className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="text-muted-foreground">Tổng chi phí thực tế đoàn đã chi:</span>
                </div>
                <span className="font-bold text-foreground">
                  {totalExpense.toLocaleString('vi-VN')} đ
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-[11px]">
              {/* Blocked actions */}
              <div className="rounded-lg bg-destructive/10 p-2.5 border border-destructive/20 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-destructive">
                  <Ban className="h-3.5 w-3.5 shrink-0" />
                  <span>Hành động bị khóa vĩnh viễn</span>
                </div>
                <ul className="space-y-1 text-muted-foreground list-disc pl-4 text-[10.5px] leading-relaxed">
                  <li>Không thể tuyển hoặc duyệt thêm thành viên mới.</li>
                  <li>Không thể bắt đầu chuyến đi hoặc sửa lịch trình.</li>
                  <li>Không thể đăng bài viết, tạo thêm bình chọn.</li>
                  <li>Không thể tạo thêm hóa đơn hoặc sửa dự toán mới.</li>
                </ul>
              </div>

              {/* Preserved actions */}
              <div className="rounded-lg bg-emerald-500/10 p-2.5 border border-emerald-500/20 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                  <CreditCard className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span>Hành động vẫn được duy trì</span>
                </div>
                <ul className="space-y-1 text-muted-foreground list-disc pl-4 text-[10.5px] leading-relaxed">
                  <li>
                    <strong className="text-foreground font-semibold">
                      Quyết toán chi phí P2P:
                    </strong>{' '}
                    Thành viên nợ vẫn có thể nộp minh chứng và người nhận vẫn có thể xác nhận cho
                    đến khi tất toán 100%.
                  </li>
                  <li>Xem lại toàn bộ lịch sử chi phí và thông tin đoàn ở chế độ chỉ đọc.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="dissolution-reason" className="font-bold text-foreground text-xs">
              Lý do đề xuất giải tán nhóm <span className="text-destructive">*</span>
            </label>
            <textarea
              id="dissolution-reason"
              rows={3}
              {...register('reason')}
              disabled={openDissolution.isPending}
              placeholder="VD: Không đủ thành viên tiếp tục chuyến đi, kế hoạch đã thay đổi..."
              className="w-full resize-none rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            {errors.reason && (
              <p className="text-[11px] font-medium text-destructive">{errors.reason.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="dissolution-closes-at" className="font-bold text-foreground text-xs">
              Thời hạn bỏ phiếu <span className="text-destructive">*</span>
            </label>
            <input
              id="dissolution-closes-at"
              type="datetime-local"
              {...register('closesAt')}
              disabled={openDissolution.isPending}
              className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            {errors.closesAt && (
              <p className="text-[11px] font-medium text-destructive">{errors.closesAt.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 p-3 select-none">
              <input
                type="checkbox"
                {...register('confirmed')}
                disabled={openDissolution.isPending}
                className="mt-0.5 h-4 w-4 rounded border-input text-destructive focus:ring-destructive"
              />
              <span className="text-[11px] text-destructive/90 leading-relaxed font-medium">
                Tôi đã đọc rõ các tác động trên. Tôi hiểu toàn bộ thành viên sẽ bỏ phiếu, và nếu quá
                50% "Đồng ý", nhóm sẽ bị chuyển sang trạng thái đã hủy và không thể mở lại.
              </span>
            </label>
            {errors.confirmed && (
              <p className="text-[11px] font-medium text-destructive">{errors.confirmed.message}</p>
            )}
          </div>

          {openDissolution.isError && (
            <p className="text-[11px] font-semibold text-destructive">
              {openDissolution.error instanceof Error
                ? openDissolution.error.message
                : 'Không thể mở biểu quyết, vui lòng thử lại.'}
            </p>
          )}

          <div className="flex justify-end gap-2.5 border-border border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={openDissolution.isPending}
              className="rounded-full border border-border bg-background px-4 py-2 font-semibold text-foreground text-xs hover:bg-muted cursor-pointer transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!isValid || openDissolution.isPending}
              className="flex items-center justify-center gap-1.5 rounded-full bg-destructive px-5 py-2 font-bold text-destructive-foreground text-xs hover:bg-destructive/90 transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {openDissolution.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Đang mở...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Mở biểu quyết giải tán</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppModalShell>
  );
}
