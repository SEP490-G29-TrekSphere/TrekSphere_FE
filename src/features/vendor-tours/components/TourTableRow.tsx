import { CalendarClock, Eye, EyeOff, Pencil, Send, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '@/utils/format';
import type { ApiStatus, VendorTourListItem } from '../types';
import { TourDifficultyBadge } from './TourDifficultyBadge';
import { TourStatusBadge } from './TourStatusBadge';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=120&h=120&fit=crop';

export const SCHEDULABLE_STATUSES = new Set<ApiStatus>(['DRAFT', 'PUBLISHED']);

export const NOT_SCHEDULABLE_REASON = 'Tour đang bị ẩn, không thể tạo lịch khởi hành';

export const MANAGER_EDITABLE_STATUSES = new Set<ApiStatus>(['DRAFT', 'PUBLISHED', 'HIDDEN']);

interface TourTableRowProps {
  tour: VendorTourListItem;

  editPath: string;

  previewPath: string;

  schedulesPath: string;

  editableStatuses: Set<ApiStatus>;
  onDeleteClick?: (tour: VendorTourListItem) => void;

  onPublishClick?: (tour: VendorTourListItem) => void;

  onUnpublishClick?: (tour: VendorTourListItem) => void;
}

export function TourTableRow({
  tour,
  editPath,
  previewPath,
  schedulesPath,
  editableStatuses,
  onDeleteClick,
  onPublishClick,
  onUnpublishClick,
}: TourTableRowProps) {
  const navigate = useNavigate();
  const canEdit = editableStatuses.has(tour.status);
  const canSchedule = SCHEDULABLE_STATUSES.has(tour.status);
  const canPublish = onPublishClick && tour.status === 'DRAFT';
  const canUnpublish = onUnpublishClick && tour.status === 'PUBLISHED';

  return (
    <tr className="border-b transition-colors last:border-b-0" style={{ borderColor: '#E6E2D1' }}>
      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 shrink-0 overflow-hidden rounded-full"
            style={{ backgroundColor: '#F0EEE6' }}
          >
            <img
              src={tour.coverImageUrl ?? FALLBACK_COVER}
              alt={tour.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <span className="font-semibold" style={{ color: '#06261D' }}>
            {tour.name}
          </span>
        </div>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <span className="font-semibold" style={{ color: '#06261D' }}>
          {formatPrice(tour.price)}đ
        </span>
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <TourDifficultyBadge difficulty={tour.difficulty} />
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <TourStatusBadge status={tour.status} />
      </td>

      <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(previewPath)}
            className="transition-opacity hover:opacity-70"
            style={{ color: '#0E7C6B' }}
            title="Xem trước"
          >
            <Eye className="h-4 w-4" />
          </button>
          {canEdit && (
            <button
              type="button"
              onClick={() => navigate(editPath)}
              className="transition-opacity hover:opacity-70"
              style={{ color: '#06261D' }}
              title="Sửa tour"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {canPublish && (
            <button
              type="button"
              onClick={() => onPublishClick(tour)}
              className="transition-opacity hover:opacity-70"
              style={{ color: '#16A34A' }}
              title="Công khai tour"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
          {canUnpublish && (
            <button
              type="button"
              onClick={() => onUnpublishClick(tour)}
              className="transition-opacity hover:opacity-70"
              style={{ color: '#EA580C' }}
              title="Ngừng công khai"
            >
              <EyeOff className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate(schedulesPath)}
            disabled={!canSchedule}
            className="transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-30"
            style={{ color: '#0E7C6B' }}
            title={canSchedule ? 'Lịch khởi hành' : NOT_SCHEDULABLE_REASON}
          >
            <CalendarClock className="h-4 w-4" />
          </button>
          {onDeleteClick && (
            <button
              type="button"
              onClick={() => onDeleteClick(tour)}
              className="text-red-500 transition-colors hover:text-red-600"
              title="Xóa tour"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
