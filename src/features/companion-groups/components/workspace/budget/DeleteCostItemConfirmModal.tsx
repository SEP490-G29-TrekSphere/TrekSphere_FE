import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';
import { AppModalShell } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { useDeleteGroupCostItem } from '../../../hooks/useGroupBudgetWorkspace';
import type { CustomJourneyCostItemResponse } from '../../../types/workspace';

interface DeleteCostItemConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  costItem: CustomJourneyCostItemResponse | null;
}

export function DeleteCostItemConfirmModal({
  isOpen,
  onClose,
  groupId,
  costItem,
}: DeleteCostItemConfirmModalProps) {
  const deleteCostItemMutation = useDeleteGroupCostItem(groupId);

  if (!costItem) return null;

  const handleConfirm = async () => {
    try {
      await deleteCostItemMutation.mutateAsync(costItem.customJourneyCostItemId);
      toast.success('Đã xoá khoản dự toán thành công!');
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Không thể xoá khoản dự toán. Vui lòng thử lại!';
      toast.error(errorMsg);
    }
  };

  return (
    <AppModalShell
      open={isOpen}
      onClose={onClose}
      aria-label="Xác nhận xoá khoản dự toán"
      className="flex max-w-md flex-col overflow-hidden border border-border p-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Xoá khoản dự toán</h3>
            <p className="text-[11px] text-muted-foreground">
              Khoản chi sẽ bị xoá khỏi danh mục dự toán
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={deleteCostItemMutation.isPending}
          className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-xs text-foreground">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-destructive">
              Bạn có chắc chắn muốn xoá khoản dự toán &quot;{costItem.itemName}&quot;?
            </p>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Số tiền{' '}
              <span className="font-bold text-foreground">
                {costItem.estimatedAmount.toLocaleString('vi-VN')} đ
              </span>{' '}
              sẽ được trừ khỏi tổng dự toán và mức chi phí ước tính trên mỗi thành viên.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteCostItemMutation.isPending}
            className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleteCostItemMutation.isPending}
            className="flex items-center gap-2 rounded-xl bg-destructive px-5 py-2.5 text-xs font-bold text-destructive-foreground shadow-xs hover:bg-destructive/90 transition cursor-pointer disabled:opacity-50"
          >
            {deleteCostItemMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Đang xử lý...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" /> Xác nhận xoá
              </>
            )}
          </button>
        </div>
      </div>
    </AppModalShell>
  );
}
