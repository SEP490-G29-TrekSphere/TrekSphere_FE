import { Sparkles } from 'lucide-react';
import { splitLines } from '@/features/tours/components/tour-details/shared';
import type { TourDetailFromApi } from '@/features/tours/types';
import { RichTextContent } from '@/shared/ui';

interface TourOverviewSectionProps {
  tour: TourDetailFromApi;
}

export function TourOverviewSection({ tour }: TourOverviewSectionProps) {
  const highlights = splitLines(tour.highlights);

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

      <RichTextContent
        content={tour.description}
        fallback="Nhà tổ chức chưa cập nhật phần giới thiệu cho tour này."
      />
    </div>
  );
}
