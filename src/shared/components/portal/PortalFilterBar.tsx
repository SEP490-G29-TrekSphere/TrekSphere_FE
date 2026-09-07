import { Search, X } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AppButton, AppInput } from '@/shared/ui';

export interface PortalFilterTab<T = string> {
  key: T;
  label: string;
  count?: number;
}

export interface PortalFilterBarProps<T = string> {
  // Tabs filter
  tabs?: PortalFilterTab<T>[];
  activeTab?: T;
  onTabChange?: (key: T) => void;

  // Search input
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  onSearchSubmit?: (e: FormEvent) => void;
  onSearchClear?: () => void;

  // Custom filters (e.g. Select dropdowns, date pickers)
  filters?: ReactNode;

  // Additional actions (e.g. Refresh button, Export button)
  actions?: ReactNode;

  className?: string;
}

export function PortalFilterBar<T = string>({
  tabs,
  activeTab,
  onTabChange,
  searchPlaceholder = 'Tìm kiếm...',
  searchValue,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  filters,
  actions,
  className = '',
}: PortalFilterBarProps<T>) {
  const hasSearch = searchValue !== undefined && onSearchChange !== undefined;

  return (
    <div className={cn('flex flex-col gap-4 border-b border-[#E5E4DE] pb-4', className)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Tabs Filter */}
        {tabs && tabs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={String(tab.key)}
                  type="button"
                  onClick={() => onTabChange?.(tab.key)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer select-none',
                    isActive
                      ? 'bg-[#0B3025] text-white shadow-sm'
                      : 'bg-white border border-[#E5E4DE] text-zinc-600 hover:bg-[#FAF9F5]'
                  )}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      className={cn('ml-1.5 text-xs', isActive ? 'opacity-80' : 'text-zinc-500')}
                    >
                      ({tab.count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Right side: Search + Custom Filters + Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {filters}

          {hasSearch && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSearchSubmit?.(e);
              }}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                <AppInput
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-9 pr-8 bg-white border-[#E5E4DE] rounded-xl text-sm h-10"
                />
                {searchValue && onSearchClear && (
                  <button
                    type="button"
                    onClick={onSearchClear}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5 rounded-full cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {onSearchSubmit && (
                <AppButton
                  type="submit"
                  variant="outline"
                  className="border-[#E5E4DE] text-zinc-700 font-bold rounded-xl h-10 px-4"
                >
                  Tìm
                </AppButton>
              )}
            </form>
          )}

          {actions}
        </div>
      </div>
    </div>
  );
}
