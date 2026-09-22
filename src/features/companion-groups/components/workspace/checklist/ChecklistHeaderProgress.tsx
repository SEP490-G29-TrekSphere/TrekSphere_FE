import { CheckCircle2, Package, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistHeaderProgressProps {
  isChecklistModifiable: boolean;
  isTripOngoing: boolean;
  doneCount: number;
  totalCount: number;
  progressPercent: number;
  onOpenCreateModal: () => void;
}

export function ChecklistHeaderProgress({
  isChecklistModifiable,
  isTripOngoing,
  doneCount,
  totalCount,
  progressPercent,
  onOpenCreateModal,
}: ChecklistHeaderProgressProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 md:p-6 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-foreground">
              Checklist &amp; Phân Công Đồ Dùng Chuyến Đi
            </h3>
            <p className="text-xs text-muted-foreground">
              Chuẩn bị sẵn sàng hành trang cá nhân và phân công vật dụng dùng chung cho cả đoàn.
            </p>
          </div>
        </div>

        {isChecklistModifiable ? (
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary/90 transition shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Thêm đồ dùng mới
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-muted/80 border border-border/80 px-3.5 py-2.5 text-xs font-bold text-muted-foreground shrink-0 select-none">
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                isTripOngoing ? 'bg-sky-500 animate-pulse' : 'bg-muted-foreground'
              )}
            />
            {isTripOngoing
              ? 'Chuyến đi đang diễn ra (Đã chốt hành trang)'
              : 'Chuyến đi đã kết thúc'}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 pt-2 border-t border-border/50">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-foreground flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            Tiến độ chuẩn bị chung:
          </span>
          <span className="font-extrabold text-primary">
            {doneCount}/{totalCount} món ({progressPercent}%)
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
