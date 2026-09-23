import { Flag } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  isBookableSchedule,
  SECTION_IDS,
  SECTION_SCROLL_OFFSET,
  sortSchedulesByDeparture,
  splitField,
  TourBookingRail,
  TourDetailError,
  TourDetailHero,
  TourDetailSkeleton,
  TourGallerySection,
  TourInclusionsSection,
  TourMobileBookingBar,
  TourNotFound,
  TourOverviewSection,
  TourParticipationPolicySection,
  TourRouteSection,
  TourScheduleSection,
  type TourSection,
  TourSectionNav,
  TourStatsGrid,
  TourVendorCard,
} from '@/features/tours/components/tour-details';
import { useTourCheckpoints } from '@/features/tours/hooks/useTourCheckpoints';
import { useTourDetail } from '@/features/tours/hooks/useTourDetail';
import { useTourSchedules } from '@/features/tours/hooks/useTourSchedules';
import { ReportModal } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';

/** Thứ tự này phải khớp thứ tự các section trong DOM để scrollspy chạy đúng. */
const SECTIONS: TourSection[] = [
  { id: SECTION_IDS.overview, label: 'Tổng quan' },
  { id: SECTION_IDS.schedules, label: 'Lịch khởi hành' },
  { id: SECTION_IDS.route, label: 'Lộ trình' },
  { id: SECTION_IDS.inclusions, label: 'Bao gồm' },
  { id: SECTION_IDS.gallery, label: 'Hình ảnh' },
  { id: SECTION_IDS.requirements, label: 'Điều kiện' },
];

/** Tiêu đề chung cho mọi khối nội dung ở cột trái. */
function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold text-foreground md:text-2xl">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

/**
 * Trang chi tiết tour — `GET /tours/{tourId}` cộng lịch khởi hành và checkpoint.
 *
 * Bố cục: hero → thanh nav dính theo section → hai cột, cột phải là thẻ đặt tour
 * dính theo màn hình. Trang chỉ giữ đúng một mẩu state dùng chung là lịch đang
 * chọn: danh sách lịch bên trái ghi vào, thẻ đặt tour bên phải và thanh mobile đọc
 * ra, nhờ vậy giá và ngày ở ba nơi luôn là một.
 */
export default function TourDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAppStore((state) => state.user);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const { data: tour, isLoading, error, refetch, isFetching } = useTourDetail(id);
  const { data: apiSchedules } = useTourSchedules(id);
  const { data: checkpoints, isLoading: isLoadingCheckpoints } = useTourCheckpoints(id);

  // `GET /tours/{id}` đã kèm `schedules`, endpoint riêng chỉ để làm mới; ưu tiên
  // dữ liệu mới hơn nhưng vẫn có sẵn để render ngay lần đầu.
  const schedules = apiSchedules ?? tour?.schedules ?? [];

  const bookableSchedules = useMemo(
    () => sortSchedulesByDeparture(schedules.filter(isBookableSchedule)),
    [schedules]
  );

  const hasInclusions =
    splitField(tour?.includes).length > 0 || splitField(tour?.excludes).length > 0;
  const hasGallery = (tour?.images.length ?? 0) > 0;
  const hasParticipationPolicy = Boolean(tour?.participationPolicy);
  const visibleSections = SECTIONS.filter(
    (section) =>
      (section.id !== SECTION_IDS.inclusions || hasInclusions) &&
      (section.id !== SECTION_IDS.gallery || hasGallery) &&
      (section.id !== SECTION_IDS.requirements || hasParticipationPolicy)
  );

  if (isLoading) return <TourDetailSkeleton />;

  if (error) {
    return (
      <TourDetailError
        message={error.message || 'Đã xảy ra lỗi khi tải thông tin tour.'}
        onRetry={() => {
          if (!isFetching) refetch();
        }}
        isFetching={isFetching}
      />
    );
  }

  if (!tour) return <TourNotFound />;

  return (
    <div className="min-h-screen bg-background pt-16">
      <TourDetailHero tour={tour} />
      <TourSectionNav sections={visibleSections} />

      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:py-10">
        {user && (
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
              title="Báo cáo vi phạm"
            >
              <Flag className="size-3.5" />
              Báo cáo vi phạm
            </button>
          </div>
        )}

        <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px] lg:gap-10">
          {/* Cột trái — nội dung tour */}
          <div className="flex min-w-0 flex-col gap-10">
            <section
              id={SECTION_IDS.overview}
              style={{ scrollMarginTop: SECTION_SCROLL_OFFSET }}
              className="flex flex-col gap-5"
            >
              <TourStatsGrid tour={tour} />
              <TourOverviewSection tour={tour} />
            </section>

            <section id={SECTION_IDS.schedules} style={{ scrollMarginTop: SECTION_SCROLL_OFFSET }}>
              <SectionHeading
                title="Lịch khởi hành"
                description="Danh sách các đợt khởi hành dự kiến và giá tour."
              />
              <TourScheduleSection schedules={schedules} />
            </section>

            <section id={SECTION_IDS.route} style={{ scrollMarginTop: SECTION_SCROLL_OFFSET }}>
              <SectionHeading
                title="Lộ trình"
                description="Các điểm dừng chính theo thứ tự di chuyển."
              />
              <TourRouteSection checkpoints={checkpoints} isLoading={isLoadingCheckpoints} />
            </section>

            {hasInclusions && (
              <section
                id={SECTION_IDS.inclusions}
                style={{ scrollMarginTop: SECTION_SCROLL_OFFSET }}
              >
                <SectionHeading title="Bao gồm & không bao gồm" />
                <TourInclusionsSection tour={tour} />
              </section>
            )}

            {hasGallery && (
              <section id={SECTION_IDS.gallery} style={{ scrollMarginTop: SECTION_SCROLL_OFFSET }}>
                <SectionHeading title="Hình ảnh" />
                <TourGallerySection tour={tour} />
              </section>
            )}

            {tour.participationPolicy && (
              <section
                id={SECTION_IDS.requirements}
                style={{ scrollMarginTop: SECTION_SCROLL_OFFSET }}
              >
                <TourParticipationPolicySection policy={tour.participationPolicy} />
              </section>
            )}
          </div>

          {/* Cột phải — thẻ đặt tour dính, ẩn trên mobile vì đã có thanh đáy */}
          <aside className="hidden flex-col gap-5 lg:sticky lg:top-32 lg:flex">
            <TourBookingRail tour={tour} schedules={schedules} isLoggedIn={!!user} />
            <TourVendorCard tour={tour} />
          </aside>
        </div>

        {/* Nhà tổ chức trên mobile: đặt cuối trang, sau khi đã đọc hết nội dung */}
        <div className="mt-10 lg:hidden">
          <TourVendorCard tour={tour} />
        </div>
      </div>

      <TourMobileBookingBar
        tour={tour}
        hasSchedules={bookableSchedules.length > 0}
        isLoggedIn={!!user}
      />
      {/* Chừa chỗ cho thanh đáy để không che mất nội dung cuối trang */}
      <div className="h-20 lg:hidden" aria-hidden="true" />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        targetId={tour.tourId}
        targetType="TOUR"
        targetTitle={tour.tourName}
      />
    </div>
  );
}
