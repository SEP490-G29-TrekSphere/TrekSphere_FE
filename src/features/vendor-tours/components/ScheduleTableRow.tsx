import { Pencil, Trash2 } from 'lucide-react';
import { formatDate } from '@/utils/format';
import type { TourSchedule } from '../types';
import { ScheduleStatusBadge } from './ScheduleStatusBadge';

const EDITABLE_SCHEDULE_STATUSES = new Set(['OPEN', 'CLOSED']);

interface ScheduleTableRowProps {
  schedule: TourSchedule;

  onEditClick?: (schedule: TourSchedule) => void;

  onDeleteClick?: (schedule: TourSchedule) => void;
}

export function ScheduleTableRow({ schedule, onEditClick, onDeleteClick }: ScheduleTableRowProps) {

  const hasActions = Boolean(onEditClick || onDeleteClick);
  const hasBookings = schedule.bookedSlots > 0;
  const isEditable = EDITABLE_SCHEDULE_STATUSES.has(schedule.status);
  const remainingSlots = Math.max(0, schedule.availableSlots);

  return (
    <tr className="border-b border-border transition-colors last:border-b-0">
      <td className="px-6 py-4 align-middle">
        <span className="font-semibold text-foreground">
          {formatDate(schedule.departureDate)}
        </span>
      </td>

      <td className="px-6 py-4 align-middle">
        <span className="text-sm font-medium text-muted-foreground">
          {formatDate(schedule.returnDate)}
        </span>
      </td>

      <td className="px-6 py-4 align-middle">
        <span className="text-sm font-medium text-foreground">
          Đã đặt {schedule.bookedSlots} chỗ
        </span>
        <span className="block text-xs text-muted-foreground">
          Còn trống {remainingSlots} chỗ
        </span>
      </td>

      <td className="px-6 py-4 align-middle">
        <ScheduleStatusBadge status={schedule.status} />
      </td>

      {hasActions && (
        <td className="px-6 py-4 align-middle">
          <div className="flex items-center gap-3">
            {onEditClick && (
              <button
                type="button"
                onClick={() => onEditClick(schedule)}
                disabled={!isEditable}
                className="text-foreground transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
                title={
                  isEditable
                    ? 'Sửa lịch khởi hành'
                    : 'Lịch đã hoàn thành hoặc đã hủy, không thể chỉnh sửa'
                }
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {onDeleteClick && (
              <button
                type="button"
                onClick={() => onDeleteClick(schedule)}
                disabled={hasBookings || !isEditable}
                aria-label="Xóa lịch khởi hành"
                className="text-destructive transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
                title={
                  hasBookings
                    ? 'Không thể xóa lịch đã có khách đặt'
                    : !isEditable
                      ? 'Lịch đã hoàn thành hoặc đã hủy, không thể xóa'
                      : 'Xóa lịch khởi hành'
                }
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
}
