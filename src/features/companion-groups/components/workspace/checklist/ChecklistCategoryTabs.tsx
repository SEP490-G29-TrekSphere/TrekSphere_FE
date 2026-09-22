import { Tent, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ChecklistCategoryFilter = 'ALL' | 'PERSONAL' | 'SHARED';

interface ChecklistCategoryTabsProps {
  activeCategory: ChecklistCategoryFilter;
  onSelectCategory: (category: ChecklistCategoryFilter) => void;
  totalCount: number;
  personalItemsCount: number;
  sharedItemsCount: number;
}

export function ChecklistCategoryTabs({
  activeCategory,
  onSelectCategory,
  totalCount,
  personalItemsCount,
  sharedItemsCount,
}: ChecklistCategoryTabsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => onSelectCategory('ALL')}
          className={cn(
            'rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer',
            activeCategory === 'ALL'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted'
          )}
        >
          Tất cả ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => onSelectCategory('PERSONAL')}
          className={cn(
            'rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5',
            activeCategory === 'PERSONAL'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted'
          )}
        >
          <User className="h-3.5 w-3.5" />
          Đồ cá nhân ({personalItemsCount})
        </button>
        <button
          type="button"
          onClick={() => onSelectCategory('SHARED')}
          className={cn(
            'rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5',
            activeCategory === 'SHARED'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted'
          )}
        >
          <Tent className="h-3.5 w-3.5" />
          Đồ dùng chung ({sharedItemsCount})
        </button>
      </div>

      <span className="text-xs text-muted-foreground italic">
        *Nhấn vào thẻ đồ dùng để đánh dấu đã chuẩn bị
      </span>
    </div>
  );
}
