import { CalendarClock } from 'lucide-react';
import { formatDate } from '@/utils/format';
import { SCHEDULE_CONFLICT_KIND_LABELS } from '../constants';
import type { ScheduleConflict } from '../types/matchingGroup';

interface ScheduleConflictNoticeProps {
  conflicts: ScheduleConflict[];
  /** Câu hướng dẫn người dùng nên làm gì tiếp theo. */
  hint: string;
  className?: string;
}

/**
 * Cảnh báo trùng ngày đi dự kiến: liệt kê các nhóm đang chiếm ngày đó để người
 * dùng biết phải rút đơn hoặc rời nhóm nào trước khi đăng ký chuyến mới.
 */
export function ScheduleConflictNotice({
  conflicts,
  hint,
  className,
}: ScheduleConflictNoticeProps) {
  if (conflicts.length === 0) return null;

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 ${className ?? ''}`}
    >
      <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
      <div className="space-y-1.5 text-xs">
        <p className="font-bold text-destructive">Trùng ngày đi dự kiến</p>
        <ul className="space-y-1 text-muted-foreground">
          {conflicts.map((conflict) => (
            <li key={`${conflict.matchingGroupId}-${conflict.kind}`}>
              <span className="font-semibold text-foreground">{conflict.groupName}</span> khởi hành{' '}
              {formatDate(conflict.targetDate)} ({SCHEDULE_CONFLICT_KIND_LABELS[conflict.kind]}).
            </li>
          ))}
        </ul>
        <p className="text-muted-foreground leading-relaxed">{hint}</p>
      </div>
    </div>
  );
}
