import { Calendar, MapPin } from 'lucide-react';
import { AppModalShell } from '@/shared/ui';
import type { CustomJourneyCheckpointResponse } from '../../../types/workspace';

interface ViewCheckpointModalProps {
  checkpoint: CustomJourneyCheckpointResponse | null;
  onClose: () => void;
}

export function ViewCheckpointModal({ checkpoint, onClose }: ViewCheckpointModalProps) {
  if (!checkpoint) return null;

  return (
    <AppModalShell
      open={Boolean(checkpoint)}
      onClose={onClose}
      aria-label="Chi tiết điểm dừng"
      className="flex max-w-lg flex-col overflow-hidden border border-border p-0"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
            {checkpoint.checkpointOrder}
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">{checkpoint.title}</h3>
            {checkpoint.dayNo && (
              <p className="text-[11px] font-semibold text-primary">Ngày {checkpoint.dayNo}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground cursor-pointer"
        >
          ✕
        </button>
      </div>

      <div className="max-h-[70vh] space-y-3 overflow-y-auto px-5 py-4 text-xs">
        {checkpoint.imageUrl && (
          <div className="overflow-hidden rounded-xl border border-border">
            <img
              src={checkpoint.imageUrl}
              alt={checkpoint.title}
              className="h-48 w-full object-cover sm:h-56"
            />
          </div>
        )}

        {checkpoint.locationName && (
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <MapPin className="h-4 w-4 text-red-500 shrink-0" />
            <span>{checkpoint.locationName}</span>
            {checkpoint.latitude !== null &&
              checkpoint.latitude !== undefined &&
              checkpoint.longitude !== null &&
              checkpoint.longitude !== undefined && (
                <span className="ml-auto rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                  {checkpoint.latitude?.toFixed(4)}, {checkpoint.longitude?.toFixed(4)}
                </span>
              )}
          </div>
        )}

        {(checkpoint.plannedStartAt || checkpoint.plannedEndAt) && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>
              Thời gian: {checkpoint.plannedStartAt || '—'} → {checkpoint.plannedEndAt || '—'}
            </span>
          </div>
        )}

        {checkpoint.description && (
          <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 leading-relaxed text-muted-foreground">
            {checkpoint.description}
          </div>
        )}
      </div>
    </AppModalShell>
  );
}
