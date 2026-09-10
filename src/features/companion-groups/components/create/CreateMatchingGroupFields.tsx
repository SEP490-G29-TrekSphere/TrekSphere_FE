import { AlignLeft, Calendar, Clock, Gauge, Info, MapPin, Tag, Users } from 'lucide-react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { AppDatePicker } from '@/shared/ui';
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

interface TourOption {
  id: string;
  name: string;
}

interface CreateMatchingGroupFieldsProps {
  form: UseFormReturn<CreateMatchingGroupFormInput, undefined, CreateMatchingGroupFormValues>;
  tours: TourOption[];
  isToursLoading: boolean;
  isPending: boolean;
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
}: CreateMatchingGroupFieldsProps) {
  const description = form.watch('description') ?? '';
  const sourceType = form.watch('sourceType') ?? 'CUSTOM_JOURNEY';

  return (
    <div className="space-y-6">
      {/* Tour Dropdown (Only when explicit TOUR mode passed) */}
      {sourceType === 'TOUR' && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-semibold text-foreground text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Chọn tour <span className="text-destructive">*</span>
          </label>
          <select
            {...form.register('tourId')}
            disabled={isToursLoading || isPending}
            className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-input bg-background px-4 pr-10 font-medium text-foreground text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>
              {isToursLoading ? 'Đang tải...' : 'Chọn điểm đến của bạn'}
            </option>
            {tours.map((tour) => (
              <option key={tour.id} value={tour.id}>
                {tour.name}
              </option>
            ))}
          </select>
          <FieldError message={form.formState.errors.tourId?.message} />
        </div>
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

      {/* Dates and Size Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-semibold text-foreground text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Khởi hành <span className="text-destructive">*</span>
          </label>
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
            <label className="flex items-center gap-2 font-semibold text-foreground text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Kết thúc (dự kiến)
            </label>
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
          <label className="flex items-center gap-2 font-semibold text-foreground text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Hạn đăng ký <span className="text-destructive">*</span>
          </label>
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
          <label className="flex items-center gap-2 font-semibold text-foreground text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            Số người tối đa <span className="text-destructive">*</span>
          </label>
          <input
            type="number"
            min={MATCHING_GROUP_MIN_SIZE}
            max={MATCHING_GROUP_MAX_SIZE}
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
