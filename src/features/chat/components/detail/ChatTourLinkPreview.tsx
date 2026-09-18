import { Link } from 'react-router-dom';
import { useTourDetail } from '@/features/tours';
import { cn } from '@/lib/utils';

interface ChatTourLinkPreviewProps {
  tourId: string;
  isOwn: boolean;
}

export function extractTourIdFromText(text: string): string | null {
  if (!text) return null;
  const match = text.match(/\/tours\/([0-9a-fA-F-]{36})/);
  return match ? match[1] : null;
}

export function ChatTourLinkPreview({ tourId, isOwn }: ChatTourLinkPreviewProps) {
  const { data: tour, isLoading } = useTourDetail(tourId);

  if (isLoading) {
    return (
      <div className="mt-2 w-full max-w-sm rounded-xl border border-border/60 bg-card/90 p-3 shadow-xs animate-pulse">
        <div className="flex gap-3">
          <div className="h-16 w-20 rounded-lg bg-muted shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3.5 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!tour) return null;

  return (
    <Link
      to={`/tours/${tour.tourId}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'mt-2 block w-full max-w-sm overflow-hidden rounded-xl border text-left transition-all duration-200 hover:shadow-md hover:scale-[1.01]',
        isOwn
          ? 'border-white/20 bg-background text-foreground shadow-sm'
          : 'border-border bg-card text-foreground shadow-xs'
      )}
    >
      {/* Cover Image banner */}
      <div className="relative h-28 w-full overflow-hidden bg-muted">
        {tour.coverImageUrl ? (
          <img
            src={tour.coverImageUrl}
            alt={tour.tourName}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary font-bold text-sm">
            TrekSphere Tour
          </div>
        )}
        <div className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white uppercase backdrop-blur-xs">
          Tour leo núi
        </div>
        {tour.price !== undefined && (
          <div className="absolute bottom-2 right-2 rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-white shadow-xs">
            {tour.price.toLocaleString('vi-VN')} đ
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-3">
        <h4 className="line-clamp-1 text-sm font-bold text-foreground">{tour.tourName}</h4>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {tour.location && <span>📍 {tour.location}</span>}
          {tour.durationDays && <span>⏱️ {tour.durationDays} ngày</span>}
          {tour.vendorName && <span>🏢 {tour.vendorName}</span>}
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2 text-[11px] font-semibold text-primary">
          <span>Xem chi tiết tour</span>
          <span aria-hidden="true">→</span>
        </div>
      </div>
    </Link>
  );
}
