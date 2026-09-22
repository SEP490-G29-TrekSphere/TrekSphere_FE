import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/utils/format';

interface DeleteScheduleConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departureDate: string;
  onConfirm: () => void;
  isPending?: boolean;
}

export function DeleteScheduleConfirmDialog({
  open,
  onOpenChange,
  departureDate,
  onConfirm,
  isPending = false,
}: DeleteScheduleConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <Trash2 className="h-5 w-5 text-destructive" />
          </div>
          <DialogTitle className="text-xl font-bold">Xóa lịch trình</DialogTitle>
          <DialogDescription className="text-center leading-relaxed">
            Bạn có chắc chắn muốn xóa lịch trình khởi hành ngày{' '}
            {departureDate ? formatDate(departureDate) : ''} không? Hành động này không thể hoàn
            tác.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="!mt-2">
          <Button
            variant="outline"
            className="flex-1 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
          <Button
            variant="destructive"
            className="flex-1 rounded-full"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Đang xóa...' : 'Xóa lịch trình'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
