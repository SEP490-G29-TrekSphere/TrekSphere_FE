import { ExpandableSection } from '@/features/tours/components/tour-details/ExpandableSection';
import type { TourDetailFromApi } from '@/features/tours/types';
import { sanitizeHtml, stripHtml } from '@/utils/sanitize';
import 'react-quill-new/dist/quill.snow.css';

interface TourOverviewSectionProps {
  tour: TourDetailFromApi;
}

export function TourOverviewSection({ tour }: TourOverviewSectionProps) {
  const hasDescription = stripHtml(tour.description).trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl border border-border bg-card p-6">
        <h3 className="mb-4 text-sm font-bold text-foreground">Lịch trình chi tiết</h3>
        {hasDescription ? (
          <ExpandableSection collapsedClassName="max-h-72" fadeFromClassName="from-card">
            <div
              className="ql-editor whitespace-pre-line !p-0 text-sm leading-relaxed text-foreground/90"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized with DOMPurify via sanitizeHtml, same pattern as blog content.
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(tour.description) }}
            />
          </ExpandableSection>
        ) : (
          <p className="text-sm italic text-muted-foreground">
            Nhà tổ chức chưa cập nhật phần giới thiệu cho tour này.
          </p>
        )}
      </div>
    </div>
  );
}
