import { PortalStatusBadge } from '@/shared/ui';
import type { ApiStatus } from '../types';

const STATUS_CONFIG: Record<
  ApiStatus,
  { label: string; variant: 'success' | 'warning' | 'destructive' | 'neutral' }
> = {
  PUBLISHED: { label: 'Đã công khai', variant: 'success' },
  DRAFT: { label: 'Bản nháp', variant: 'neutral' },
  HIDDEN: { label: 'Đã ẩn', variant: 'destructive' },
};

interface TourStatusBadgeProps {
  status: ApiStatus;
}

export function TourStatusBadge({ status }: TourStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: 'neutral' as const };

  return <PortalStatusBadge label={config.label} variant={config.variant} />;
}
