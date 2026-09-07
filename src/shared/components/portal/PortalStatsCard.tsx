import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AppCard, AppCardContent, AppSpinner } from '@/shared/ui';

export interface PortalStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number | string;
    isPositive?: boolean;
    label?: string;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info';
  loading?: boolean;
  className?: string;
}

const variantIconStyles: Record<string, { bg: string; text: string }> = {
  default: { bg: 'bg-zinc-100', text: 'text-zinc-700' },
  primary: { bg: 'bg-[#0B3025]/10', text: 'text-[#0B3025]' },
  success: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-700' },
  info: { bg: 'bg-blue-50', text: 'text-blue-700' },
};

export function PortalStatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = 'primary',
  loading = false,
  className = '',
}: PortalStatsCardProps) {
  const iconStyle = variantIconStyles[variant] || variantIconStyles.primary;

  return (
    <AppCard
      className={cn(
        'border-[#E5E4DE] shadow-sm rounded-2xl overflow-hidden bg-white hover:border-[#D1D0C9] transition-all',
        className
      )}
    >
      <AppCardContent className="p-5 flex flex-col justify-between h-full gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
              {title}
            </p>
            {loading ? (
              <div className="h-8 flex items-center">
                <AppSpinner size="sm" />
              </div>
            ) : (
              <h3 className="text-2xl font-extrabold tracking-tight text-[#06261D] truncate">
                {value}
              </h3>
            )}
          </div>
          <div className={cn('p-3 rounded-xl shrink-0', iconStyle.bg, iconStyle.text)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {(trend || description) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-zinc-100">
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-bold',
                  trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
                )}
              >
                {trend.isPositive ? (
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 shrink-0" />
                )}
                {typeof trend.value === 'number' ? `${trend.value}%` : trend.value}
              </span>
            )}
            {trend?.label && <span>{trend.label}</span>}
            {!trend && description && <span className="truncate">{description}</span>}
          </div>
        )}
      </AppCardContent>
    </AppCard>
  );
}

export interface PortalStatsGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function PortalStatsGrid({ children, columns = 4, className = '' }: PortalStatsGridProps) {
  const colClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return <div className={cn('grid gap-4', colClasses, className)}>{children}</div>;
}
