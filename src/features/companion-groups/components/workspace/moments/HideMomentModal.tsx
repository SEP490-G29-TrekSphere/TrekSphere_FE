import { useState } from 'react';
import { AppButton, AppModalShell } from '@/shared/ui';
import { toast } from '@/store/useToastStore';

interface HideMomentModalProps {
  open: boolean;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

/** Trưởng nhóm nhập lý do trước khi ẩn một khoảnh khắc vi phạm khỏi bảng tin nhóm. */
export function HideMomentModal({ open, isPending, onClose, onConfirm }: HideMomentModalProps) {
  const [reason, setReason] = useState('');

  const handleClose = () => {
    setReason('');
    onClose();
  };

  const handleConfirm = () => {
    if (!reason.trim()) {
      toast.error('Vui lòng nhập lý do ẩn bài viết vi phạm!');
      return;
    }
    onConfirm(reason.trim());
    setReason('');
  };

  return (
    <AppModalShell
      open={open}
      onClose={handleClose}
      className="max-w-lg"
      aria-label="Kiểm duyệt ẩn khoảnh khắc vi phạm"
    >
      <div className="space-y-4">
        <div>
          <h3 className="font-extrabold text-base text-foreground">
            Kiểm duyệt ẩn khoảnh khắc vi phạm
          </h3>
          <p className="mt-0.5 text-muted-foreground text-xs">
            Nhập lý do ẩn khoảnh khắc này khỏi bảng tin nhóm. Bài viết sẽ chỉ còn hiển thị với
            Trưởng nhóm và tác giả.
          </p>
        </div>

        <label className="block">
          <span className="mb-1 block font-bold text-foreground text-xs">
            Lý do ẩn bài viết <span className="text-destructive">*</span>
          </span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="VD: Hình ảnh không đúng chủ đề dã ngoại, nội dung phản cảm hoặc vi phạm quy định..."
            rows={3}
            className="w-full rounded-xl border border-input bg-background p-3 text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <div className="flex items-center justify-end gap-2 border-border border-t pt-3">
          <AppButton type="button" variant="outline" onClick={handleClose} disabled={isPending}>
            Hủy
          </AppButton>
          <AppButton
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? 'Đang xử lý...' : 'Xác nhận ẩn'}
          </AppButton>
        </div>
      </div>
    </AppModalShell>
  );
}
