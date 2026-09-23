import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { getSafeImageUrl } from '@/utils/sanitize';

export type AppAvatarSize = 'xs' | 'sm' | 'md' | 'lg';

export interface AppAvatarProps {

  name?: string;
  src?: string | null;
  size?: AppAvatarSize;

  badge?: ReactNode;
  className?: string;
}

const SIZE_STYLES: Record<AppAvatarSize, string> = {
  xs: 'h-5 w-5 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-11 w-11 text-xs',
  lg: 'h-14 w-14 text-sm',
};

export function getAvatarInitials(name?: string): string {
  return (
    (name || '')
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((word) => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'T'
  );
}

export function AppAvatar({ name = '', src, size = 'md', badge, className }: AppAvatarProps) {
  const safeSrc = getSafeImageUrl(src);

  return (
    <div className={cn('relative shrink-0', className)}>
      {safeSrc ? (
        <img
          src={safeSrc}
          alt={name || 'Ảnh đại diện'}
          className={cn('rounded-full border border-border object-cover', SIZE_STYLES[size])}
        />
      ) : (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-secondary font-bold text-primary',
            SIZE_STYLES[size]
          )}
        >
          {getAvatarInitials(name)}
        </div>
      )}
      {badge ? (
        <div className="absolute -right-0.5 -bottom-0.5 flex items-center justify-center rounded-full bg-primary text-white">
          {badge}
        </div>
      ) : null}
    </div>
  );
}
