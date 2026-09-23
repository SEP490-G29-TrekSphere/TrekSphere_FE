import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Compass,
  Globe,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PATHS } from '@/constants/paths';
import { TourCard, TourPagination } from '@/features/tours';
import { useTours } from '@/features/tours/hooks/useTours';
import { AppButton, RichTextContent } from '@/shared/ui';
import { usePublicVendorProfile } from '../hooks/usePublicVendorProfile';

const TOURS_PAGE_SIZE = 9;

/**
 * Trang "Hồ sơ Vendor công khai" — Guest xem thông tin 1 đơn vị tổ chức tour + các tour đang mở
 * của họ. Cố tình KHÔNG dùng lại bố cục `ListTours` (không hero ảnh lớn/search/filter/sort) — đây
 * là trang thương hiệu của riêng 1 vendor, không phải 1 khung tìm kiếm tour lọc theo vendor.
 */
export default function PublicVendorProfilePage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const { data: profile, isLoading, isError, error } = usePublicVendorProfile(vendorId);
  const {
    tours,
    totalPages,
    pageNumber,
    isLoading: isToursLoading,
  } = useTours({
    vendorId,
    page,
    size: TOURS_PAGE_SIZE,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 lg:px-8">
          <VendorHeroSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-8 w-8" aria-hidden="true" />
          </div>
          <h1 className="mb-2 text-lg font-bold text-foreground">Không tìm thấy nhà tổ chức</h1>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : 'Hồ sơ Vendor này không tồn tại hoặc hiện không còn hoạt động.'}
          </p>
          <AppButton onClick={() => navigate(PATHS.TOURS)}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Về danh sách tour
          </AppButton>
        </div>
      </div>
    );
  }

  const partnerSinceYear = new Date(profile.partnerSince).getFullYear();

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Banner nhận diện thương hiệu Vendor — nền gradient riêng, không phải hero ảnh của ListTours */}
      <section className="w-full bg-gradient-to-br from-primary/95 via-primary to-primary-hover">
        <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 lg:px-8 sm:py-14">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-white/15 text-3xl font-extrabold text-white ring-2 ring-white/30 sm:h-28 sm:w-28">
              {profile.logoUrl ? (
                <img
                  src={profile.logoUrl}
                  alt={profile.companyName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span>{profile.companyName.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="min-w-0 flex-1 text-white">
              <p className="text-xs font-bold uppercase tracking-wider text-white/70">
                Hồ sơ nhà tổ chức
              </p>
              <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{profile.companyName}</h1>
              {profile.description && (
                <div className="mt-2 max-w-2xl">
                  <RichTextContent content={profile.description} variant="dark" />
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/90">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Đối tác từ {partnerSinceYear}
                </span>
                <span className="flex items-center gap-1.5">
                  <Compass className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Đã công bố {profile.publishedTourCount.toLocaleString('vi-VN')} tour
                </span>
                {profile.businessAddress && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {profile.businessAddress}
                  </span>
                )}
              </div>

              {(profile.contactEmail || profile.contactPhone || profile.websiteUrl) && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {profile.contactPhone && (
                    <a
                      href={`tel:${profile.contactPhone}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/25"
                    >
                      <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                      {profile.contactPhone}
                    </a>
                  )}
                  {profile.contactEmail && (
                    <a
                      href={`mailto:${profile.contactEmail}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/25"
                    >
                      <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                      {profile.contactEmail}
                    </a>
                  )}
                  {profile.websiteUrl && (
                    <a
                      href={profile.websiteUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/25"
                    >
                      <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                      Website
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Danh sách tour đang mở của vendor này */}
      <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-lg font-bold text-foreground sm:text-xl">
          Các tour đang mở của {profile.companyName}
        </h2>

        {isToursLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length loading skeleton
                key={`vendor-tour-skeleton-${i}`}
                className="flex flex-col rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
              >
                <div className="aspect-[4/3] w-full animate-pulse rounded-t-2xl bg-muted" />
                <div className="flex flex-col gap-3 p-4">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : tours.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <p className="text-sm text-muted-foreground">
              {profile.companyName} chưa công bố tour nào.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour) => (
                <TourCard key={tour.id} tour={tour} layout="grid" />
              ))}
            </div>
            <div className="mt-8">
              <TourPagination
                pageNumber={pageNumber}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function VendorHeroSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-5 sm:flex-row sm:items-center">
      <div className="h-20 w-20 shrink-0 rounded-3xl bg-muted sm:h-28 sm:w-28" />
      <div className="flex-1 space-y-3">
        <div className="h-6 w-1/3 rounded bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
      </div>
    </div>
  );
}
