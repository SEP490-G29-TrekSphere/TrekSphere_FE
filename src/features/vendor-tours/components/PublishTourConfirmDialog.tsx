import { AlertTriangle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PublishTourConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tourName: string;
  onConfirm: () => void;
  isPending?: boolean;
  /**
   * Lỗi từ BE khi tour chưa đủ điều kiện công khai (VD `TOUR_PUBLISH_REQUIREMENTS_NOT_MET`) —
   * hiện rõ trong dialog thay vì chỉ có toast chung chung, để Vendor biết chính xác cần bổ sung gì.
   */
  errorMessage?: string | null;
}

/** Xác nhận trước khi công khai 1 tour đang DRAFT. */
export function PublishTourConfirmDialog({
  open,
  onOpenChange,
  tourName,
  onConfirm,
  isPending = false,
  errorMessage,
}: PublishTourConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader className="items-center text-center">
          <div
            className="mb-2 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(22, 163, 74, 0.1)' }}
          >
            <Send className="h-5 w-5" style={{ color: '#16A34A' }} />
          </div>
          <DialogTitle className="text-xl font-bold">Công khai tour</DialogTitle>
          <DialogDescription className="text-center leading-relaxed">
            Công khai tour "{tourName}"? Tour cần có đủ thông tin, ảnh bìa, ít nhất 2 điểm dừng và
            ít nhất 1 lịch khởi hành còn mở trong tương lai.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="flex items-start gap-2.5 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <DialogFooter className="!mt-2">
          <Button
            variant="outline"
            className="flex-1 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            className="flex-1 rounded-full text-white"
            style={{ backgroundColor: '#16A34A' }}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Đang công khai...' : 'Công khai tour'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
