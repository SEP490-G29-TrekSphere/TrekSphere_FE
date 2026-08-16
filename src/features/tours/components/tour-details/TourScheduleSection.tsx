import { CalendarDays } from 'lucide-react';
import {
  isBookableSchedule,
  sortSchedulesByDeparture,
} from '@/features/tours/components/tour-details/shared';
import type { TourDetailScheduleApi } from '@/features/tours/types';
import { cn } from '@/lib/utils';
import { formatDate, formatPrice } from '@/utils/format';

interface TourScheduleSectionProps {
  schedules: TourDetailScheduleApi[];
  selectedScheduleId: string | null;
  onSelect: (scheduleId: string) => void;
}

/**
 * Danh sách lịch khởi hành — người dùng chọn ở đây, giá và nút đặt cập nhật ở thẻ
 * đặt tour bên phải. Chọn ngày và xác nhận đặt là hai bước tách bạch, nên bấm một
 * dòng lịch không điều hướng đi đâu cả.
 */
export function TourScheduleSection({
  schedules,
  selectedScheduleId,
  onSelect,
}: TourScheduleSectionProps) {
  const bookable = sortSchedulesByDeparture(schedules.filter(isBookableSchedule));

  if (bookable.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
        <CalendarDays
          className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50"
          aria-hidden="true"
        />
        <p className="text-sm font-semibold text-foreground">Chưa có lịch khởi hành</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Liên hệ nhà tổ chức để được thông báo khi mở lịch mới.
        </p>
      </div>
    );
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="sr-only">Chọn lịch khởi hành</legend>
      {bookable.map((schedule) => {
        const isSelected = schedule.scheduleId === selectedScheduleId;
        return (
          <label
            key={schedule.scheduleId}
            className={cn(
              'flex cursor-pointer flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 transition-colors',
              isSelected
                ? 'border-primary bg-primary/5 shadow-xs'
                : 'border-border bg-card hover:border-primary/40'
            )}
          >
            <input
              type="radio"
              name="tour-schedule"
              value={schedule.scheduleId}
              checked={isSelected}
              onChange={() => onSelect(schedule.scheduleId)}
              className="sr-only"
            />

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-bold text-foreground">
                {formatDate(schedule.departureDate)} → {formatDate(schedule.returnDate)}
              </span>
            </div>

            <span className="flex flex-col items-end">
              <span className="text-base font-extrabold text-primary">
                {formatPrice(schedule.price)}đ
              </span>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                / người
              </span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
