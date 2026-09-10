import { Clock, Eye, MapPin, Navigation, Pencil, Trash2 } from 'lucide-react';
import type { CustomJourneyCheckpointResponse } from '../../../types/workspace';

interface CheckpointTimelineItemProps {
  checkpoint: CustomJourneyCheckpointResponse;
  index: number;
  isLeader: boolean;
  isLocked: boolean;
  onView: (checkpoint: CustomJourneyCheckpointResponse) => void;
  onEdit: (checkpoint: CustomJourneyCheckpointResponse) => void;
  onDelete: (checkpoint: CustomJourneyCheckpointResponse) => void;
}

export function CheckpointTimelineItem({
  checkpoint,
  index,
  isLeader,
  isLocked,
  onView,
  onEdit,
  onDelete,
}: CheckpointTimelineItemProps) {
  const canEdit = isLeader && !isLocked;

  const hasCoords =
    checkpoint.latitude !== null &&
    checkpoint.latitude !== undefined &&
    checkpoint.longitude !== null &&
    checkpoint.longitude !== undefined;

  const timeRange =
    checkpoint.plannedStartAt || checkpoint.plannedEndAt
      ? `${checkpoint.plannedStartAt ?? '—'} - ${checkpoint.plannedEndAt ?? '—'}`
      : null;

  return (
    <div className="group relative flex gap-4 transition">
      {/* Cột số thứ tự & Đường kẻ timeline */}
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background text-xs font-black text-primary shadow-xs transition group-hover:bg-primary group-hover:text-primary-foreground">
          {checkpoint.checkpointOrder ?? index + 1}
        </div>
        <div className="my-1.5 w-0.5 grow bg-border group-last:hidden" />
      </div>

      {/* Thẻ nội dung Checkpoint */}
      <div className="mb-6 flex-1 rounded-2xl border border-border bg-card p-4 text-xs shadow-xs transition hover:border-primary/40 hover:shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {checkpoint.dayNo && (
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-extrabold text-primary">
                  Ngày {checkpoint.dayNo}
                </span>
              )}

              {timeRange && (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3 text-primary" />
                  {timeRange}
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-foreground sm:text-lg">{checkpoint.title}</h3>

            {checkpoint.locationName && (
              <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                <div className="flex items-center gap-1 font-medium text-foreground/80">
                  <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  <span>{checkpoint.locationName}</span>
                </div>

                {hasCoords && (
                  <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    <Navigation className="h-2.5 w-2.5" />
                    {checkpoint.latitude?.toFixed(4)}, {checkpoint.longitude?.toFixed(4)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 self-end sm:self-start">
            <button
              type="button"
              onClick={() => onView(checkpoint)}
              className="rounded-lg border border-border bg-background p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground cursor-pointer"
              title="Xem chi tiết điểm dừng"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>

            {canEdit && (
              <>
                <button
                  type="button"
                  onClick={() => onEdit(checkpoint)}
                  className="rounded-lg border border-border bg-background p-2 text-muted-foreground transition hover:bg-muted hover:text-primary cursor-pointer"
                  title="Chỉnh sửa điểm dừng"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(checkpoint)}
                  className="rounded-lg border border-border bg-background p-2 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30 cursor-pointer"
                  title="Xóa điểm dừng"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {checkpoint.description && (
          <p className="mt-3 leading-relaxed text-muted-foreground">{checkpoint.description}</p>
        )}

        {checkpoint.imageUrl && (
          <div className="mt-3.5 overflow-hidden rounded-xl border border-border bg-muted/30">
            <img
              src={checkpoint.imageUrl}
              alt={checkpoint.title}
              className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] sm:h-52"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </div>
  );
}
