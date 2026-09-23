import { Compass, Grid, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MomentViewMode } from '../types';

interface MomentViewSwitcherProps {
  value: MomentViewMode;
  onChange: (mode: MomentViewMode) => void;

  albumCount?: number;
}

const VIEW_OPTIONS = [
  { id: 'timeline', label: 'Dòng thời gian', icon: Layers },
  { id: 'album', label: 'Album ảnh', icon: Grid },
  { id: 'map', label: 'Bản đồ', icon: Compass },
] as const satisfies ReadonlyArray<{ id: MomentViewMode; label: string; icon: typeof Layers }>;

export function MomentViewSwitcher({ value, onChange, albumCount }: MomentViewSwitcherProps) {
  return (
    <div
      role="tablist"
      aria-label="Kiểu hiển thị khoảnh khắc"
      className="flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1"
    >
      {VIEW_OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.id;
        const showCount = option.id === 'album' && albumCount !== undefined;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className={cn(
              'flex flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-bold text-xs transition sm:flex-none',
              isActive
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>
              {option.label}
              {showCount ? ` (${albumCount})` : ''}
            </span>
          </button>
        );
      })}
    </div>
  );
}
