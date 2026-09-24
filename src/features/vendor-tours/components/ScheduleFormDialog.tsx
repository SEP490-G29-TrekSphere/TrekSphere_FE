import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { parseIsoDate, toIsoDate } from '@/lib';
import { AppDatePicker } from '@/shared/ui';
import { SCHEDULE_STATUS_OPTIONS } from '../constants';
import type { ApiScheduleStatus, CreateSchedulePayload, UpdateSchedulePayload } from '../types';
import {
  type ScheduleFormInput,
  type ScheduleFormValues,
  scheduleFormSchema,
} from '../validations';

function todayIso(): string {
  return toIsoDate(new Date());
}

export function getLatestReturnDate(departureDate: string, durationDays: number): Date | null {
  const departure = parseIsoDate(departureDate);
  if (!departure || !Number.isInteger(durationDays) || durationDays < 1) return null;

  const latestReturnDate = new Date(departure);
  latestReturnDate.setDate(latestReturnDate.getDate() + durationDays - 1);
  return latestReturnDate;
}

export interface ScheduleFormDefaultValues {
  departureDate: string;
  returnDate: string;
  status: ApiScheduleStatus;
}

const EMPTY_DEFAULTS: ScheduleFormInput = {
  departureDate: '',
  returnDate: '',
  status: 'OPEN',
  reason: '',
};

export interface ScheduleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';

  defaultValues?: Partial<ScheduleFormDefaultValues>;

  durationDays: number;
  isPending?: boolean;
  onSubmit: (payload: CreateSchedulePayload | UpdateSchedulePayload) => void;
}

export function ScheduleFormDialog({
  open,
  onOpenChange,
  mode,
  defaultValues,
  durationDays,
  isPending = false,
  onSubmit: onSubmitProp,
}: ScheduleFormDialogProps) {
  const isEdit = mode === 'edit';

  const {
    register,
    control,
    watch,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ScheduleFormInput, unknown, ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: { ...EMPTY_DEFAULTS, ...defaultValues },
  });

  const departureDate = watch('departureDate');
  const selectedStatus = watch('status');
  const latestReturnDate = getLatestReturnDate(departureDate, durationDays);
  const requiresReason = isEdit && selectedStatus === 'CANCELLED';

  // biome-ignore lint/correctness/useExhaustiveDependencies: rule suppressed for specific design requirements
  useEffect(() => {
    if (open) reset({ ...EMPTY_DEFAULTS, ...defaultValues });
  }, [open]);

  const submit = handleSubmit((values) => {
    if (!isEdit && values.departureDate < todayIso()) {
      setError('departureDate', { message: 'Ngày khởi hành không được ở trong quá khứ' });
      return;
    }

    if (latestReturnDate && values.returnDate > toIsoDate(latestReturnDate)) {
      setError('returnDate', {
        message: `Lịch trình vượt quá ${durationDays} ngày đã thiết lập cho tour.`,
      });
      return;
    }

    if (requiresReason && !values.reason?.trim()) {
      setError('reason', { message: 'Vui lòng nhập lý do hủy' });
      return;
    }

    if (isEdit) {
      const payload: UpdateSchedulePayload = {
        departureDate: values.departureDate,
        returnDate: values.returnDate,
        status: values.status,
        ...(requiresReason ? { reason: values.reason } : {}),
      };
      onSubmitProp(payload);
    } else {
      const payload: CreateSchedulePayload = {
        departureDate: values.departureDate,
        returnDate: values.returnDate,
      };
      onSubmitProp(payload);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[85vh] overflow-y-auto" initialFocus={false}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEdit ? 'Sửa lịch khởi hành' : 'Tạo lịch khởi hành mới'}
          </DialogTitle>
          <DialogDescription>
            {requiresReason
              ? 'Hủy lịch khởi hành này — vui lòng nhập lý do, hệ thống sẽ tự động gửi thông báo tới các nhóm ghép đang nhắm vào ngày này.'
              : isEdit
                ? 'Điều chỉnh ngày đi, ngày về hoặc trạng thái của lịch khởi hành này.'
                : 'Thiết lập ngày đi và ngày về cho lịch khởi hành mới.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="departureDate"
                className="mb-1.5 block text-sm font-semibold text-foreground"
              >
                Ngày khởi hành <span className="text-destructive">*</span>
              </label>
              <Controller
                name="departureDate"
                control={control}
                render={({ field }) => (
                  <AppDatePicker
                    id="departureDate"
                    selected={parseIsoDate(field.value)}
                    onChange={(date: Date | null) => field.onChange(toIsoDate(date))}
                    onBlur={field.onBlur}
                    minDate={isEdit ? undefined : new Date()}
                    className="w-full cursor-pointer rounded-xl bg-muted/50 px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholderText="Chọn ngày khởi hành"
                  />
                )}
              />
              {errors.departureDate && (
                <p className="mt-1 text-xs text-destructive">{errors.departureDate.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="returnDate"
                className="mb-1.5 block text-sm font-semibold text-foreground"
              >
                Ngày kết thúc <span className="text-destructive">*</span>
              </label>
              <Controller
                name="returnDate"
                control={control}
                render={({ field }) => (
                  <AppDatePicker
                    id="returnDate"
                    selected={parseIsoDate(field.value)}
                    onChange={(date: Date | null) => {
                      field.onChange(toIsoDate(date));
                      if (date && latestReturnDate && date > latestReturnDate) {
                        setError('returnDate', {
                          message: `Lịch trình vượt quá ${durationDays} ngày đã thiết lập cho tour.`,
                        });
                      } else {
                        clearErrors('returnDate');
                      }
                    }}
                    onBlur={field.onBlur}
                    minDate={parseIsoDate(departureDate) ?? undefined}
                    className="w-full cursor-pointer rounded-xl bg-muted/50 px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholderText="Chọn ngày kết thúc"
                  />
                )}
              />
              {errors.returnDate && (
                <p className="mt-1 text-xs text-destructive">{errors.returnDate.message}</p>
              )}
            </div>
          </div>

          {isEdit && (
            <div>
              <label
                htmlFor="status"
                className="mb-1.5 block text-sm font-semibold text-foreground"
              >
                Trạng thái
              </label>
              <select
                id="status"
                {...register('status')}
                className="w-full rounded-xl bg-muted/50 px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {SCHEDULE_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {requiresReason && (
            <div>
              <label
                htmlFor="reason"
                className="mb-1.5 block text-sm font-semibold text-foreground"
              >
                Lý do hủy <span className="text-destructive">*</span>
              </label>
              <textarea
                id="reason"
                {...register('reason')}
                rows={3}
                placeholder="Vd: Hủy lịch do dự báo thời tiết nguy hiểm..."
                className="w-full resize-none rounded-2xl bg-muted/50 px-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {errors.reason && (
                <p className="mt-1 text-xs text-destructive">{errors.reason.message}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="!mt-2">
          <Button
            variant="outline"
            className="flex-1 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary-hover"
            onClick={submit}
            disabled={isPending}
          >
            {isPending ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo lịch'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
