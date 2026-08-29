import { CalendarDays } from 'lucide-react';
import {
  isBookableSchedule,
  sortSchedulesByDeparture,
} from '@/features/tours/components/tour-details/shared';
import type { TourDetailScheduleApi } from '@/features/tours/types';
import { formatDate, formatPrice } from '@/utils/format';

interface TourScheduleSectionProps {
  schedules: TourDetailScheduleApi[];
}

/**
 * Danh sách lịch khởi hành — chỉ dùng để xem thông tin lịch và giá.
 */
export function TourScheduleSection({ schedules }: TourScheduleSectionProps) {
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
    <div className="flex flex-col gap-2">
      {bookable.map((schedule) => {
        return (
          <div
            key={schedule.scheduleId}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 select-none"
          >
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
          </div>
        );
      })}
    </div>
  );
}
