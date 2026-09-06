import { AlertTriangle, Loader2 } from 'lucide-react';
import { useId } from 'react';
import { cn } from '@/lib/utils';
import { AppModalShell } from './AppModalShell';

export interface ConfirmActionDialogProps {
  /** Mặc định `true` để giữ tương thích với cách dùng cũ (render có điều kiện ở phía cha). */
  open?: boolean;
  title: string;
  description: React.ReactNode;
  /** Nội dung phụ hiển thị dưới description, thường là tên/tiêu đề đối tượng bị tác động. */
  detail?: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Nhãn nút xác nhận khi đang chạy. Mặc định "Đang xử lý...". */
  pendingLabel?: string;
  isPending?: boolean;
  /** `destructive` dùng cho hành động không thể hoàn tác (vd: xóa vĩnh viễn). */
  variant?: 'default' | 'destructive';
  /** Icon trong ô vuông bo góc ở đầu modal. Mặc định là dấu cảnh báo. */
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal xác nhận hành động dùng chung (ẩn/hiện, xóa, duyệt, rời nhóm...).
 *
 * Đóng được bằng click ra ngoài, phím Esc hoặc nút X — trừ khi đang chạy
 * (`isPending`), lúc đó modal khoá lại để tránh huỷ giữa chừng.
 */
export function ConfirmActionDialog({
  open = true,
  title,
  description,
  detail,
  confirmLabel,
  cancelLabel = 'Hủy',
  pendingLabel = 'Đang xử lý...',
  isPending = false,
  variant = 'default',
  icon,
  onConfirm,
  onCancel,
}: ConfirmActionDialogProps) {
  const titleId = useId();
  const isDestructive = variant === 'destructive';

  return (
    <AppModalShell
      open={open}
      onClose={onCancel}
      closeOnBackdropClick={!isPending}
      closeOnEscape={!isPending}
      showCloseButton={!isPending}
      aria-labelledby={titleId}
      className="max-w-sm space-y-4"
    >
      <div
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-xl',
          isDestructive ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-primary'
        )}
      >
        {icon ?? <AlertTriangle className="h-5 w-5" />}
      </div>

      <div className="space-y-1.5">
        <h2 id={titleId} className="text-base font-bold text-foreground">
          {title}
        </h2>
        <div className="text-xs leading-relaxed text-muted-foreground">{description}</div>
        {detail && (
          <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs font-medium text-muted-foreground">
            “{detail.length > 60 ? `${detail.slice(0, 60)}...` : detail}”
          </p>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="flex-1 cursor-pointer rounded-full border border-border py-2.5 text-xs font-bold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className={cn(
            'flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-bold transition-colors disabled:opacity-50',
            isDestructive
              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
              : 'bg-primary text-primary-foreground hover:bg-primary-hover'
          )}
        >
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isPending ? pendingLabel : confirmLabel}
        </button>
      </div>
    </AppModalShell>
  );
}
