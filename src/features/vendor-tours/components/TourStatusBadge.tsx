import { PortalStatusBadge } from '@/shared/ui';
import type { ApiStatus } from '../types';

const STATUS_CONFIG: Record<
  ApiStatus,
  { label: string; variant: 'success' | 'warning' | 'destructive' | 'neutral' }
> = {
  APPROVED: { label: 'Đã duyệt', variant: 'success' },
  PENDING_APPROVAL: { label: 'Đang chờ duyệt', variant: 'warning' },
  DRAFT: { label: 'Bản nháp', variant: 'neutral' },
  REJECTED: { label: 'Bị từ chối', variant: 'destructive' },
  HIDDEN: { label: 'Đã ẩn', variant: 'neutral' },
};

interface TourStatusBadgeProps {
  status: ApiStatus;
}

export function TourStatusBadge({ status }: TourStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: 'neutral' as const };

  return <PortalStatusBadge label={config.label} variant={config.variant} />;
}
