import { MapPin, Mountain, Navigation } from 'lucide-react';
import type { MomentItem } from '../types';

interface MomentGeoBadgesProps {
  moment: MomentItem;
  onViewOnMap?: (moment: MomentItem) => void;
}

/** Địa điểm check-in, độ cao và tọa độ GPS của một khoảnh khắc. */
export function MomentGeoBadges({ moment, onViewOnMap }: MomentGeoBadgesProps) {
  const placeLabel = moment.locationName || moment.placeName;
  const hasCoordinates = moment.latitude !== undefined && moment.longitude !== undefined;

  if (!placeLabel && !moment.altitude && !hasCoordinates) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 pt-3 text-xs sm:px-5">
      {placeLabel ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-bold text-primary">
          <MapPin className="h-3.5 w-3.5" />
          {placeLabel}
        </span>
      ) : null}

      {moment.altitude ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 font-bold text-emerald-600 dark:text-emerald-400">
          <Mountain className="h-3.5 w-3.5" />
          {moment.altitude}
        </span>
      ) : null}

      {hasCoordinates && onViewOnMap ? (
        <button
          type="button"
          onClick={() => onViewOnMap(moment)}
          className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border/70 bg-muted/30 px-2.5 py-1 font-mono text-[11px] text-muted-foreground transition hover:border-primary/40 hover:text-primary"
          title="Bấm để xem vị trí trên Bản đồ"
        >
          <Navigation className="h-3 w-3 text-primary" />
          {moment.latitude?.toFixed(4)}°, {moment.longitude?.toFixed(4)}°
        </button>
      ) : null}
    </div>
  );
}
