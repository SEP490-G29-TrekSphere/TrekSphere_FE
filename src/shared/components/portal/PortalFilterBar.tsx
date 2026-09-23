import { ArrowUpDown, Search, X } from 'lucide-react';
import { type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { AppButton } from '@/shared/ui';
import { PortalFilterSelect } from './PortalFilterSelect';

export interface PortalFilterTab<T = string> {
  key: T;
  label: string;
  count?: number;
}

export interface PortalFilterSortOption<T = string> {
  value: T;
  label: string;
}

export interface PortalFilterSort<T = string> {
  value: T;
  onChange: (value: T) => void;
  options: PortalFilterSortOption<T>[];
  label?: string;
  placeholder?: string;
}

export interface PortalFilterBarProps<T = string, S = string> {
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
  debounceMs?: number;
  showSearchButton?: boolean;

  // Sort dropdown
  sort?: PortalFilterSort<S>;

  // Custom filters (e.g. PortalFilterSelect dropdowns, date pickers)
  filters?: ReactNode;

  // Additional actions (e.g. Add button, Export button)
  actions?: ReactNode;

  className?: string;
}

export function PortalFilterBar<T = string, S = string>({
  tabs,
  activeTab,
  onTabChange,
  searchPlaceholder = 'Tìm kiếm...',
  searchValue,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  debounceMs = 350,
  showSearchButton = false,
  sort,
  filters,
  actions,
  className = '',
}: PortalFilterBarProps<T, S>) {
  const hasSearch = searchValue !== undefined && onSearchChange !== undefined;

  // Quản lý internal search state để gõ mượt mà và debounce
  const [internalSearch, setInternalSearch] = useState(searchValue ?? '');

  useEffect(() => {
    setInternalSearch(searchValue ?? '');
  }, [searchValue]);

  useEffect(() => {
    if (!hasSearch || internalSearch === (searchValue ?? '')) return;

    const timer = setTimeout(() => {
      onSearchChange(internalSearch);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [internalSearch, debounceMs, hasSearch, onSearchChange, searchValue]);

  const handleClear = () => {
    setInternalSearch('');
    onSearchChange?.('');
    onSearchClear?.();
  };

  return (
    <div className={cn('flex flex-col gap-4 border-b border-[#E5E4DE] pb-4', className)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left side: Tabs Filter */}
        {tabs && tabs.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
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
                      : 'bg-white border border-[#E5E4DE] text-[#6F7B75] hover:bg-[#FAF9F5] hover:text-[#06261D]'
                  )}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      className={cn(
                        'ml-1.5 text-xs font-semibold',
                        isActive ? 'text-white/80' : 'text-[#6F7B75]'
                      )}
                    >
                      ({tab.count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Right side: Search + Sort + Custom Filters + Actions */}
        <div className="flex flex-1 flex-wrap items-center justify-end gap-3 w-full sm:w-auto">
          {hasSearch && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSearchChange(internalSearch);
                onSearchSubmit?.(e);
              }}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6F7B75] pointer-events-none" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={internalSearch}
                  onChange={(e) => setInternalSearch(e.target.value)}
                  className="h-10 w-full rounded-full border border-[#E5E4DE] bg-white pl-10 pr-9 text-sm font-medium text-[#06261D] placeholder:text-[#6F7B75] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0B3025]/20"
                />
                {internalSearch && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F7B75] hover:text-[#06261D] p-0.5 rounded-full cursor-pointer transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {showSearchButton && (
                <AppButton
                  type="submit"
                  variant="outline"
                  className="h-10 rounded-full border border-[#E5E4DE] px-4 text-sm font-bold text-[#06261D] hover:bg-[#FAF9F5]"
                >
                  Tìm
                </AppButton>
              )}
            </form>
          )}

          {/* Sort dropdown */}
          {sort && (
            <PortalFilterSelect
              icon={ArrowUpDown}
              label={sort.label}
              value={sort.value}
              onChange={sort.onChange}
              options={sort.options}
              placeholder={sort.placeholder ?? 'Sắp xếp...'}
            />
          )}

          {/* Custom filters slot (PortalFilterSelect, Datepicker, etc.) */}
          {filters}

          {/* Additional actions slot (Create button, Export, etc.) */}
          {actions}
        </div>
      </div>
    </div>
  );
}
