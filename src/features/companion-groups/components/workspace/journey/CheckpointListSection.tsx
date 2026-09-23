import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Compass,
  Eye,
  GripVertical,
  Loader2,
  MapPin,
  MapPinned,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/store/useToastStore';
import { useSwapGroupCheckpoints } from '../../../hooks/useGroupJourneyWorkspace';
import type { CustomJourneyCheckpointResponse } from '../../../types/workspace';
import { formatCheckpointTime } from '../../../utils/checkpointTime';

interface CheckpointListSectionProps {
  groupId?: string;
  checkpoints: CustomJourneyCheckpointResponse[];
  canEdit: boolean;
  onAddCheckpoint: () => void;
  onViewCheckpoint: (checkpoint: CustomJourneyCheckpointResponse) => void;
  onEditCheckpoint: (checkpoint: CustomJourneyCheckpointResponse) => void;
  onDeleteCheckpoint: (checkpoint: CustomJourneyCheckpointResponse) => void;
}

export function CheckpointListSection({
  groupId,
  checkpoints,
  canEdit,
  onAddCheckpoint,
  onViewCheckpoint,
  onEditCheckpoint,
  onDeleteCheckpoint,
}: CheckpointListSectionProps) {
  const swapMutation = useSwapGroupCheckpoints(groupId || '');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  function handleSwap(sourceId: string, targetId: string) {
    if (!groupId || sourceId === targetId || swapMutation.isPending) return;

    swapMutation.mutate(
      {
        checkpointId: sourceId,
        targetCheckpointId: targetId,
      },
      {
        onSuccess: () => {
          toast.success('Đã đổi thứ tự chặng thành công!');
        },
        onError: (err: unknown) => {
          toast.error(
            err instanceof Error ? err.message : 'Không thể đổi thứ tự chặng. Vui lòng thử lại!'
          );
        },
      }
    );
  }

  function handleDragStart(e: React.DragEvent, id: string) {
    if (!canEdit) return;
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    if (!canEdit || !draggedId || draggedId === id) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverId !== id) {
      setDragOverId(id);
    }
  }

  function handleDragLeave(_e: React.DragEvent, id: string) {
    if (dragOverId === id) {
      setDragOverId(null);
    }
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    setDragOverId(null);
    const sourceId = e.dataTransfer.getData('text/plain') || draggedId;
    if (sourceId && sourceId !== targetId) {
      handleSwap(sourceId, targetId);
    }
    setDraggedId(null);
  }

  function handleDragEnd() {
    setDraggedId(null);
    setDragOverId(null);
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            <h3 className="text-base font-extrabold text-foreground">
              Checkpoint dự kiến ({checkpoints.length})
            </h3>
            {swapMutation.isPending && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin" />
                Đang đổi thứ tự...
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Các mốc dừng chân dự kiến trên cung đường —{' '}
            {canEdit
              ? 'có thể kéo thả hoặc bấm nút mũi tên để đổi chéo thứ tự.'
              : 'dùng để check-in và định hướng di chuyển.'}
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
        <div role="list" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {checkpoints.map((cp, index) => {
            const cpId = cp.customJourneyCheckpointId || cp.id || '';
            const isDragging = draggedId === cpId;
            const isDragOver = dragOverId === cpId;
            const prevCp = index > 0 ? checkpoints[index - 1] : null;
            const nextCp = index < checkpoints.length - 1 ? checkpoints[index + 1] : null;
            const prevCpId = prevCp ? prevCp.customJourneyCheckpointId || prevCp.id || '' : '';
            const nextCpId = nextCp ? nextCp.customJourneyCheckpointId || nextCp.id || '' : '';

            return (
              <div
                key={cpId}
                role="listitem"
                draggable={canEdit && !swapMutation.isPending}
                onDragStart={(e) => handleDragStart(e, cpId)}
                onDragOver={(e) => handleDragOver(e, cpId)}
                onDragLeave={(e) => handleDragLeave(e, cpId)}
                onDrop={(e) => handleDrop(e, cpId)}
                onDragEnd={handleDragEnd}
                className={`group relative flex flex-col justify-between rounded-xl border p-3 text-xs overflow-hidden transition-all duration-200 shadow-2xs ${
                  isDragging
                    ? 'opacity-40 border-dashed border-primary scale-[0.98]'
                    : isDragOver
                      ? 'border-primary ring-2 ring-primary/40 bg-primary/5 scale-[1.02] shadow-md'
                      : 'border-border bg-background hover:border-primary/50'
                }`}
              >
                {/* Visual Drag Handle & Order Badge */}
                <div className="flex items-center justify-between pb-2 mb-1 border-b border-border/40">
                  <div className="flex items-center gap-1.5">
                    {canEdit && (
                      <div
                        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-0.5 rounded-md hover:bg-muted"
                        title="Kéo thả để đổi thứ tự chặng"
                      >
                        <GripVertical className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10.5px] font-extrabold text-primary">
                      Chặng {cp.checkpointOrder} {cp.dayNo ? `• Ngày ${cp.dayNo}` : ''}
                    </span>
                  </div>

                  {/* Actions (View, Edit, Delete, Quick Reorder) */}
                  <div className="flex items-center gap-1">
                    {canEdit && (
                      <div className="flex items-center mr-1 border-r border-border/60 pr-1">
                        <button
                          type="button"
                          disabled={!prevCp || swapMutation.isPending}
                          onClick={() => prevCpId && handleSwap(cpId, prevCpId)}
                          className="rounded-md p-1 text-muted-foreground hover:text-primary hover:bg-muted disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                          title={
                            prevCp
                              ? `Đổi thứ tự với Chặng ${prevCp.checkpointOrder}`
                              : 'Đây là chặng đầu tiên'
                          }
                        >
                          <ArrowLeft className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          disabled={!nextCp || swapMutation.isPending}
                          onClick={() => nextCpId && handleSwap(cpId, nextCpId)}
                          className="rounded-md p-1 text-muted-foreground hover:text-primary hover:bg-muted disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                          title={
                            nextCp
                              ? `Đổi thứ tự với Chặng ${nextCp.checkpointOrder}`
                              : 'Đây là chặng cuối cùng'
                          }
                        >
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => onViewCheckpoint(cp)}
                      className="rounded-md p-1 text-muted-foreground hover:text-primary hover:bg-muted transition cursor-pointer"
                      title="Xem chi tiết"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>

                    {canEdit && (
                      <>
                        <button
                          type="button"
                          onClick={() => onEditCheckpoint(cp)}
                          className="rounded-md p-1 text-muted-foreground hover:text-primary hover:bg-muted transition cursor-pointer"
                          title="Sửa checkpoint"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCheckpoint(cp)}
                          className="rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition cursor-pointer"
                          title="Xóa checkpoint"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Checkpoint Image if exists */}
                {cp.imageUrl && (
                  <div className="h-24 w-full -mx-3 mb-2.5 overflow-hidden border-y border-border relative">
                    <img
                      src={cp.imageUrl}
                      alt={cp.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="space-y-1">
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

                {/* Footer Time & Coords */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 mt-2 border-t border-border/40 text-[10.5px]">
                  {(cp.plannedStartAt || cp.plannedEndAt) && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 font-medium text-muted-foreground">
                      <Clock className="h-3 w-3 shrink-0 text-primary" />
                      {[cp.plannedStartAt, cp.plannedEndAt]
                        .map(formatCheckpointTime)
                        .filter(Boolean)
                        .join(' - ')}
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
