import { EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UnpublishTourConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tourName: string;
  onConfirm: () => void;
  isPending?: boolean;
}

/** Xác nhận trước khi ngừng công khai 1 tour đang PUBLISHED, đưa về DRAFT. */
export function UnpublishTourConfirmDialog({
  open,
  onOpenChange,
  tourName,
  onConfirm,
  isPending = false,
}: UnpublishTourConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader className="items-center text-center">
          <div
            className="mb-2 flex h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(234, 88, 12, 0.1)' }}
          >
            <EyeOff className="h-5 w-5" style={{ color: '#EA580C' }} />
          </div>
          <DialogTitle className="text-xl font-bold">Ngừng công khai tour</DialogTitle>
          <DialogDescription className="text-center leading-relaxed">
            Ngừng công khai tour "{tourName}"? Tour sẽ chuyển về Bản nháp và không còn hiển thị cho
            khách hàng. Bạn có thể công khai lại bất cứ lúc nào.
          </DialogDescription>
        </DialogHeader>

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
            style={{ backgroundColor: '#EA580C' }}
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Đang xử lý...' : 'Ngừng công khai'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
