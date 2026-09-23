import { Loader2, Trash2 } from 'lucide-react';
import { useClickOutside } from '@/shared/hooks';
import type { GroupChecklistItemResponse } from '../../../types/workspace';

interface ChecklistDeleteConfirmModalProps {
  deleteTarget: GroupChecklistItemResponse | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ChecklistDeleteConfirmModal({
  deleteTarget,
  isPending,
  onClose,
  onConfirm,
}: ChecklistDeleteConfirmModalProps) {
  const modalRef = useClickOutside<HTMLDivElement>(() => {
    if (!isPending) {
      onClose();
    }
  }, Boolean(deleteTarget));

  if (!deleteTarget) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        ref={modalRef}
        className="w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-xl space-y-4 animate-in fade-in zoom-in duration-200"
      >
        <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-destructive" />
          Xóa Mục Đồ Dùng
        </h3>
        <p className="text-xs text-muted-foreground">
          Bạn có chắc chắn muốn xóa "
          <span className="font-bold text-foreground">
            {deleteTarget.title || deleteTarget.itemName}
          </span>
          " khỏi checklist của nhóm?
        </p>
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-xl bg-destructive px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-destructive/90 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Xóa vĩnh viễn
          </button>
        </div>
      </div>
    </div>
  );
}
