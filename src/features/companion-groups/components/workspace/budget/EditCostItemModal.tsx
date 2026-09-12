import { zodResolver } from '@hookform/resolvers/zod';
import { DollarSign, FileText, Loader2, Save, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AppModalShell } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { useUpdateGroupCostItem } from '../../../hooks/useGroupBudgetWorkspace';
import type { CustomJourneyCostItemResponse } from '../../../types/workspace';
import { CATEGORY_OPTIONS } from './AddCostItemModal';

const editCostItemSchema = z.object({
  itemName: z
    .string()
    .min(1, 'Vui lòng nhập tên khoản chi dự toán')
    .max(100, 'Tên khoản chi không được vượt quá 100 ký tự'),
  category: z.enum(['PERMIT', 'GUIDE', 'FOOD', 'TRANSPORT', 'GEAR', 'OTHER']),
  estimatedAmount: z
    .number({ message: 'Số tiền không hợp lệ' })
    .positive('Số tiền dự toán phải lớn hơn 0')
    .max(1_000_000_000, 'Số tiền không được vượt quá 1 tỷ VNĐ'),
  note: z.string().max(255, 'Ghi chú không được quá 255 ký tự').optional().nullable(),
});

type EditCostItemFormValues = z.infer<typeof editCostItemSchema>;

interface EditCostItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  costItem: CustomJourneyCostItemResponse | null;
}

export function EditCostItemModal({ isOpen, onClose, groupId, costItem }: EditCostItemModalProps) {
  const updateCostItemMutation = useUpdateGroupCostItem(groupId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditCostItemFormValues>({
    resolver: zodResolver(editCostItemSchema),
    defaultValues: {
      itemName: costItem?.itemName || '',
      category: costItem?.category || 'FOOD',
      estimatedAmount: costItem?.estimatedAmount || 0,
      note: costItem?.note || '',
    },
  });

  useEffect(() => {
    if (isOpen && costItem) {
      reset({
        itemName: costItem.itemName,
        category: costItem.category,
        estimatedAmount: costItem.estimatedAmount,
        note: costItem.note || '',
      });
    }
  }, [isOpen, costItem, reset]);

  if (!costItem) return null;

  const onSubmit = async (data: EditCostItemFormValues) => {
    try {
      await updateCostItemMutation.mutateAsync({
        costItemId: costItem.customJourneyCostItemId,
        payload: {
          itemName: data.itemName.trim(),
          category: data.category,
          estimatedAmount: Number(data.estimatedAmount),
          note: data.note?.trim() || null,
        },
      });
      toast.success('Cập nhật khoản dự toán thành công!');
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Không thể cập nhật khoản dự toán. Vui lòng thử lại!';
      toast.error(errorMsg);
    }
  };

  return (
    <AppModalShell
      open={isOpen}
      onClose={onClose}
      aria-label="Chỉnh sửa khoản dự toán chi phí"
      className="flex max-w-lg flex-col overflow-hidden border border-border p-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Save className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Chỉnh sửa khoản dự toán</h3>
            <p className="text-[11px] text-muted-foreground">
              Cập nhật lại danh mục hoặc số tiền dự toán chi phí
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={updateCostItemMutation.isPending}
          className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-5">
        {/* Item Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground">
            Tên khoản chi dự toán <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            placeholder="VD: Thuê xe 16 chỗ 2 chiều..."
            {...register('itemName')}
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
          />
          {errors.itemName && (
            <p className="text-[11px] text-destructive font-medium">{errors.itemName.message}</p>
          )}
        </div>

        {/* Category & Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Danh mục chi phí <span className="text-destructive">*</span>
            </label>
            <select
              {...register('category')}
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-hidden"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Số tiền dự tính (VNĐ) <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="1000"
                min="1000"
                placeholder="VD: 1500000"
                {...register('estimatedAmount', { valueAsNumber: true })}
                className="w-full rounded-xl border border-border bg-background pl-9 pr-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden font-bold"
              />
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {errors.estimatedAmount && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.estimatedAmount.message}
              </p>
            )}
          </div>
        </div>

        {/* Note */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" /> Ghi chú thêm
          </label>
          <textarea
            rows={2}
            placeholder="VD: Đã bao gồm tiền tip tài xế..."
            {...register('note')}
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={updateCostItemMutation.isPending}
            className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={updateCostItemMutation.isPending}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition cursor-pointer disabled:opacity-50"
          >
            {updateCostItemMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </form>
    </AppModalShell>
  );
}
