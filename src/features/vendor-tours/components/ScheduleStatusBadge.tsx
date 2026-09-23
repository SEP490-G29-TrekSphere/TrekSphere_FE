import { PortalStatusBadge } from '@/shared/ui';
import type { ApiScheduleStatus } from '../types';

const STATUS_CONFIG: Record<
  ApiScheduleStatus,
  { label: string; variant: 'success' | 'warning' | 'destructive' | 'neutral' | 'info' }
> = {
  OPEN: { label: 'Đang mở', variant: 'success' },
  CLOSED: { label: 'Đã đóng', variant: 'neutral' },
  CANCELLED: { label: 'Đã hủy', variant: 'destructive' },
  COMPLETED: { label: 'Đã hoàn thành', variant: 'info' },
};

interface ScheduleStatusBadgeProps {
  status: ApiScheduleStatus;
}

export function ScheduleStatusBadge({ status }: ScheduleStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: 'neutral' as const };

  return <PortalStatusBadge label={config.label} variant={config.variant} />;
}
