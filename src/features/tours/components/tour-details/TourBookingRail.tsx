import { Lock, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getBookTourPath, PATHS } from '@/constants';
import {
  isBookableSchedule,
  SECTION_IDS,
  SECTION_SCROLL_OFFSET,
  sortSchedulesByDeparture,
} from '@/features/tours/components/tour-details/shared';
import type { TourDetailFromApi, TourDetailScheduleApi } from '@/features/tours/types';
import { formatPrice } from '@/utils/format';

interface TourBookingRailProps {
  tour: TourDetailFromApi;
  schedules: TourDetailScheduleApi[];
  isLoggedIn: boolean;
}

/**
 * Thẻ đặt tour dính ở cột phải — nơi chốt hành động đặt tour.
 */
export function TourBookingRail({ tour, schedules, isLoggedIn }: TourBookingRailProps) {
  const bookable = sortSchedulesByDeparture(schedules.filter(isBookableSchedule));
  const hasSchedules = bookable.length > 0;
  const bookingPath = getBookTourPath(tour.tourId);
  const contactHref = tour.vendorContactPhone
    ? `tel:${tour.vendorContactPhone}`
    : tour.vendorContactEmail
      ? `mailto:${tour.vendorContactEmail}`
      : null;

  function scrollToPolicy(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const target = document.getElementById(SECTION_IDS.policy);
    if (!target) return;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - SECTION_SCROLL_OFFSET,
      behavior: 'smooth',
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Giá
        </p>
        <p className="mt-1 flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold leading-none text-primary">
            {formatPrice(tour.basePrice)}đ
          </span>
          <span className="text-sm text-muted-foreground">/ người</span>
        </p>
      </div>

      {/* CTA — hành động chính duy nhất của cả trang */}
      {tour.onlineBookingEnabled !== true ? (
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-center">
          <p className="text-sm font-bold text-amber-950">Chưa nhận đặt online</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-800">
            {tour.onlineBookingDisabledReason ?? 'Tour chưa đủ điều kiện nhận đặt online.'}
          </p>
          {contactHref && (
            <a
              href={contactHref}
              className="mt-2 inline-block text-xs font-bold text-amber-950 underline underline-offset-4"
            >
              Liên hệ nhà tổ chức
            </a>
          )}
        </div>
      ) : !isLoggedIn ? (
        <>
          <Link
            to={PATHS.LOGIN}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <Lock className="h-4 w-4" aria-hidden="true" />
            Đăng nhập để đặt tour
          </Link>
          <p className="text-center text-xs text-muted-foreground">
            Thành viên nhận giá ưu đãi và đặt trực tiếp qua hệ thống.
          </p>
        </>
      ) : hasSchedules ? (
        <>
          <Link
            to={bookingPath}
            className="flex w-full items-center justify-center rounded-full bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Đặt tour
          </Link>
          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Chưa trừ tiền ngay — xác nhận thông tin ở bước sau.
          </p>
        </>
      ) : (
        <p className="rounded-xl bg-muted px-4 py-3 text-center text-xs text-muted-foreground">
          Tour chưa mở lịch khởi hành. Nhắn cho nhà tổ chức để được báo khi có lịch mới.
        </p>
      )}

      <a
        href={`#${SECTION_IDS.policy}`}
        onClick={scrollToPolicy}
        className="text-center text-xs font-semibold text-primary underline-offset-4 hover:underline"
      >
        Xem chính sách hủy và hoàn tiền
      </a>
    </div>
  );
}
