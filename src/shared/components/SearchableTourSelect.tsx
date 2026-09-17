import { Check, ChevronDown, Compass, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface TourSelectItem {
  id: string;
  name: string;
  location?: string;
  duration?: string;
  level?: string;
  price?: string | number;
}

export interface SearchableTourSelectProps {
  tours: TourSelectItem[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allOptionLabel?: string; // e.g. "-- Tất cả các Tour --"
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  triggerClassName?: string;
  initialLimit?: number;
  stepLimit?: number;
}

export function SearchableTourSelect({
  tours,
  value,
  onChange,
  placeholder = 'Chọn tour...',
  allOptionLabel,
  disabled = false,
  isLoading = false,
  className,
  triggerClassName,
  initialLimit = 5,
  stepLimit = 5,
}: SearchableTourSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleLimit, setVisibleLimit] = useState(initialLimit);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Selected tour object
  const selectedTour = useMemo(() => tours.find((t) => t.id === value), [tours, value]);

  // Filtered tours based on search keyword
  const filteredTours = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return tours;
    return tours.filter((tour) => {
      const nameMatch = tour.name?.toLowerCase().includes(query);
      const locationMatch = tour.location?.toLowerCase().includes(query);
      return nameMatch || locationMatch;
    });
  }, [tours, searchQuery]);

  // Visible items based on pagination limit
  const visibleTours = useMemo(
    () => filteredTours.slice(0, visibleLimit),
    [filteredTours, visibleLimit]
  );
  const hasMore = filteredTours.length > visibleLimit;
  const remainingCount = filteredTours.length - visibleLimit;

  // Reset limit and search when closing or query changes
  const handleOpenChange = (open: boolean) => {
    if (disabled || isLoading) return;
    setIsOpen(open);
    if (open) {
      setVisibleLimit(initialLimit);
      setSearchQuery('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setVisibleLimit(initialLimit);
  };

  const handleSelect = (tourId: string) => {
    onChange(tourId);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const handleLoadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisibleLimit((prev) => prev + stepLimit);
  };

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Display label on trigger
  const displayLabel = useMemo(() => {
    if (selectedTour) return selectedTour.name;
    if (allOptionLabel) return allOptionLabel;
    return placeholder;
  }, [selectedTour, allOptionLabel, placeholder]);

  const isPlaceholderActive = !selectedTour && !allOptionLabel;

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={() => handleOpenChange(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-left text-xs text-foreground transition-all outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
          isOpen && 'ring-1 ring-primary border-primary bg-background shadow-xs',
          triggerClassName
        )}
      >
        <span
          className={cn(
            'truncate flex-1 font-normal',
            isPlaceholderActive ? 'text-muted-foreground' : 'text-foreground font-medium'
          )}
        >
          {isLoading ? 'Đang tải danh sách Tour...' : displayLabel}
        </span>

        <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
          {value && allOptionLabel && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === 'Enter' && handleClear(e as unknown as React.MouseEvent)}
              className="p-0.5 rounded-full hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title="Xóa lựa chọn"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              isOpen && 'rotate-180 text-primary'
            )}
          />
        </div>
      </button>

      {/* Popover / Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-border bg-popover shadow-xl animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Search Input Header */}
          <div className="border-b border-border p-2 bg-muted/20">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Tìm tên tour hoặc địa điểm..."
                className="h-8 w-full rounded-lg bg-background border border-border/80 pl-8 pr-7 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-2 p-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options List Container - Fixed Max-Height to Prevent Layout Expansion */}
          <div
            role="listbox"
            className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin scrollbar-thumb-muted-foreground/20"
          >
            {/* All Options / Reset Item (if allOptionLabel is supplied) */}
            {allOptionLabel && !searchQuery && (
              <button
                type="button"
                role="option"
                aria-selected={!value}
                onClick={() => handleSelect('')}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors cursor-pointer',
                  !value
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <span>{allOptionLabel}</span>
                {!value && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
              </button>
            )}

            {/* List of Visible Tours */}
            {visibleTours.length > 0 ? (
              visibleTours.map((tour) => {
                const isSelected = tour.id === value;
                return (
                  <button
                    key={tour.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(tour.id)}
                    className={cn(
                      'flex w-full items-start justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-foreground hover:bg-muted/70'
                    )}
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="truncate leading-tight font-medium">{tour.name}</p>
                      {(tour.location || tour.duration) && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {[tour.location, tour.duration].filter(Boolean).join(' • ')}
                        </p>
                      )}
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />}
                  </button>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                <Compass className="h-6 w-6 stroke-1 mb-1 text-muted-foreground/60" />
                <p className="text-xs">Không tìm thấy tour nào phù hợp</p>
              </div>
            )}
          </div>

          {/* Load More Button (Fixed inside Dropdown footer) */}
          {hasMore && (
            <div className="border-t border-border bg-muted/10 p-1.5">
              <button
                type="button"
                onClick={handleLoadMore}
                className="w-full rounded-lg py-1.5 text-center text-xs font-semibold text-primary transition-colors hover:bg-primary/10 cursor-pointer"
              >
                Xem thêm (còn {remainingCount} tour)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
