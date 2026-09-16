import type * as React from 'react';
import { cn } from '@/lib/utils';

export type AppBadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'accent'
  | 'warning';

export interface AppBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AppBadgeVariant;
}

const variantStyles: Record<AppBadgeVariant, string> = {
  default: 'border-transparent bg-primary text-white hover:bg-primary/80',
  secondary: 'border-transparent bg-accent text-primary hover:bg-accent/80 font-semibold',
  destructive:
    'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
  outline: 'text-foreground',
  accent: 'border-transparent bg-accent text-primary hover:bg-accent/80 font-semibold',
  warning: 'border-transparent bg-amber-500 text-white hover:bg-amber-600 font-semibold',
};

const baseStyles =
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

export function AppBadge({ className, variant = 'default', ...props }: AppBadgeProps) {
  return <div className={cn(baseStyles, variantStyles[variant], className)} {...props} />;
}
