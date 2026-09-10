import { zodResolver } from '@hookform/resolvers/zod';
import { ImagePlus, Loader2, Pencil, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { profileService } from '@/features/profile/services/profileService';
import { AppModalShell } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import {
  CHECKPOINT_DESCRIPTION_MAX_LENGTH,
  CHECKPOINT_LOCATION_MAX_LENGTH,
  CHECKPOINT_TITLE_MAX_LENGTH,
} from '../../../constants/workspace';
import { useUpdateGroupCheckpoint } from '../../../hooks/useGroupJourneyWorkspace';
import type { CustomJourneyCheckpointResponse } from '../../../types/workspace';
import {
  type CheckpointFormValues,
  checkpointFormSchema,
} from '../../../validations/workspace.schema';

interface EditCheckpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  checkpoint: CustomJourneyCheckpointResponse | null;
}

export function EditCheckpointModal({
  isOpen,
  onClose,
  groupId,
  checkpoint,
}: EditCheckpointModalProps) {
  const updateCheckpoint = useUpdateGroupCheckpoint(groupId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newlyUploadedUrlRef = useRef<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const checkpointId = checkpoint?.customJourneyCheckpointId || checkpoint?.id || '';

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
      dayNo: checkpoint?.dayNo ?? 1,
      checkpointOrder: checkpoint?.checkpointOrder ?? 1,
      title: checkpoint?.title ?? '',
      locationName: checkpoint?.locationName ?? '',
      description: checkpoint?.description ?? '',
      latitude: checkpoint?.latitude ?? null,
      longitude: checkpoint?.longitude ?? null,
      plannedStartAt: checkpoint?.plannedStartAt ?? '',
      plannedEndAt: checkpoint?.plannedEndAt ?? '',
      imageUrl: checkpoint?.imageUrl ?? '',
    },
  });

  const imageUrl = watch('imageUrl');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 5MB.');
      return;
    }

    setIsUploadingImage(true);
    try {
      const res = await profileService.uploadFile(file, 'checkpoints');
      if (res.data) {
        // Nếu trước đó trong phiên sửa này đã upload 1 ảnh mới khác, xóa ảnh mới đó đi
        if (newlyUploadedUrlRef.current && newlyUploadedUrlRef.current !== res.data) {
          profileService.deleteFile(newlyUploadedUrlRef.current).catch(() => {});
        }
        newlyUploadedUrlRef.current = res.data;
        setValue('imageUrl', res.data, { shouldValidate: true });
        toast.success('Đã tải ảnh lên thành công!');
      } else {
        toast.error(res.error || 'Không thể tải ảnh lên. Vui lòng thử lại!');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi xảy ra khi tải ảnh lên.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    // Nếu ảnh vừa bị xóa là ảnh mới tải lên trong phiên sửa này -> xóa khỏi Cloudinary
    if (newlyUploadedUrlRef.current) {
      profileService.deleteFile(newlyUploadedUrlRef.current).catch(() => {});
      newlyUploadedUrlRef.current = null;
    }
    setValue('imageUrl', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  function handleClose() {
    // Nếu có ảnh mới upload mà bấm hủy -> dọn rác Cloudinary
    if (newlyUploadedUrlRef.current) {
      profileService.deleteFile(newlyUploadedUrlRef.current).catch(() => {});
      newlyUploadedUrlRef.current = null;
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (checkpoint) {
      reset({
        dayNo: checkpoint.dayNo ?? 1,
        checkpointOrder: checkpoint.checkpointOrder ?? 1,
        title: checkpoint.title ?? '',
        locationName: checkpoint.locationName ?? '',
        description: checkpoint.description ?? '',
        latitude: checkpoint.latitude ?? null,
        longitude: checkpoint.longitude ?? null,
        plannedStartAt: checkpoint.plannedStartAt ?? '',
        plannedEndAt: checkpoint.plannedEndAt ?? '',
        imageUrl: checkpoint.imageUrl ?? '',
      });
    } else {
      reset();
    }
    onClose();
  }

  useEffect(() => {
    if (checkpoint) {
      newlyUploadedUrlRef.current = null;
      if (fileInputRef.current) fileInputRef.current.value = '';
      reset({
        dayNo: checkpoint.dayNo ?? 1,
        checkpointOrder: checkpoint.checkpointOrder ?? 1,
        title: checkpoint.title ?? '',
        locationName: checkpoint.locationName ?? '',
        description: checkpoint.description ?? '',
        latitude: checkpoint.latitude ?? null,
        longitude: checkpoint.longitude ?? null,
        plannedStartAt: checkpoint.plannedStartAt ?? '',
        plannedEndAt: checkpoint.plannedEndAt ?? '',
        imageUrl: checkpoint.imageUrl ?? '',
      });
    }
  }, [checkpoint, reset]);

  if (!isOpen || !checkpoint) return null;

  function handleFormSubmit(values: CheckpointFormValues) {
    if (!checkpointId) return;

    updateCheckpoint.mutate(
      {
        checkpointId,
        payload: {
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
          plannedStartAt: values.plannedStartAt?.trim() || null,
          plannedEndAt: values.plannedEndAt?.trim() || null,
          imageUrl: values.imageUrl?.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast.success('Cập nhật điểm dừng thành công!');
          newlyUploadedUrlRef.current = null; // Đã lưu thành công
          handleClose();
        },
        onError: (err: any) => {
          toast.error(err?.message || 'Không thể cập nhật điểm dừng. Vui lòng thử lại!');
        },
      }
    );
  }

  return (
    <AppModalShell
      open
      onClose={handleClose}
      aria-label="Chỉnh sửa điểm dừng"
      className="flex max-w-lg flex-col overflow-hidden border border-border p-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Pencil className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Chỉnh sửa điểm dừng</h3>
            <p className="text-[11px] text-muted-foreground">
              Chặng {checkpoint.checkpointOrder}: {checkpoint.title}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={updateCheckpoint.isPending}
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
                type="text"
                {...register('plannedStartAt')}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="VD: 08:00"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">Kết thúc dự kiến</label>
              <input
                type="text"
                {...register('plannedEndAt')}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="VD: 11:30"
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
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">Kinh độ (Longitude)</label>
              <input
                type="number"
                step="any"
                {...register('longitude', { valueAsNumber: true })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Ảnh minh họa điểm dừng (Upload từ máy hoặc Nhập URL) */}
          <div className="space-y-1.5">
            <label className="font-bold text-foreground">Ảnh minh họa điểm dừng (Tùy chọn)</label>

            {imageUrl ? (
              <div className="relative overflow-hidden rounded-xl border border-border bg-muted/30">
                <img src={imageUrl} alt="Ảnh điểm dừng" className="h-36 w-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute right-2 top-2 rounded-lg bg-black/60 p-1 text-white backdrop-blur-xs transition hover:bg-black/80 cursor-pointer"
                  title="Gỡ ảnh"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary hover:bg-primary/5 cursor-pointer"
                  >
                    <ImagePlus className="h-3.5 w-3.5 text-primary" />
                    <span>Tải ảnh từ máy</span>
                  </button>
                  <span className="text-[11px] text-muted-foreground">hoặc dán đường dẫn URL:</span>
                </div>

                <input
                  type="text"
                  {...register('imageUrl')}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            )}
            {errors.imageUrl && (
              <p className="text-[10px] text-red-500">{errors.imageUrl.message}</p>
            )}
          </div>

          {/* Mô tả hoạt động */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">Mô tả chi tiết hoạt động</label>
            <textarea
              rows={3}
              maxLength={CHECKPOINT_DESCRIPTION_MAX_LENGTH}
              {...register('description')}
              className="w-full resize-none rounded-xl border border-border bg-background p-3 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/20 px-5 py-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploadingImage || updateCheckpoint.isPending}
            className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-50 cursor-pointer"
          >
            Hủy
          </button>

          <button
            type="submit"
            disabled={isUploadingImage || updateCheckpoint.isPending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
          >
            {isUploadingImage || updateCheckpoint.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>{isUploadingImage ? 'Đang tải ảnh...' : 'Đang lưu...'}</span>
              </>
            ) : (
              <>
                <Pencil className="h-3.5 w-3.5" />
                <span>Lưu thay đổi</span>
              </>
            )}
          </button>
        </div>
      </form>
    </AppModalShell>
  );
}
