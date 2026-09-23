import { ArrowLeft, Eye } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PATHS } from '@/constants';
import {
  SECTION_IDS,
  SECTION_SCROLL_OFFSET,
  splitField,
  TourDetailError,
  TourDetailHero,
  TourDetailSkeleton,
  TourGallerySection,
  TourInclusionsSection,
  TourOverviewSection,
  TourParticipationPolicySection,
  TourRouteSection,
  TourScheduleSection,
  type TourSection,
  TourSectionNav,
  TourStatsGrid,
} from '@/features/tours/components/tour-details';
import type { TourCheckpoint } from '@/features/tours/types';
import { TourStatusBadge } from '@/features/vendor-tours/components/TourStatusBadge';
import { useVendorTourCheckpoints } from '@/features/vendor-tours/hooks/useVendorTourCheckpoints';
import { useVendorTourDetail } from '@/features/vendor-tours/hooks/useVendorTourDetail';
import type { VendorTourCheckpoint } from '@/features/vendor-tours/types';

/** Thứ tự phải khớp DOM để scrollspy chạy đúng — bỏ mục Đánh giá (không áp dụng khi xem trước). */
const SECTIONS: TourSection[] = [
  { id: SECTION_IDS.overview, label: 'Tổng quan' },
  { id: SECTION_IDS.schedules, label: 'Lịch khởi hành' },
  { id: SECTION_IDS.route, label: 'Lộ trình' },
  { id: SECTION_IDS.inclusions, label: 'Bao gồm' },
  { id: SECTION_IDS.gallery, label: 'Hình ảnh' },
  { id: SECTION_IDS.requirements, label: 'Điều kiện' },
];

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold text-foreground md:text-2xl">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

/** Checkpoint vendor (field optional/undefined) → shape guest (field nullable) cho các section tái dùng. */
function toGuestCheckpoint(checkpoint: VendorTourCheckpoint): TourCheckpoint {
  return {
    checkpointId: checkpoint.checkpointId,
    tourId: checkpoint.tourId,
    checkpointName: checkpoint.checkpointName,
    description: checkpoint.description ?? null,
    latitude: checkpoint.latitude ?? null,
    longitude: checkpoint.longitude ?? null,
    altitude: checkpoint.altitude ?? null,
    checkpointOrder: checkpoint.checkpointOrder,
    checkpointImageUrl: checkpoint.checkpointImageUrl ?? null,
    checkpointImageUrls: checkpoint.checkpointImageUrls,
  };
}

/**
 * Xem trước tour dạng đọc — dành riêng cho Vendor, khác trang `/tours/:id` (Guest) vì trang đó
 * chỉ trả về tour đã `PUBLISHED` (`findPublishedDetailById` phía BE). Trang này lấy dữ liệu qua
 * `GET /vendor/tours/{id}` (hoạt động ở mọi trạng thái DRAFT/PUBLISHED/HIDDEN) nên Vendor xem
 * trước được cả tour chưa công khai. Tái dùng nguyên các section hiển thị của trang Guest (đều là
 * component thuần, nhận props) — bỏ phần Đặt tour/Đánh giá/Thẻ vendor vì không áp dụng ở đây.
 */
export default function TourPreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: tour, isLoading, isError, error, refetch, isFetching } = useVendorTourDetail(id);
  const { data: rawCheckpoints, isLoading: isLoadingCheckpoints } = useVendorTourCheckpoints(id);

  const checkpoints = useMemo(
    () => (rawCheckpoints ?? []).map(toGuestCheckpoint),
    [rawCheckpoints]
  );
  const schedules = tour?.schedules ?? [];

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

  const handleBack = () => navigate(PATHS.VENDOR_MANAGER_TOURS);

  if (isLoading) return <TourDetailSkeleton />;

  if (isError || !tour) {
    return (
      <TourDetailError
        message={error instanceof Error ? error.message : 'Không thể tải thông tin tour.'}
        onRetry={() => {
          if (!isFetching) refetch();
        }}
        isFetching={isFetching}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
          <Eye className="h-4 w-4 shrink-0" />
          <span>Chế độ xem trước — chỉ bạn thấy, không phải trang Guest thật</span>
          <TourStatusBadge status={tour.status} />
        </div>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-xs transition-colors hover:bg-amber-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Quay lại danh sách
        </button>
      </div>

      <TourDetailHero tour={tour} />
      <TourSectionNav sections={visibleSections} />

      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:py-10">
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
            <section id={SECTION_IDS.inclusions} style={{ scrollMarginTop: SECTION_SCROLL_OFFSET }}>
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
      </div>
    </div>
  );
}
