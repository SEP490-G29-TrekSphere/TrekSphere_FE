import type { VendorStatus } from '../types';

interface VendorStatusBadgeProps {
  status: VendorStatus;
}

const STATUS_BADGE_CONFIG: Record<VendorStatus, { label: string; color: string; bgColor: string }> =
  {
    PENDING: { label: 'Chờ hoạt động', color: '#B45309', bgColor: 'rgba(180, 83, 9, 0.1)' },
    ACTIVE: { label: 'Đang hoạt động', color: '#16A34A', bgColor: 'rgba(22, 163, 74, 0.1)' },
    SUSPENDED: {
      label: 'Tạm ngưng hoạt động',
      color: '#DC2626',
      bgColor: 'rgba(220, 38, 38, 0.1)',
    },
  };

export function VendorStatusBadge({ status }: VendorStatusBadgeProps) {
  const { label, color, bgColor } = STATUS_BADGE_CONFIG[status];

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
      style={{ color, backgroundColor: bgColor }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
