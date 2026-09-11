import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { AppModalShell } from '@/shared/ui';
import type { CustomJourneyActivityResponse } from '../../../types/workspace';

interface DeleteActivityConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  activity: CustomJourneyActivityResponse | null;
  isDeleting: boolean;
}

export function DeleteActivityConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  activity,
  isDeleting,
}: DeleteActivityConfirmModalProps) {
  if (!activity) return null;

  return (
    <AppModalShell open={isOpen} onClose={onClose} aria-label="Xóa Hoạt Động" className="max-w-md">
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-foreground">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Bạn có chắc chắn muốn xóa hoạt động này?</p>
            <p className="mt-1 text-muted-foreground">
              Hoạt động <span className="font-bold text-foreground">"{activity.title}"</span> (Ngày{' '}
              {activity.dayNo}) sẽ bị xóa khỏi thời khóa biểu của nhóm.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted transition cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-destructive px-4 py-2 text-xs font-bold text-destructive-foreground hover:bg-destructive/90 transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                Xác nhận xóa
              </>
            )}
          </button>
        </div>
      </div>
    </AppModalShell>
  );
}
