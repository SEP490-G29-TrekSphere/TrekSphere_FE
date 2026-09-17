import { Mail, Phone } from 'lucide-react';
import type { TourDetailFromApi, TourDetailScheduleApi } from '@/features/tours/types';
import { formatPrice } from '@/utils/format';

interface TourBookingRailProps {
  tour: TourDetailFromApi;
  schedules?: TourDetailScheduleApi[];
  isLoggedIn?: boolean;
}

/**
 * Thẻ thông tin và liên hệ đặt tour ở cột phải trang chi tiết tour.
 */
export function TourBookingRail({ tour }: TourBookingRailProps) {
  const contactHref = tour.vendorContactPhone
    ? `tel:${tour.vendorContactPhone}`
    : tour.vendorContactEmail
      ? `mailto:${tour.vendorContactEmail}`
      : null;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Giá tham khảo
        </p>
        <p className="mt-1 flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold leading-none text-primary">
            {formatPrice(tour.basePrice)}đ
          </span>
          <span className="text-sm text-muted-foreground">/ người</span>
        </p>
      </div>

      {contactHref ? (
        <div className="flex flex-col gap-3">
          <a
            href={contactHref}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            {tour.vendorContactPhone ? (
              <Phone className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Mail className="h-4 w-4" aria-hidden="true" />
            )}
            Liên hệ nhà tổ chức
          </a>
          <div className="rounded-xl bg-muted/60 px-4 py-3 text-center text-xs text-muted-foreground">
            {tour.vendorContactPhone && (
              <p>
                Hotline:{' '}
                <span className="font-semibold text-foreground">{tour.vendorContactPhone}</span>
              </p>
            )}
            {tour.vendorContactEmail && (
              <p className="mt-0.5">
                Email:{' '}
                <span className="font-semibold text-foreground">{tour.vendorContactEmail}</span>
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-muted px-4 py-3 text-center text-xs text-muted-foreground">
          Liên hệ với nhà tổ chức để được tư vấn và hỗ trợ chi tiết.
        </div>
      )}
    </div>
  );
}
