import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type PortalStatusType =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'PROCESSING'
  | 'SUSPENDED';

export interface PortalStatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status?: PortalStatusType | string;
  label?: string;
  variant?: 'success' | 'warning' | 'destructive' | 'neutral' | 'info';
  withDot?: boolean;
}

const statusConfigMap: Record<
  string,
  { label: string; bg: string; text: string; dot: string; border: string }
> = {
  // Success states
  APPROVED: {
    label: 'ĐÃ DUYỆT',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-600',
    border: 'border-emerald-200',
  },
  ACTIVE: {
    label: 'HOẠT ĐỘNG',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-600',
    border: 'border-emerald-200',
  },
  COMPLETED: {
    label: 'HOÀN THÀNH',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-600',
    border: 'border-emerald-200',
  },
  SUCCESS: {
    label: 'THÀNH CÔNG',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-600',
    border: 'border-emerald-200',
  },

  // Warning states
  PENDING: {
    label: 'CHỜ DUYỆT',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    border: 'border-amber-200',
  },
  PROCESSING: {
    label: 'ĐANG XỬ LÝ',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    border: 'border-amber-200',
  },

  // Destructive / Rejected states
  REJECTED: {
    label: 'TỪ CHỐI',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    dot: 'bg-rose-600',
    border: 'border-rose-200',
  },
  CANCELLED: {
    label: 'ĐÃ HỦY',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    dot: 'bg-rose-600',
    border: 'border-rose-200',
  },
  SUSPENDED: {
    label: 'TẠM KHÓA',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    dot: 'bg-rose-600',
    border: 'border-rose-200',
  },

  // Neutral / Draft states
  DRAFT: {
    label: 'NHÁP',
    bg: 'bg-zinc-100',
    text: 'text-zinc-700',
    dot: 'bg-zinc-500',
    border: 'border-zinc-200',
  },
  INACTIVE: {
    label: 'VÔ HIỆU',
    bg: 'bg-zinc-100',
    text: 'text-zinc-600',
    dot: 'bg-zinc-400',
    border: 'border-zinc-200',
  },
};

export function PortalStatusBadge({
  status = '',
  label,
  variant,
  withDot = true,
  className,
  ...props
}: PortalStatusBadgeProps) {
  const normalizedKey = String(status).toUpperCase();
  const config = statusConfigMap[normalizedKey];

  let bgClass = config?.bg || 'bg-zinc-100';
  let textClass = config?.text || 'text-zinc-700';
  let dotClass = config?.dot || 'bg-zinc-500';
  let borderClass = config?.border || 'border-zinc-200';

  if (variant === 'success') {
    bgClass = 'bg-emerald-50';
    textClass = 'text-emerald-700';
    dotClass = 'bg-emerald-600';
    borderClass = 'border-emerald-200';
  } else if (variant === 'warning') {
    bgClass = 'bg-amber-50';
    textClass = 'text-amber-700';
    dotClass = 'bg-amber-500';
    borderClass = 'border-amber-200';
  } else if (variant === 'destructive') {
    bgClass = 'bg-rose-50';
    textClass = 'text-rose-700';
    dotClass = 'bg-rose-600';
    borderClass = 'border-rose-200';
  } else if (variant === 'neutral') {
    bgClass = 'bg-zinc-100';
    textClass = 'text-zinc-700';
    dotClass = 'bg-zinc-500';
    borderClass = 'border-zinc-200';
  } else if (variant === 'info') {
    bgClass = 'bg-blue-50';
    textClass = 'text-blue-700';
    dotClass = 'bg-blue-600';
    borderClass = 'border-blue-200';
  }

  const displayText = label || config?.label || status || 'N/A';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors select-none',
        bgClass,
        textClass,
        borderClass,
        className
      )}
      {...props}
    >
      {withDot && <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotClass)} />}
      {displayText}
    </span>
  );
}
