import type { AccountStatus } from '../types';

interface StatusIndicatorProps {
  status: AccountStatus;
}

const STATUS_BADGE_CONFIG: Record<
  AccountStatus,
  { label: string; color: string; bgColor: string }
> = {
  ACTIVE: { label: 'Hoạt động', color: '#16A34A', bgColor: 'rgba(22, 163, 74, 0.1)' },
  LOCKED: { label: 'Bị khóa', color: '#DC2626', bgColor: 'rgba(220, 38, 38, 0.1)' },
  DEACTIVATED: { label: 'Bị khóa', color: '#DC2626', bgColor: 'rgba(220, 38, 38, 0.1)' },
};

export function StatusIndicator({ status }: StatusIndicatorProps) {
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
