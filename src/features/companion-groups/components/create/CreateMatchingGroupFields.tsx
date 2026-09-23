import {
  AlignLeft,
  Calendar,
  Clock,
  Compass,
  Flag,
  Gauge,
  ImageIcon,
  Info,
  Tag,
  Users,
} from 'lucide-react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { AppDatePicker, AppImageUploadField, type ImageUploadCleanup } from '@/shared/ui';
import {
  JOURNEY_DIFFICULTY_OPTIONS,
  MATCHING_GROUP_DESCRIPTION_MAX_LENGTH,
  MATCHING_GROUP_MAX_SIZE,
  MATCHING_GROUP_MIN_SIZE,
} from '../../constants';
import type {
  CreateMatchingGroupFormInput,
  CreateMatchingGroupFormValues,
} from '../../validations';
import { type TourOption, TourSelectionField } from './TourSelectionField';

interface CreateMatchingGroupFieldsProps {
  form: UseFormReturn<CreateMatchingGroupFormInput, undefined, CreateMatchingGroupFormValues>;
  tours: TourOption[];
  isToursLoading: boolean;
  isPending: boolean;
  cleanup: ImageUploadCleanup;
  onUploadingChange?: (isUploading: boolean) => void;
}

interface FieldErrorProps {
  message?: string;
}

function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1.5 text-destructive text-xs">
      <Info className="h-3.5 w-3.5" />
      {message}
    </p>
  );
}

function toLocalDateValue(date: Date, includeTime = false) {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1_000);
  return includeTime ? localDate.toISOString().slice(0, 16) : localDate.toISOString().split('T')[0];
}

export function CreateMatchingGroupFields({
  form,
  tours,
  isToursLoading,
  isPending,
  cleanup,
  onUploadingChange,
}: CreateMatchingGroupFieldsProps) {
  const description = form.watch('description') ?? '';
  const sourceType = form.watch('sourceType') ?? 'CUSTOM_JOURNEY';
  const selectedTourId = form.watch('tourId');
  const selectedTour = tours.find((t) => t.id === selectedTourId);

  function handleTourSelection(tourId: string) {
    form.setValue('tourId', tourId, { shouldValidate: true });
    const pickedTour = tours.find((t) => t.id === tourId);
    if (pickedTour) {
      const currentName = form.getValues('groupName');
      if (!currentName || currentName.startsWith('Nhóm ghép:')) {
        form.setValue('groupName', `Nhóm ghép: ${pickedTour.name}`, {
          shouldValidate: true,
        });
      }
      const maxCap = pickedTour.maxCapacity ?? MATCHING_GROUP_MAX_SIZE;
      const currentSize = Number(form.getValues('maxSize')) || 0;
      if (currentSize < MATCHING_GROUP_MIN_SIZE) {
        form.setValue('maxSize', MATCHING_GROUP_MIN_SIZE, { shouldValidate: true });
      } else if (currentSize > maxCap) {
        form.setValue('maxSize', maxCap, { shouldValidate: true });
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Source Type Selector */}
      <div className="space-y-2">
        <label className="font-semibold text-foreground text-sm">Hình thức chuyến đi</label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => form.setValue('sourceType', 'CUSTOM_JOURNEY', { shouldValidate: true })}
            disabled={isPending}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
              sourceType === 'CUSTOM_JOURNEY'
                ? 'bg-background text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Compass className="h-4 w-4 text-emerald-600" />
            Hành trình tự túc
          </button>
          <button
            type="button"
            onClick={() => form.setValue('sourceType', 'TOUR', { shouldValidate: true })}
            disabled={isPending}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
              sourceType === 'TOUR'
                ? 'bg-background text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Flag className="h-4 w-4 text-primary" />
            Theo Tour có sẵn
          </button>
        </div>
      </div>

      {/* Tour Dropdown & Live Preview (Only when TOUR mode selected) */}
      {sourceType === 'TOUR' && (
        <TourSelectionField
          form={form}
          tours={tours}
          isToursLoading={isToursLoading}
          isPending={isPending}
          onTourSelected={handleTourSelection}
        />
      )}

      {/* Group Name */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 font-semibold text-foreground text-sm">
          <Tag className="h-4 w-4 text-muted-foreground" />
          Tên nhóm <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          {...form.register('groupName')}
          disabled={isPending}
          placeholder={
            sourceType === 'CUSTOM_JOURNEY'
              ? 'Ví dụ: Săn mây Tà Xùa cuối tuần'
              : 'Ví dụ: Nhóm Fansipan tháng 8'
          }
          className="h-11 w-full rounded-lg border border-input bg-background px-4 font-medium text-foreground text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
        />
        <FieldError message={form.formState.errors.groupName?.message} />
      </div>

      {/* Difficulty (Custom Journey only) */}
      {sourceType === 'CUSTOM_JOURNEY' && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-semibold text-foreground text-sm">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            Độ khó hành trình <span className="text-destructive">*</span>
          </label>
          <select
            {...form.register('difficulty')}
            disabled={isPending}
            className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-input bg-background px-4 pr-10 font-medium text-foreground text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
          >
            {JOURNEY_DIFFICULTY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <FieldError message={form.formState.errors.difficulty?.message} />
        </div>
      )}

      {/* Group Cover Image */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 font-semibold text-foreground text-sm">
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
          Ảnh nền nhóm
          <span className="font-normal text-muted-foreground text-xs">(Không bắt buộc)</span>
        </label>
        <Controller
          name="coverImageUrl"
          control={form.control}
          render={({ field }) => (
            <AppImageUploadField
              value={field.value || undefined}
              onChange={(url) => field.onChange(url || '')}
              cleanup={cleanup}
              folder="matching-groups/covers"
              label="Tải lên ảnh nền đại diện cho nhóm"
              previewClassName="aspect-video w-full object-cover rounded-xl"
              disabled={isPending}
              onUploadingChange={onUploadingChange}
            />
          )}
        />
        <FieldError message={form.formState.errors.coverImageUrl?.message} />
      </div>

      {/* Dates and Size Grid */}
      <div
        className={`grid grid-cols-1 gap-4 ${
          sourceType === 'CUSTOM_JOURNEY' ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'
        }`}
      >
        <div className="space-y-2">
          <div className="flex min-h-[20px] items-center justify-between">
            <label className="flex items-center gap-1.5 font-semibold text-foreground text-xs sm:text-sm whitespace-nowrap">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              Khởi hành <span className="text-destructive">*</span>
            </label>
          </div>
          <Controller
            name="targetDate"
            control={form.control}
            render={({ field }) => (
              <AppDatePicker
                selected={field.value ? new Date(field.value) : null}
                onChange={(date: Date | null) => field.onChange(date ? toLocalDateValue(date) : '')}
                disabled={isPending}
                className="h-11 w-full cursor-pointer rounded-lg border border-input bg-background px-4 font-medium text-foreground text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                placeholderText="Chọn ngày"
              />
            )}
          />
          <FieldError message={form.formState.errors.targetDate?.message} />
        </div>

        {sourceType === 'CUSTOM_JOURNEY' && (
          <div className="space-y-2">
            <div className="flex min-h-[20px] items-center justify-between">
              <label className="flex items-center gap-1.5 font-semibold text-foreground text-xs sm:text-sm whitespace-nowrap">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                Kết thúc (dự kiến)
              </label>
            </div>
            <Controller
              name="endDate"
              control={form.control}
              render={({ field }) => (
                <AppDatePicker
                  selected={field.value ? new Date(field.value) : null}
                  onChange={(date: Date | null) =>
                    field.onChange(date ? toLocalDateValue(date) : '')
                  }
                  disabled={isPending}
                  className="h-11 w-full cursor-pointer rounded-lg border border-input bg-background px-4 font-medium text-foreground text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholderText="Chọn ngày"
                />
              )}
            />
            <FieldError message={form.formState.errors.endDate?.message} />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex min-h-[20px] items-center justify-between">
            <label className="flex items-center gap-1.5 font-semibold text-foreground text-xs sm:text-sm whitespace-nowrap">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              Hạn đăng ký <span className="text-destructive">*</span>
            </label>
          </div>
          <Controller
            name="matchingDeadline"
            control={form.control}
            render={({ field }) => (
              <AppDatePicker
                selected={field.value ? new Date(field.value) : null}
                onChange={(date: Date | null) =>
                  field.onChange(date ? toLocalDateValue(date, true) : '')
                }
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="Giờ"
                disabled={isPending}
                className="h-11 w-full cursor-pointer rounded-lg border border-input bg-background px-4 font-medium text-foreground text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                placeholderText="Chọn hạn"
              />
            )}
          />
          <FieldError message={form.formState.errors.matchingDeadline?.message} />
        </div>

        <div className="space-y-2">
          <div className="flex min-h-[20px] items-center justify-between gap-1">
            <label className="flex items-center gap-1.5 font-semibold text-foreground text-xs sm:text-sm whitespace-nowrap">
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
              Số người tối đa <span className="text-destructive">*</span>
            </label>
            {sourceType === 'TOUR' && selectedTour?.maxCapacity && (
              <span className="text-[11px] text-muted-foreground font-normal whitespace-nowrap">
                (Tối đa: {selectedTour.maxCapacity})
              </span>
            )}
          </div>
          <input
            type="number"
            min={MATCHING_GROUP_MIN_SIZE}
            max={
              sourceType === 'TOUR' && selectedTour?.maxCapacity
                ? selectedTour.maxCapacity
                : MATCHING_GROUP_MAX_SIZE
            }
            {...form.register('maxSize')}
            disabled={isPending}
            className="h-11 w-full rounded-lg border border-input bg-background px-4 font-medium text-foreground text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
          <FieldError message={form.formState.errors.maxSize?.message} />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 font-semibold text-foreground text-sm">
          <AlignLeft className="h-4 w-4 text-muted-foreground" />
          Mô tả nhóm
          <span className="font-normal text-muted-foreground text-xs">(Không bắt buộc)</span>
        </label>
        <div className="relative">
          <textarea
            rows={4}
            {...form.register('description')}
            disabled={isPending}
            maxLength={MATCHING_GROUP_DESCRIPTION_MAX_LENGTH}
            placeholder="Chia sẻ về bản thân, yêu cầu thể lực, kinh nghiệm mong muốn của thành viên..."
            className="w-full resize-none rounded-lg border border-input bg-background px-4 py-3 font-medium text-foreground text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
          <div className="absolute right-3 bottom-3 text-muted-foreground text-xs">
            {description.length}/{MATCHING_GROUP_DESCRIPTION_MAX_LENGTH}
          </div>
        </div>
        <FieldError message={form.formState.errors.description?.message} />
      </div>
    </div>
  );
}
