import { Pencil, Trash2 } from 'lucide-react';
import { formatDate, formatPrice } from '@/utils/format';
import type { TourSchedule } from '../types';
import { ScheduleStatusBadge } from './ScheduleStatusBadge';

/** Lịch đã hoàn thành hoặc đã hủy thì không sửa được nữa (khớp mã lỗi `SCHEDULE_NOT_EDITABLE` của BE). */
const EDITABLE_SCHEDULE_STATUSES = new Set(['OPEN', 'CLOSED']);

interface ScheduleTableRowProps {
  schedule: TourSchedule;
  /** Chỉ truyền (màn Manager) nếu muốn hiện nút Sửa — Staff không có quyền này. */
  onEditClick?: (schedule: TourSchedule) => void;
  /** Chỉ truyền (màn Manager) nếu muốn hiện nút Xóa lịch — Staff không có quyền này. */
  onDeleteClick?: (schedule: TourSchedule) => void;
}

export function ScheduleTableRow({ schedule, onEditClick, onDeleteClick }: ScheduleTableRowProps) {
  // Màn Staff không truyền hành động nào — khi đó bỏ hẳn ô "Thao tác" để số cột
  // của dòng khớp với header (Staff cũng bỏ cột này khỏi `TABLE_COLUMNS`).
  const hasActions = Boolean(onEditClick || onDeleteClick);
  const hasBookings = schedule.bookedSlots > 0;
  const isEditable = EDITABLE_SCHEDULE_STATUSES.has(schedule.status);
  const remainingSlots = Math.max(0, schedule.availableSlots);

  return (
    <tr className="border-b transition-colors last:border-b-0" style={{ borderColor: '#E6E2D1' }}>
      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <span className="font-semibold" style={{ color: '#06261D' }}>
          {formatDate(schedule.departureDate)}
        </span>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <span className="text-sm font-medium" style={{ color: '#6F7B75' }}>
          {formatDate(schedule.returnDate)}
        </span>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <span className="font-semibold" style={{ color: '#06261D' }}>
          {formatPrice(schedule.price)}đ
        </span>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <span className="text-sm font-medium" style={{ color: '#06261D' }}>
          Đã đặt {schedule.bookedSlots} chỗ
        </span>
        <span className="block text-xs" style={{ color: '#6F7B75' }}>
          Còn trống {remainingSlots} chỗ
        </span>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <ScheduleStatusBadge status={schedule.status} />
      </td>

      {hasActions && (
        <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
          <div className="flex items-center gap-3">
            {onEditClick && (
              <button
                type="button"
                onClick={() => onEditClick(schedule)}
                disabled={!isEditable}
                className="transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
                style={{ color: '#06261D' }}
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
                className="transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
                style={{ color: '#DC2626' }}
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
