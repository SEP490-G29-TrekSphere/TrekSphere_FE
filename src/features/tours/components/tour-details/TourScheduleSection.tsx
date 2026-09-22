import { CalendarDays } from 'lucide-react';
import {
  isBookableSchedule,
  sortSchedulesByDeparture,
} from '@/features/tours/components/tour-details/shared';
import type { TourDetailScheduleApi } from '@/features/tours/types';
import { formatDate } from '@/utils/format';

interface TourScheduleSectionProps {
  schedules: TourDetailScheduleApi[];
}

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
            <span className="text-sm font-bold text-foreground">
              {formatDate(schedule.departureDate)} → {formatDate(schedule.returnDate)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
