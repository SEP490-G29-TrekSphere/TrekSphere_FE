import { zodResolver } from '@hookform/resolvers/zod';
import { Clock, Loader2, MapPin, Pencil } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AppModalShell } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { TIME_SLOT_OPTIONS } from '../../../constants/workspace';
import { useUpdateGroupJourneyActivity } from '../../../hooks/useGroupJourneyWorkspace';
import type {
  CustomJourneyActivityResponse,
  CustomJourneyCheckpointResponse,
} from '../../../types/workspace';
import { type ActivityFormValues, activityFormSchema } from '../../../validations/workspace.schema';

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  activity: CustomJourneyActivityResponse | null;
  checkpoints: CustomJourneyCheckpointResponse[];
  maxDays?: number;
}

export function EditActivityModal({
  isOpen,
  onClose,
  groupId,
  activity,
  checkpoints,
  maxDays = 1,
}: EditActivityModalProps) {
  const updateActivity = useUpdateGroupJourneyActivity(groupId);
  const effectiveMaxDays = Math.max(1, maxDays);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      dayNo: 1,
      timeSlot: 'MORNING',
      activityOrder: 1,
      title: '',
      description: '',
      plannedStartAt: '',
      plannedEndAt: '',
      checkpointId: '',
    },
  });

  useEffect(() => {
    if (activity && isOpen) {
      reset({
        dayNo: Math.min(Math.max(1, activity.dayNo ?? 1), effectiveMaxDays),
        timeSlot: activity.timeSlot ?? 'MORNING',
        activityOrder: activity.activityOrder ?? 1,
        title: activity.title || '',
        description: activity.description || '',
        plannedStartAt: activity.plannedStartAt || '',
        plannedEndAt: activity.plannedEndAt || '',
        checkpointId: activity.checkpointId || '',
      });
    }
  }, [activity, isOpen, effectiveMaxDays, reset]);

  if (!activity) return null;

  const activityId = activity.customJourneyActivityId || activity.id || '';

  const onSubmit = async (values: ActivityFormValues) => {
    try {
      await updateActivity.mutateAsync({
        activityId,
        payload: {
          dayNo: values.dayNo,
          timeSlot: values.timeSlot,
          activityOrder: values.activityOrder ?? 1,
          title: values.title.trim(),
          description: values.description?.trim() || null,
          plannedStartAt: values.plannedStartAt || null,
          plannedEndAt: values.plannedEndAt || null,
          checkpointId:
            values.checkpointId && values.checkpointId !== '' ? values.checkpointId : null,
        },
      });

      toast.success('Đã cập nhật hoạt động!');
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Không thể cập nhật hoạt động. Vui lòng thử lại!';
      toast.error(msg);
    }
  };

  return (
    <AppModalShell
      open={isOpen}
      onClose={onClose}
      aria-label="Chỉnh Sửa Hoạt Động Lộ Trình"
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Hàng 1: Ngày & Buổi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Ngày thứ mấy <span className="text-destructive">*</span>
            </label>
            <select
              {...register('dayNo', { valueAsNumber: true })}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
            >
              {Array.from({ length: effectiveMaxDays }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  Ngày {d}
                </option>
              ))}
            </select>
            {errors.dayNo && (
              <p className="mt-1 text-[11px] text-destructive">{errors.dayNo.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Buổi trong ngày <span className="text-destructive">*</span>
            </label>
            <select
              {...register('timeSlot')}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
            >
              {TIME_SLOT_OPTIONS.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label} ({slot.time})
                </option>
              ))}
            </select>
            {errors.timeSlot && (
              <p className="mt-1 text-[11px] text-destructive">{errors.timeSlot.message}</p>
            )}
          </div>
        </div>

        {/* Tên hoạt động */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">
            Tên hoạt động <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            {...register('title')}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
          />
          {errors.title && (
            <p className="mt-1 text-[11px] text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* Liên kết Trạm Checkpoint */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Diễn ra tại Trạm dừng chân (Tùy chọn)
            </span>
          </label>
          <select
            {...register('checkpointId')}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
          >
            <option value="">-- Không gắn trạm dừng chân cố định --</option>
            {checkpoints.map((cp) => {
              const cpId = cp.customJourneyCheckpointId || cp.id;
              return (
                <option key={cpId} value={cpId}>
                  Chặng {cp.checkpointOrder}: {cp.title}{' '}
                  {cp.locationName ? `(${cp.locationName})` : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Khung giờ dự kiến */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                Giờ bắt đầu (HH:mm)
              </span>
            </label>
            <input
              type="text"
              {...register('plannedStartAt')}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                Giờ kết thúc (HH:mm)
              </span>
            </label>
            <input
              type="text"
              {...register('plannedEndAt')}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-hidden"
            />
          </div>
        </div>

        {/* Mô tả chi tiết */}
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">
            Ghi chú / Chi tiết hoạt động
          </label>
          <textarea
            rows={3}
            {...register('description')}
            className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-hidden resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted transition cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={updateActivity.isPending}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {updateActivity.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Pencil className="h-3.5 w-3.5" />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </form>
    </AppModalShell>
  );
}
