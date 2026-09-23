import { Check, Radio, RotateCcw, SkipForward, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from '@/store/useToastStore';
import {
  useGroupCheckpoints,
  useResetCheckpointProgress,
  useUpdateCheckpointProgress,
} from '../../../hooks/useGroupJourneyWorkspace';

interface CheckpointProgressWidgetProps {
  groupId: string;
  isLeader: boolean;
  isTripInProgress: boolean;
}

export function CheckpointProgressWidget({
  groupId,
  isLeader,
  isTripInProgress,
}: CheckpointProgressWidgetProps) {
  const { data: checkpoints = [], isLoading } = useGroupCheckpoints(groupId);
  const updateMutation = useUpdateCheckpointProgress(groupId);
  const resetMutation = useResetCheckpointProgress(groupId);
  const [actingCheckpointId, setActingCheckpointId] = useState<string | null>(null);

  const canManage = isLeader && isTripInProgress;
  const total = checkpoints.length;

  async function handleUpdate(checkpointId: string, status: 'CHECKED_IN' | 'SKIPPED') {
    setActingCheckpointId(checkpointId);
    try {
      await updateMutation.mutateAsync({ checkpointId, status });
      toast.success(
        status === 'CHECKED_IN' ? 'Đã đánh dấu đến điểm dừng!' : 'Đã bỏ qua điểm dừng.'
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể cập nhật tiến độ điểm dừng này!');
    } finally {
      setActingCheckpointId(null);
    }
  }

  async function handleReset(checkpointId: string) {
    setActingCheckpointId(checkpointId);
    try {
      await resetMutation.mutateAsync(checkpointId);
      toast.success('Đã gỡ tiến độ điểm dừng.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Không thể gỡ tiến độ điểm dừng này!');
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
          Nhật Ký Tiến Trình Hành Trình
        </h4>
        <p className="text-xs text-muted-foreground">
          Nhóm chưa có điểm dừng nào trong lộ trình. Vào tab "Lộ trình" để thêm điểm dừng.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <Radio className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div>
            <h4 className="font-extrabold text-foreground text-sm">
              Nhật Ký Tiến Trình Hành Trình
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Cập nhật các điểm Checkpoint thực tế trên tuyến trekking.
            </p>
          </div>
        </div>
        {isTripInProgress && (
          <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-extrabold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
            Đang diễn ra (Live)
          </span>
        )}
      </div>

      <div className="space-y-2.5">
        {checkpoints.map((checkpoint, index) => {
          const checkpointId = checkpoint.customJourneyCheckpointId;
          const isActing = actingCheckpointId === checkpointId;
          const status = checkpoint.status ?? 'PENDING';

          return (
            <div
              key={checkpointId}
              className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/20 p-3.5"
            >
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-extrabold text-xs',
                  status === 'CHECKED_IN' && 'bg-emerald-600 text-white',
                  status === 'SKIPPED' && 'bg-muted text-muted-foreground',
                  status === 'PENDING' && 'bg-primary/10 text-primary'
                )}
              >
                {status === 'CHECKED_IN' ? (
                  <Check className="h-3.5 w-3.5" />
                ) : status === 'SKIPPED' ? (
                  <X className="h-3.5 w-3.5" />
                ) : (
                  index + 1
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground text-xs">{checkpoint.title}</p>
                {(checkpoint.description || checkpoint.locationName) && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
                    {checkpoint.description || checkpoint.locationName}
                  </p>
                )}

                {status !== 'PENDING' && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <span
                      className={cn(
                        'text-[11px] font-bold',
                        status === 'CHECKED_IN'
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-muted-foreground'
                      )}
                    >
                      {status === 'CHECKED_IN' ? 'Đã check-in' : 'Đã bỏ qua'}
                      {checkpoint.progressUpdatedByName
                        ? ` bởi ${checkpoint.progressUpdatedByName}`
                        : ''}
                    </span>
                    {canManage && (
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => handleReset(checkpointId)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-foreground transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <RotateCcw className="h-3 w-3" /> Gỡ
                      </button>
                    )}
                  </div>
                )}
              </div>

              {status === 'PENDING' && canManage && (
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    disabled={isActing}
                    onClick={() => handleUpdate(checkpointId, 'CHECKED_IN')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-emerald-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Check className="h-3 w-3" /> Check-in
                  </button>
                  <button
                    type="button"
                    disabled={isActing}
                    onClick={() => handleUpdate(checkpointId, 'SKIPPED')}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-bold text-muted-foreground transition hover:bg-muted cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <SkipForward className="h-3 w-3" /> Bỏ qua
                  </button>
                </div>
              )}

              {status === 'PENDING' && !canManage && (
                <span className="shrink-0 text-[11px] text-muted-foreground">Chưa cập nhật</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
