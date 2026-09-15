import { CheckCircle2, Circle, MapPin, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from '@/store/useToastStore';
import {
  useCheckInCheckpoint,
  useGroupCheckpoints,
  useUndoCheckInCheckpoint,
} from '../../../hooks/useGroupJourneyWorkspace';

interface CheckpointProgressWidgetProps {
  groupId: string;
  isLeader: boolean;
  isTripInProgress: boolean;
}

/** Widget tiến độ checkpoint trong tab Tổng quan — member xem, leader thao tác check-in. */
export function CheckpointProgressWidget({
  groupId,
  isLeader,
  isTripInProgress,
}: CheckpointProgressWidgetProps) {
  const { data: checkpoints = [], isLoading } = useGroupCheckpoints(groupId);
  const checkInMutation = useCheckInCheckpoint(groupId);
  const undoMutation = useUndoCheckInCheckpoint(groupId);
  const [actingCheckpointId, setActingCheckpointId] = useState<string | null>(null);

  const canManage = isLeader && isTripInProgress;
  const doneCount = checkpoints.filter((c) => c.isCheckedIn).length;
  const total = checkpoints.length;

  async function handleCheckIn(checkpointId: string) {
    setActingCheckpointId(checkpointId);
    try {
      await checkInMutation.mutateAsync(checkpointId);
      toast.success('Đã đánh dấu đến điểm dừng!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể check-in điểm dừng này!');
    } finally {
      setActingCheckpointId(null);
    }
  }

  async function handleUndo(checkpointId: string) {
    setActingCheckpointId(checkpointId);
    try {
      await undoMutation.mutateAsync(checkpointId);
      toast.success('Đã gỡ check-in điểm dừng.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể gỡ check-in điểm dừng này!');
    } finally {
      setActingCheckpointId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs animate-pulse space-y-3">
        <div className="h-3.5 w-40 rounded-md bg-muted" />
        <div className="h-2.5 w-full rounded-md bg-muted" />
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
        <h4 className="mb-1.5 font-bold text-muted-foreground text-xs uppercase tracking-wider">
          Tiến độ hành trình
        </h4>
        <p className="text-xs text-muted-foreground">
          Nhóm chưa có điểm dừng nào trong lộ trình. Vào tab "Lộ trình" để thêm điểm dừng.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-3xl border border-border bg-card p-6 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <h4 className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
          Tiến độ hành trình
        </h4>
        <span className="text-xs font-extrabold text-foreground">
          {doneCount}/{total} điểm dừng
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${total > 0 ? (doneCount / total) * 100 : 0}%` }}
        />
      </div>

      <div className="space-y-1.5">
        {checkpoints.map((checkpoint) => {
          const checkpointId = checkpoint.customJourneyCheckpointId;
          const isActing = actingCheckpointId === checkpointId;
          const isCheckedIn = Boolean(checkpoint.isCheckedIn);

          return (
            <div
              key={checkpointId}
              className={cn(
                'flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs',
                isCheckedIn ? 'bg-primary/5' : 'bg-muted/40'
              )}
            >
              <div className="flex min-w-0 items-center gap-2">
                {isCheckedIn ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0">
                  <p
                    className={cn(
                      'truncate font-bold',
                      isCheckedIn ? 'text-foreground' : 'text-foreground/90'
                    )}
                  >
                    {checkpoint.title}
                  </p>
                  {checkpoint.locationName && (
                    <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {checkpoint.locationName}
                    </p>
                  )}
                </div>
              </div>

              {canManage && (
                <button
                  type="button"
                  disabled={isActing}
                  onClick={() =>
                    isCheckedIn ? handleUndo(checkpointId) : handleCheckIn(checkpointId)
                  }
                  className={cn(
                    'shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-60',
                    isCheckedIn
                      ? 'border-border text-muted-foreground hover:bg-muted'
                      : 'border-primary/40 text-primary hover:bg-primary/10'
                  )}
                >
                  {isCheckedIn ? (
                    <span className="inline-flex items-center gap-1">
                      <RotateCcw className="h-3 w-3" /> Gỡ
                    </span>
                  ) : (
                    'Đánh dấu đã đến'
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
