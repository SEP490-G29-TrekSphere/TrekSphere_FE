import { Clock, Compass, Eye, MapPin, MapPinned, Pencil, Plus, Trash2 } from 'lucide-react';
import type { CustomJourneyCheckpointResponse } from '../../../types/workspace';

interface CheckpointListSectionProps {
  checkpoints: CustomJourneyCheckpointResponse[];
  canEdit: boolean;
  onAddCheckpoint: () => void;
  onViewCheckpoint: (checkpoint: CustomJourneyCheckpointResponse) => void;
  onEditCheckpoint: (checkpoint: CustomJourneyCheckpointResponse) => void;
  onDeleteCheckpoint: (checkpoint: CustomJourneyCheckpointResponse) => void;
}

export function CheckpointListSection({
  checkpoints,
  canEdit,
  onAddCheckpoint,
  onViewCheckpoint,
  onEditCheckpoint,
  onDeleteCheckpoint,
}: CheckpointListSectionProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            <h3 className="text-base font-extrabold text-foreground">
              Checkpoint dự kiến ({checkpoints.length})
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Các mốc dừng chân dự kiến trên cung đường — dùng để check-in và định hướng di chuyển.
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={onAddCheckpoint}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm checkpoint
          </button>
        )}
      </div>

      {checkpoints.length === 0 ? (
        <div className="py-6 text-center text-xs text-muted-foreground">
          Chưa có checkpoint nào.{' '}
          {canEdit ? 'Bấm "Thêm checkpoint" để lên kế hoạch các điểm dừng chân.' : ''}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {checkpoints.map((cp) => {
            const cpId = cp.customJourneyCheckpointId || cp.id || '';
            return (
              <div
                key={cpId}
                className="group relative flex flex-col justify-between rounded-xl border border-border bg-background p-3 text-xs overflow-hidden transition hover:border-primary/50 shadow-2xs"
              >
                {cp.imageUrl && (
                  <div className="h-24 w-full -mx-3 -mt-3 mb-2.5 overflow-hidden border-b border-border relative">
                    <img
                      src={cp.imageUrl}
                      alt={cp.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <span className="absolute top-2 left-2 rounded-md bg-black/60 backdrop-blur-xs px-2 py-0.5 text-[10px] font-extrabold text-white">
                      Chặng {cp.checkpointOrder}
                    </span>
                  </div>
                )}

                <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onViewCheckpoint(cp)}
                    className="rounded-full bg-background/80 backdrop-blur-xs p-1.5 text-muted-foreground hover:text-primary shadow-2xs transition cursor-pointer"
                    title="Xem chi tiết"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>

                  {canEdit && (
                    <>
                      <button
                        type="button"
                        onClick={() => onEditCheckpoint(cp)}
                        className="rounded-full bg-background/80 backdrop-blur-xs p-1.5 text-muted-foreground hover:text-primary shadow-2xs transition cursor-pointer"
                        title="Sửa checkpoint"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteCheckpoint(cp)}
                        className="rounded-full bg-background/80 backdrop-blur-xs p-1.5 text-muted-foreground hover:text-destructive shadow-2xs transition cursor-pointer"
                        title="Xóa checkpoint"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>

                <div className="space-y-1">
                  {!cp.imageUrl && (
                    <span className="text-[11px] font-extrabold text-muted-foreground">
                      Chặng {cp.checkpointOrder} {cp.dayNo ? `• Ngày ${cp.dayNo}` : ''}
                    </span>
                  )}
                  <strong className="block text-xs font-bold text-foreground line-clamp-1">
                    {cp.title}
                  </strong>
                  {cp.locationName && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 line-clamp-1">
                      <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                      {cp.locationName}
                    </p>
                  )}
                  {cp.description && (
                    <p className="text-[10.5px] text-muted-foreground/90 line-clamp-2 mt-1">
                      {cp.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-2 mt-2 border-t border-border/40 text-[10.5px]">
                  {(cp.plannedStartAt || cp.plannedEndAt) && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 font-medium text-muted-foreground">
                      <Clock className="h-3 w-3 shrink-0 text-primary" />
                      {[cp.plannedStartAt, cp.plannedEndAt].filter(Boolean).join(' - ')}
                    </span>
                  )}

                  {cp.latitude !== null && cp.latitude !== undefined && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-primary">
                      <MapPinned className="h-3 w-3 shrink-0" />
                      {cp.latitude?.toFixed(2)}, {cp.longitude?.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
