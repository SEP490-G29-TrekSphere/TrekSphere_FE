import { Loader2, Plus, Trash2, Vote, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppModalShell } from '@/shared/ui';
import { useCreateVote } from '../../../hooks/vote/useCreateVote';

interface CreateGeneralPollModalProps {
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

function newOptionRow(): { id: string; value: string } {
  return { id: crypto.randomUUID(), value: '' };
}

export function CreateGeneralPollModal({
  groupId,
  isOpen,
  onClose,
  onSuccess,
}: CreateGeneralPollModalProps) {
  const createVote = useCreateVote(groupId);
  const [title, setTitle] = useState('');
  const [reason, setReason] = useState('');
  const [closesAtLocal, setClosesAtLocal] = useState(defaultClosesAtLocal());
  const [optionRows, setOptionRows] = useState(() => [newOptionRow(), newOptionRow()]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: chỉ muốn reset form khi isOpen đổi (mở lại modal)
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setReason('');
      setClosesAtLocal(defaultClosesAtLocal());
      setOptionRows([newOptionRow(), newOptionRow()]);
      createVote.reset();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmedOptions = optionRows.map((o) => o.value.trim()).filter((o) => o.length > 0);
  const canSubmit = title.trim().length > 0 && trimmedOptions.length >= 2 && !createVote.isPending;

  function updateOption(id: string, value: string) {
    setOptionRows((prev) => prev.map((o) => (o.id === id ? { ...o, value } : o)));
  }

  function addOption() {
    setOptionRows((prev) => [...prev, newOptionRow()]);
  }

  function removeOption(id: string) {
    setOptionRows((prev) => prev.filter((o) => o.id !== id));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    createVote.mutate(
      {
        title: title.trim(),
        reason: reason.trim(),
        closesAt: new Date(closesAtLocal).toISOString(),
        optionLabels: trimmedOptions,
      },
      { onSuccess: () => onSuccess?.() }
    );
  }

  return (
    <AppModalShell
      open
      onClose={onClose}
      aria-label="Tạo bình chọn mới"
      className="flex max-w-lg flex-col overflow-hidden border border-border p-0"
    >
      <button
        type="button"
        onClick={onClose}
        disabled={createVote.isPending}
        className="absolute top-4 right-4 z-10 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer disabled:opacity-50"
        aria-label="Đóng"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="border-border border-b bg-primary/5 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Vote className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <h2 className="font-extrabold text-foreground text-base sm:text-lg">
              Tạo bình chọn mới
            </h2>
            <p className="text-muted-foreground text-xs">
              Mọi thành viên có thể xem và bỏ phiếu. Đây chỉ là bình chọn thảo luận, không ảnh hưởng
              Trưởng nhóm hay trạng thái nhóm.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-6 text-xs">
        <div className="space-y-1.5">
          <label htmlFor="poll-title" className="font-bold text-foreground text-xs">
            Tiêu đề bình chọn
          </label>
          <input
            id="poll-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={createVote.isPending}
            placeholder="VD: Chọn quán ăn tối nay"
            className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="poll-reason" className="font-bold text-foreground text-xs">
            Ghi chú (không bắt buộc)
          </label>
          <textarea
            id="poll-reason"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={createVote.isPending}
            placeholder="Thêm bối cảnh giúp mọi người dễ quyết định hơn..."
            className="w-full resize-none rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="poll-closes-at" className="font-bold text-foreground text-xs">
            Thời hạn bỏ phiếu
          </label>
          <input
            id="poll-closes-at"
            type="datetime-local"
            value={closesAtLocal}
            min={defaultClosesAtLocal()}
            onChange={(e) => setClosesAtLocal(e.target.value)}
            disabled={createVote.isPending}
            className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground text-xs">Lựa chọn (tối thiểu 2)</span>
          </div>
          <div className="space-y-2">
            {optionRows.map((option, index) => (
              <div key={option.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={option.value}
                  onChange={(e) => updateOption(option.id, e.target.value)}
                  disabled={createVote.isPending}
                  placeholder={`Lựa chọn ${index + 1}`}
                  className="flex-1 rounded-xl border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
                />
                {optionRows.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(option.id)}
                    disabled={createVote.isPending}
                    className="shrink-0 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-destructive cursor-pointer disabled:opacity-50"
                    aria-label="Xoá lựa chọn"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addOption}
            disabled={createVote.isPending}
            className="flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-[11px] font-bold text-muted-foreground hover:border-primary hover:text-primary cursor-pointer disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm lựa chọn
          </button>
        </div>

        {createVote.isError && (
          <p className="text-[11px] font-semibold text-destructive">
            {createVote.error instanceof Error
              ? createVote.error.message
              : 'Không thể tạo bình chọn, vui lòng thử lại.'}
          </p>
        )}

        <div className="flex justify-end gap-2.5 border-border border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={createVote.isPending}
            className="rounded-full border border-border bg-background px-4 py-2 font-semibold text-foreground text-xs hover:bg-muted cursor-pointer transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2 font-bold text-primary-foreground text-xs hover:bg-primary-hover transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createVote.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Đang tạo...</span>
              </>
            ) : (
              <>
                <Vote className="h-3.5 w-3.5" />
                <span>Tạo bình chọn</span>
              </>
            )}
          </button>
        </div>
      </form>
    </AppModalShell>
  );
}
