import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AppImageUploadField, AppModalShell, useImageUploadCleanup } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import {
  CHECKPOINT_DESCRIPTION_MAX_LENGTH,
  CHECKPOINT_LOCATION_MAX_LENGTH,
  CHECKPOINT_TITLE_MAX_LENGTH,
} from '../../../constants/workspace';
import { useCreateGroupCheckpoint, useGroupJourney } from '../../../hooks/useGroupJourneyWorkspace';
import { toCheckpointDateTime } from '../../../utils/checkpointTime';
import {
  type CheckpointFormValues,
  checkpointFormSchema,
} from '../../../validations/workspace.schema';

interface AddCheckpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  suggestedDayNo?: number;
  nextOrder: number;
}

export function AddCheckpointModal({
  isOpen,
  onClose,
  groupId,
  suggestedDayNo = 1,
  nextOrder,
}: AddCheckpointModalProps) {
  const createCheckpoint = useCreateGroupCheckpoint(groupId);
  // Cần ngày bắt đầu hành trình để ghép với giờ nhập trong form thành LocalDateTime
  const { data: journey } = useGroupJourney(groupId);
  const imageCleanup = useImageUploadCleanup();
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckpointFormValues>({
    resolver: zodResolver(checkpointFormSchema),
    defaultValues: {
      dayNo: suggestedDayNo,
      checkpointOrder: nextOrder,
      title: '',
      locationName: '',
      description: '',
      latitude: null,
      longitude: null,
      plannedStartAt: '',
      plannedEndAt: '',
      imageUrl: '',
    },
  });

  const imageUrl = watch('imageUrl');

  function handleClose() {
    // Nếu có ảnh vừa upload lên mà người dùng hủy/đóng modal -> gọi API xóa ảnh dọn rác
    imageCleanup.discard();
    reset();
    onClose();
  }

  if (!isOpen) return null;

  function handleFormSubmit(values: CheckpointFormValues) {
    createCheckpoint.mutate(
      {
        dayNo: values.dayNo ? Number(values.dayNo) : null,
        checkpointOrder: Number(values.checkpointOrder),
        title: values.title.trim(),
        locationName: values.locationName?.trim() || null,
        description: values.description?.trim() || null,
        latitude:
          values.latitude !== null &&
          values.latitude !== undefined &&
          !Number.isNaN(values.latitude)
            ? Number(values.latitude)
            : null,
        longitude:
          values.longitude !== null &&
          values.longitude !== undefined &&
          !Number.isNaN(values.longitude)
            ? Number(values.longitude)
            : null,
        plannedStartAt: toCheckpointDateTime(
          journey?.startDate,
          values.dayNo,
          values.plannedStartAt
        ),
        plannedEndAt: toCheckpointDateTime(journey?.startDate, values.dayNo, values.plannedEndAt),
        imageUrl: values.imageUrl?.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success('Đã thêm điểm dừng mới vào hành trình!');
          imageCleanup.commit(); // Đã lưu thành công, không xóa ảnh
          reset();
          onClose();
        },
        onError: (err: any) => {
          toast.error(err?.message || 'Không thể thêm điểm dừng. Vui lòng kiểm tra lại thông tin!');
        },
      }
    );
  }

  return (
    <AppModalShell
      open
      onClose={handleClose}
      aria-label="Thêm điểm dừng mới"
      className="flex max-w-lg flex-col overflow-hidden border border-border p-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Plus className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Thêm điểm dừng mới</h3>
            <p className="text-[11px] text-muted-foreground">
              Thêm hoạt động hoặc mốc dừng chân cho hành trình nhóm
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          disabled={createCheckpoint.isPending}
          className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col">
        <div className="max-h-[70vh] space-y-3.5 overflow-y-auto px-5 py-4 text-xs">
          {/* Row: Ngày & Thứ tự */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-foreground">
                Ngày số (Day No) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                {...register('dayNo', { valueAsNumber: true })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="VD: 1"
              />
              {errors.dayNo && <p className="text-[10px] text-red-500">{errors.dayNo.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">
                Thứ tự chặng (Order) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                {...register('checkpointOrder', { valueAsNumber: true })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="VD: 1"
              />
              {errors.checkpointOrder && (
                <p className="text-[10px] text-red-500">{errors.checkpointOrder.message}</p>
              )}
            </div>
          </div>

          {/* Tên điểm dừng */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">
              Tên điểm dừng / Hoạt động <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              maxLength={CHECKPOINT_TITLE_MAX_LENGTH}
              {...register('title')}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="VD: Trạm dừng chân chân núi Fansipan"
            />
            {errors.title && <p className="text-[10px] text-red-500">{errors.title.message}</p>}
          </div>

          {/* Địa điểm */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">Địa danh / Vị trí</label>
            <input
              type="text"
              maxLength={CHECKPOINT_LOCATION_MAX_LENGTH}
              {...register('locationName')}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="VD: Cổng vườn Quốc Gia Hoàng Liên"
            />
            {errors.locationName && (
              <p className="text-[10px] text-red-500">{errors.locationName.message}</p>
            )}
          </div>

          {/* Row: Giờ bắt đầu & Giờ kết thúc */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-foreground">Bắt đầu dự kiến</label>
              <input
                type="time"
                {...register('plannedStartAt')}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">Kết thúc dự kiến</label>
              <input
                type="time"
                {...register('plannedEndAt')}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Row: Tọa độ Latitude / Longitude */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-foreground">Vĩ độ (Latitude)</label>
              <input
                type="number"
                step="any"
                {...register('latitude', { valueAsNumber: true })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="VD: 22.3031"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">Kinh độ (Longitude)</label>
              <input
                type="number"
                step="any"
                {...register('longitude', { valueAsNumber: true })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="VD: 103.7752"
              />
            </div>
          </div>

          {/* Ảnh minh họa điểm dừng (Upload từ máy hoặc Nhập URL) */}
          <AppImageUploadField
            label="Ảnh minh họa điểm dừng (Tùy chọn)"
            value={imageUrl}
            onChange={(url) => setValue('imageUrl', url, { shouldValidate: true })}
            folder="checkpoints"
            cleanup={imageCleanup}
            onUploadingChange={setIsUploadingImage}
            disabled={createCheckpoint.isPending}
            errorMessage={errors.imageUrl?.message}
          />

          {/* Mô tả hoạt động */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">Mô tả chi tiết hoạt động</label>
            <textarea
              rows={3}
              maxLength={CHECKPOINT_DESCRIPTION_MAX_LENGTH}
              {...register('description')}
              className="w-full resize-none rounded-xl border border-border bg-background p-3 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Tập trung tại cổng, kiểm tra tư trang y tế và xuất phát trekking..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/20 px-5 py-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploadingImage || createCheckpoint.isPending}
            className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-50 cursor-pointer"
          >
            Hủy
          </button>

          <button
            type="submit"
            disabled={isUploadingImage || createCheckpoint.isPending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
          >
            {isUploadingImage || createCheckpoint.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>{isUploadingImage ? 'Đang tải ảnh...' : 'Đang lưu...'}</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>Thêm điểm dừng</span>
              </>
            )}
          </button>
        </div>
      </form>
    </AppModalShell>
  );
}
