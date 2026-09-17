import type { TourDetailFromApi } from '@/features/tours/types';
import { formatPrice } from '@/utils/format';

interface TourMobileBookingBarProps {
  tour: TourDetailFromApi;
  hasSchedules?: boolean;
  isLoggedIn?: boolean;
}

/**
 * Thanh liên hệ dính đáy màn hình cho mobile trên trang chi tiết tour.
 */
export function TourMobileBookingBar({ tour, hasSchedules }: TourMobileBookingBarProps) {
  const contactHref = tour.vendorContactPhone
    ? `tel:${tour.vendorContactPhone}`
    : tour.vendorContactEmail
      ? `mailto:${tour.vendorContactEmail}`
      : null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="min-w-0">
          <p className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-primary">
              {formatPrice(tour.basePrice)}đ
            </span>
            <span className="text-xs text-muted-foreground">/ người</span>
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {hasSchedules ? 'Khởi hành theo lịch' : 'Liên hệ để đặt chỗ'}
          </p>
        </div>

        {contactHref ? (
          <a
            href={contactHref}
            className="shrink-0 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Liên hệ
          </a>
        ) : (
          <span className="shrink-0 rounded-full bg-muted px-5 py-2.5 text-xs font-semibold text-muted-foreground">
            Chưa có liên hệ
          </span>
        )}
      </div>
    </div>
  );
}
