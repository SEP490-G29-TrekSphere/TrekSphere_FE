import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';
import { AppModalShell } from '@/shared/ui';
import type { CustomJourneyCheckpointResponse } from '../../../types/workspace';

interface DeleteCheckpointConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkpoint: CustomJourneyCheckpointResponse | null;
  isPending: boolean;
  onConfirmDelete: (checkpointId: string) => void;
}

export function DeleteCheckpointConfirmModal({
  isOpen,
  onClose,
  checkpoint,
  isPending,
  onConfirmDelete,
}: DeleteCheckpointConfirmModalProps) {
  if (!isOpen || !checkpoint) return null;

  const checkpointId = checkpoint.customJourneyCheckpointId || checkpoint.id || '';

  function handleConfirm() {
    if (!checkpointId) return;
    onConfirmDelete(checkpointId);
  }

  return (
    <AppModalShell
      open
      onClose={onClose}
      aria-label="Xác nhận xóa điểm dừng"
      className="flex max-w-md flex-col overflow-hidden border border-border p-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <h3 className="text-base font-bold text-foreground">Xóa điểm dừng</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="space-y-3 px-5 py-4 text-xs leading-relaxed text-muted-foreground">
        <p>
          Bạn có chắc chắn muốn xóa điểm dừng{' '}
          <strong className="text-foreground">
            Chặng {checkpoint.checkpointOrder}: {checkpoint.title}
          </strong>{' '}
          khỏi hành trình của nhóm không?
        </p>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-red-600 dark:text-red-400">
          ⚠️ <strong>Lưu ý:</strong> Hành động này sẽ xóa điểm dừng này và không thể hoàn tác.
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/20 px-5 py-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-50 cursor-pointer"
        >
          Hủy bỏ
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isPending || !checkpointId}
          className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Đang xóa...</span>
            </>
          ) : (
            <>
              <Trash2 className="h-3.5 w-3.5" />
              <span>Xác nhận xóa</span>
            </>
          )}
        </button>
      </div>
    </AppModalShell>
  );
}
