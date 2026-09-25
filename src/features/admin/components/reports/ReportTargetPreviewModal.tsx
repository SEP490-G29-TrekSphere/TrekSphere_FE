import { X } from 'lucide-react';
import {
  splitField,
  TourInclusionsSection,
  TourOverviewSection,
  TourParticipationPolicySection,
  TourRouteSection,
  TourStatsGrid,
} from '@/features/tours/components/tour-details';
import { useTourCheckpoints } from '@/features/tours/hooks/useTourCheckpoints';
import { useTourDetail } from '@/features/tours/hooks/useTourDetail';
import { AppModalShell, AppSpinner } from '@/shared/ui';
import { sanitizeHtml } from '@/utils/sanitize';

export interface ReportTargetPreviewModalProps {
  open: boolean;
  onClose: () => void;
  targetType: string;
  targetId: string;
  targetTitle: string | null;
  targetContent: string | null;
}

export function ReportTargetPreviewModal({
  open,
  onClose,
  targetType,
  targetId,
  targetTitle,
  targetContent,
}: ReportTargetPreviewModalProps) {
  const isTour = targetType === 'TOUR';
  const isHtmlContent = targetType === 'BLOG';
  const tourQuery = useTourDetail(isTour && open ? targetId : undefined);
  const checkpointsQuery = useTourCheckpoints(isTour && open ? targetId : undefined);
  const tour = tourQuery.data;
  const hasInclusions = Boolean(
    tour && (splitField(tour.includes).length > 0 || splitField(tour.excludes).length > 0)
  );

  return (
    <AppModalShell
      open={open}
      onClose={onClose}
      aria-label="Xem đầy đủ nội dung bị báo cáo"
      className={`max-h-[85vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 ${isTour ? 'max-w-3xl' : 'max-w-2xl'}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Nội dung bị báo cáo
        </span>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {isTour ? (
        tourQuery.isLoading ? (
          <div className="flex justify-center py-12">
            <AppSpinner size="lg" />
          </div>
        ) : tour ? (
          <div className="flex flex-col gap-6">
            <h1 className="text-xl font-bold text-zinc-900">{tour.tourName}</h1>
            <TourStatsGrid tour={tour} />
            <TourOverviewSection tour={tour} />
            <TourRouteSection
              checkpoints={checkpointsQuery.data ?? []}
              isLoading={checkpointsQuery.isLoading}
            />
            {hasInclusions && <TourInclusionsSection tour={tour} />}
            {tour.participationPolicy && (
              <TourParticipationPolicySection policy={tour.participationPolicy} />
            )}
          </div>
        ) : (
          <p className="text-sm text-destructive">Không thể tải nội dung tour.</p>
        )
      ) : (
        <>
          <h1 className="mb-4 text-xl font-bold text-zinc-900">
            {targetTitle || 'Bình luận / Đánh giá'}
          </h1>
          {isHtmlContent ? (
            <div
              className="ql-editor whitespace-normal! break-words !p-0 text-sm leading-relaxed text-zinc-700"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized with DOMPurify via sanitizeHtml, same pattern as blog content.
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(targetContent ?? '') }}
            />
          ) : (
            <div className="whitespace-pre-line break-words text-sm leading-relaxed text-zinc-700">
              {targetContent}
            </div>
          )}
        </>
      )}
    </AppModalShell>
  );
}
