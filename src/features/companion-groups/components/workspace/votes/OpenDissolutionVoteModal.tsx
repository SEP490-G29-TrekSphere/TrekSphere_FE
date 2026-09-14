import { AlertTriangle, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppModalShell } from '@/shared/ui';
import { useOpenDissolutionVote } from '../../../hooks/vote/useOpenDissolutionVote';

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
  const [reason, setReason] = useState('');
  const [closesAtLocal, setClosesAtLocal] = useState(defaultClosesAtLocal());
  const [confirmed, setConfirmed] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: chỉ muốn reset form khi isOpen đổi (mở lại modal)
  useEffect(() => {
    if (isOpen) {
      setReason('');
      setClosesAtLocal(defaultClosesAtLocal());
      setConfirmed(false);
      openDissolution.reset();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim() || !confirmed) return;

    openDissolution.mutate(
      {
        reason: reason.trim(),
        closesAt: new Date(closesAtLocal).toISOString(),
      },
      { onSuccess: () => onSuccess?.() }
    );
  }

  const canSubmit = reason.trim().length > 0 && confirmed && !openDissolution.isPending;

  return (
    <AppModalShell
      open
      onClose={onClose}
      aria-label="Mở biểu quyết giải tán nhóm"
      className="flex max-w-lg flex-col overflow-hidden border border-border p-0"
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

      <div className="border-border border-b bg-destructive/5 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <h2 className="font-extrabold text-foreground text-base sm:text-lg">
              Mở biểu quyết giải tán nhóm
            </h2>
            <p className="text-muted-foreground text-xs">
              Nếu "Đồng ý" thắng, nhóm sẽ chuyển sang trạng thái đã huỷ ngay lập tức và không thể
              hoàn tác.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-6 text-xs">
        <div className="space-y-1.5">
          <label htmlFor="dissolution-reason" className="font-bold text-foreground text-xs">
            Lý do đề xuất giải tán nhóm
          </label>
          <textarea
            id="dissolution-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={openDissolution.isPending}
            placeholder="VD: Không đủ thành viên tiếp tục chuyến đi, kế hoạch đã thay đổi..."
            className="w-full resize-none rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="dissolution-closes-at" className="font-bold text-foreground text-xs">
            Thời hạn bỏ phiếu
          </label>
          <input
            id="dissolution-closes-at"
            type="datetime-local"
            value={closesAtLocal}
            min={defaultClosesAtLocal()}
            onChange={(e) => setClosesAtLocal(e.target.value)}
            disabled={openDissolution.isPending}
            className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 p-3 select-none">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            disabled={openDissolution.isPending}
            className="mt-0.5 h-4 w-4 rounded border-input text-destructive focus:ring-destructive"
          />
          <span className="text-[11px] text-destructive/90 leading-relaxed">
            Tôi hiểu toàn bộ thành viên sẽ bỏ phiếu, và nếu "Đồng ý" thắng thì nhóm sẽ bị huỷ (kèm
            chuyến đi đang lên kế hoạch, nếu có) và không thể hoàn tác.
          </span>
        </label>

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
            disabled={!canSubmit}
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
    </AppModalShell>
  );
}
