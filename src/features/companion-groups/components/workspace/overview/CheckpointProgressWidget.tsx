import { Check, Clock, MapPin, Radio, RotateCcw, SkipForward, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { RichTextContent } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import {
  useGroupCheckpoints,
  useResetCheckpointProgress,
  useUpdateCheckpointProgress,
} from '../../../hooks/useGroupJourneyWorkspace';
import { formatCheckpointTime } from '../../../utils/checkpointTime';

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
  const checkedInCount = checkpoints.filter((cp) => cp.status === 'CHECKED_IN').length;

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Radio className={cn('h-4 w-4', isTripInProgress && 'animate-pulse')} />
          </div>
          <div>
            <h4 className="font-extrabold text-foreground text-sm sm:text-base">
              Nhật Ký Tiến Trình Hành Trình
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Theo dõi và cập nhật các điểm Checkpoint thực tế trên cung đường ({checkedInCount}/
              {total} điểm đã đến)
            </p>
          </div>
        </div>
        {isTripInProgress ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            Đang diễn ra (Live)
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {total} điểm dừng
          </span>
        )}
      </div>

      <div className="space-y-3">
        {checkpoints.map((checkpoint, index) => {
          const checkpointId = checkpoint.customJourneyCheckpointId;
          const isActing = actingCheckpointId === checkpointId;
          const status = checkpoint.status ?? 'PENDING';
          const order = checkpoint.checkpointOrder ?? index + 1;
          const timeRange =
            checkpoint.plannedStartAt || checkpoint.plannedEndAt
              ? [checkpoint.plannedStartAt, checkpoint.plannedEndAt]
                  .map(formatCheckpointTime)
                  .filter(Boolean)
                  .join(' - ')
              : null;

          return (
            <div
              key={checkpointId}
              className={cn(
                'flex flex-col sm:flex-row sm:items-start justify-between gap-3.5 rounded-2xl border p-4 transition-all duration-200',
                status === 'CHECKED_IN'
                  ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10'
                  : status === 'SKIPPED'
                    ? 'border-border/60 bg-muted/20 opacity-75'
                    : 'border-border bg-card shadow-2xs hover:border-primary/40'
              )}
            >
              {/* Left & Content */}
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-extrabold text-xs shadow-xs',
                    status === 'CHECKED_IN' && 'bg-emerald-600 text-white',
                    status === 'SKIPPED' && 'bg-muted text-muted-foreground border border-border',
                    status === 'PENDING' && 'bg-primary/10 text-primary border border-primary/20'
                  )}
                >
                  {status === 'CHECKED_IN' ? (
                    <Check className="h-4 w-4 stroke-[2.5]" />
                  ) : status === 'SKIPPED' ? (
                    <X className="h-4 w-4 stroke-[2.5]" />
                  ) : (
                    order
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10.5px] font-extrabold text-primary">
                      Chặng {order} {checkpoint.dayNo ? `• Ngày ${checkpoint.dayNo}` : ''}
                    </span>
                    {timeRange && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                        <Clock className="h-3 w-3 text-amber-500 shrink-0" />
                        {timeRange}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="font-bold text-foreground text-sm leading-snug">
                    {checkpoint.title}
                  </h4>

                  {/* Location Name */}
                  {checkpoint.locationName && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                      <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      <span>{checkpoint.locationName}</span>
                    </p>
                  )}

                  {/* Rich Description */}
                  {checkpoint.description && (
                    <div className="line-clamp-2 overflow-hidden mt-1">
                      <RichTextContent
                        content={checkpoint.description}
                        variant="compact"
                        className="text-xs text-muted-foreground/90 [&_p]:my-0.5 [&_p]:leading-relaxed [&_ul]:my-0.5 [&_ul]:space-y-0.5 [&_li]:text-xs [&_strong]:text-foreground [&_b]:text-foreground"
                      />
                    </div>
                  )}

                  {/* Check-in status info */}
                  {status !== 'PENDING' && (
                    <div className="pt-1 flex items-center gap-2 text-xs">
                      <span
                        className={cn(
                          'font-bold inline-flex items-center gap-1',
                          status === 'CHECKED_IN'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-muted-foreground'
                        )}
                      >
                        {status === 'CHECKED_IN' ? '✓ Đã check-in' : '✕ Đã bỏ qua'}
                        {checkpoint.progressUpdatedByName
                          ? ` (bởi ${checkpoint.progressUpdatedByName})`
                          : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Optional Thumbnail & Actions */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2.5 shrink-0 self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                {checkpoint.imageUrl && (
                  <div className="h-16 w-24 sm:w-28 rounded-xl overflow-hidden border border-border shrink-0 bg-muted/30">
                    <img
                      src={checkpoint.imageUrl}
                      alt={checkpoint.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                  {status === 'PENDING' && canManage && (
                    <>
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => handleUpdate(checkpointId, 'CHECKED_IN')}
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-xs cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Check className="h-3.5 w-3.5" /> Check-in
                      </button>
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => handleUpdate(checkpointId, 'SKIPPED')}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <SkipForward className="h-3.5 w-3.5" /> Bỏ qua
                      </button>
                    </>
                  )}

                  {status === 'PENDING' && !canManage && (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                      Chờ check-in
                    </span>
                  )}

                  {status !== 'PENDING' && canManage && (
                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => handleReset(checkpointId)}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                      title="Gỡ trạng thái check-in"
                    >
                      <RotateCcw className="h-3 w-3" /> Gỡ
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
