import { AlertCircle, Loader2, LogOut, X } from 'lucide-react';
import { AppModalShell } from '@/shared/ui';

interface WithdrawRequestConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  isPending: boolean;
  onConfirm: () => void;
}

export function WithdrawRequestConfirmModal({
  isOpen,
  onClose,
  groupName,
  isPending,
  onConfirm,
}: WithdrawRequestConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AppModalShell
      open
      onClose={onClose}
      aria-label="Xác nhận rút đơn tham gia"
      className="flex max-w-md flex-col overflow-hidden border border-border p-0"
    >
      <button
        type="button"
        onClick={onClose}
        disabled={isPending}
        className="absolute top-4 right-4 z-10 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer disabled:opacity-50"
        aria-label="Đóng"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="border-border border-b bg-amber-500/5 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
            <LogOut className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-base">Rút Yêu Cầu Tham Gia</h2>
            <p className="text-muted-foreground text-xs">
              Hủy đơn xin gia nhập nhóm ghép đang chờ duyệt
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-6 text-xs">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="font-medium text-foreground leading-relaxed">
              Bạn có chắc chắn muốn rút đơn xin gia nhập nhóm <strong>{groupName}</strong>?
            </p>
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed">
          Sau khi rút đơn, yêu cầu của bạn sẽ được chuyển sang trạng thái "Đã rút đơn". Bạn vẫn có
          thể nộp lại đơn bất kỳ lúc nào nếu nhóm vẫn còn nhận thêm thành viên.
        </p>
      </div>

      <div className="flex justify-end gap-2.5 border-border border-t bg-muted/10 px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="rounded-full border border-border bg-background px-4 py-2 font-semibold text-foreground text-xs hover:bg-muted cursor-pointer disabled:opacity-50"
        >
          Giữ lại đơn
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isPending}
          className="flex items-center justify-center gap-1.5 rounded-full bg-amber-600 px-5 py-2 font-bold text-white text-xs hover:bg-amber-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Đang rút đơn...</span>
            </>
          ) : (
            <>
              <LogOut className="h-3.5 w-3.5" />
              <span>Xác nhận rút đơn</span>
            </>
          )}
        </button>
      </div>
    </AppModalShell>
  );
}
