import { Sparkles } from 'lucide-react';
import { splitLines } from '@/features/tours/components/tour-details/shared';
import type { TourDetailFromApi } from '@/features/tours/types';
import { sanitizeHtml, stripHtml } from '@/utils/sanitize';
import 'react-quill-new/dist/quill.snow.css';

interface TourOverviewSectionProps {
  tour: TourDetailFromApi;
}

export function TourOverviewSection({ tour }: TourOverviewSectionProps) {
  const highlights = splitLines(tour.highlights);
  const hasDescription = stripHtml(tour.description).trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      {highlights.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {highlights.map((highlight) => (
            <li
              key={highlight}
              className="inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent/30 px-3 py-1.5 text-xs font-semibold text-accent-foreground"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {highlight}
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-3xl border border-border bg-card p-6">
        <h3 className="mb-4 text-sm font-bold text-foreground">Lịch trình chi tiết</h3>
        {hasDescription ? (
          <div
            className="ql-editor whitespace-pre-line !p-0 text-sm leading-relaxed text-foreground/90"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized with DOMPurify via sanitizeHtml, same pattern as blog content.
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(tour.description) }}
          />
        ) : (
          <p className="text-sm italic text-muted-foreground">
            Nhà tổ chức chưa cập nhật phần giới thiệu cho tour này.
          </p>
        )}
      </div>
    </div>
  );
}
