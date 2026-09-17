import { CalendarDays, MapPin, X } from 'lucide-react';
import { useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { useTourLocations } from '@/features/tours/hooks/useTourLocations';
import type { ApiDifficulty, TourFilter } from '@/features/tours/types';
import { cn } from '@/lib/utils';
import { AppDatePicker } from '@/shared/ui';

interface TourFilterPanelProps {
  location?: string;
  onLocationChange: (location: string) => void;
  departureDate?: string;
  returnDate?: string;
  onDepartureDateChange: (date: string) => void;
  onReturnDateChange: (date: string) => void;
  difficulty: TourFilter['difficulty'];
  priceRange: [number, number];
  minPrice: number;
  maxPrice: number;
  isPriceRangeLoading: boolean;
  onDifficultyChange: (difficulty: ApiDifficulty | 'ALL') => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onResetFilters: () => void;
}

const difficultyOptions: { value: ApiDifficulty | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Tất cả độ khó' },
  { value: 'EASY', label: 'Dễ' },
  { value: 'MODERATE', label: 'Trung bình' },
  { value: 'HARD', label: 'Khó' },
  { value: 'EXTREME', label: 'Cực khó' },
];

function formatShortPrice(val: number): string {
  if (val <= 0) return '0';
  if (val >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(val % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (val >= 1_000) {
    return `${(val / 1_000).toFixed(val % 1_000 === 0 ? 0 : 1)}K`;
  }
  return String(val);
}

/** Normalise a JS Date to a local YYYY-MM-DD string. */
function toLocalDateStr(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function TourFilterPanel({
  location,
  onLocationChange,
  departureDate,
  returnDate,
  onDepartureDateChange,
  onReturnDateChange,
  difficulty,
  priceRange,
  minPrice,
  maxPrice,
  isPriceRangeLoading,
  onDifficultyChange,
  onPriceRangeChange,
  onResetFilters,
}: TourFilterPanelProps) {
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const { locations } = useTourLocations();

  const departureDateObj = departureDate ? new Date(departureDate) : null;
  const returnDateObj = returnDate ? new Date(returnDate) : null;

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
      <h3 className="mb-5 text-lg font-bold text-primary">Bộ lọc</h3>

      {/* Section: Điểm đến */}
      <div className="mb-6">
        <span className="mb-3 block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
          Điểm đến
        </span>
        <Popover open={isLocationOpen} onOpenChange={setIsLocationOpen}>
          <PopoverTrigger
            type="button"
            className="flex w-full items-center gap-2 rounded-xl border border-input px-3 py-2.5 text-left focus:outline-none"
          >
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span
              className={cn(
                'flex-1 truncate text-sm',
                location ? 'font-semibold text-foreground' : 'text-muted-foreground'
              )}
            >
              {location || 'Bạn muốn đi đâu?'}
            </span>
            {location && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onLocationChange('');
                }}
                className="shrink-0 text-muted-foreground/60 hover:text-foreground"
                aria-label="Xóa điểm đến"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Tìm địa danh..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
              />
              <CommandList>
                <CommandEmpty>Không tìm thấy địa danh</CommandEmpty>
                <CommandGroup>
                  {locations.map((loc) => (
                    <CommandItem
                      key={loc}
                      value={loc}
                      onSelect={() => {
                        onLocationChange(loc);
                        setIsLocationOpen(false);
                      }}
                    >
                      {loc}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <hr className="my-5 border-border" />

      {/* Section: Ngày đi / Ngày về — xếp dọc, không chia 2 cột, vì sidebar hẹp (~3/12 cột)
          không đủ chỗ hiển thị đầy đủ ngày + icon + nút xóa khi chia đôi theo chiều ngang. */}
      <div className="mb-6 flex flex-col gap-3">
        <div>
          <span className="mb-2 block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Ngày đi
          </span>
          <div className="flex items-center gap-2 rounded-xl border border-input px-3 py-2.5">
            <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
            <AppDatePicker
              selected={departureDateObj}
              onChange={(date: Date | null) => {
                onDepartureDateChange(date ? toLocalDateStr(date) : '');
              }}
              placeholderText="Chọn ngày"
              className="!h-auto !w-full !min-w-0 !border-0 !bg-transparent !p-0 !pr-5 !text-sm !font-semibold !text-foreground !ring-0 !ring-offset-0 placeholder:!font-normal placeholder:!text-muted-foreground/70 focus-visible:!ring-0 focus-visible:!ring-offset-0"
              isClearable
            />
          </div>
        </div>

        <div>
          <span className="mb-2 block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Ngày về
          </span>
          <div className="flex items-center gap-2 rounded-xl border border-input px-3 py-2.5">
            <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
            <AppDatePicker
              selected={returnDateObj}
              onChange={(date: Date | null) => {
                onReturnDateChange(date ? toLocalDateStr(date) : '');
              }}
              placeholderText="Chọn ngày"
              className="!h-auto !w-full !min-w-0 !border-0 !bg-transparent !p-0 !pr-5 !text-sm !font-semibold !text-foreground !ring-0 !ring-offset-0 placeholder:!font-normal placeholder:!text-muted-foreground/70 focus-visible:!ring-0 focus-visible:!ring-offset-0"
              minDate={departureDateObj || undefined}
              isClearable
            />
          </div>
        </div>
      </div>

      <hr className="my-5 border-border" />

      {/* Section: Độ khó */}
      <div className="mb-6">
        <span className="mb-3 block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
          Độ khó
        </span>
        <div className="flex flex-col gap-2.5">
          {difficultyOptions.map((opt) => {
            const isActive =
              opt.value === 'ALL' ? difficulty === undefined : difficulty === opt.value;

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onDifficultyChange(opt.value)}
                aria-pressed={isActive}
                className="flex items-center gap-3 text-left transition-colors hover:text-primary"
              >
                <span
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all',
                    isActive
                      ? 'border-primary bg-primary text-white'
                      : 'border-input bg-transparent'
                  )}
                >
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                <span
                  className={cn(
                    'text-sm transition-all',
                    isActive ? 'font-semibold text-primary' : 'text-muted-foreground'
                  )}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <hr className="my-5 border-border" />

      {/* Section: Khoảng giá */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Khoảng giá (VND)
          </span>
          <span className="text-xs font-bold text-primary">
            {isPriceRangeLoading
              ? 'Đang tải...'
              : `${formatShortPrice(priceRange[0])} - ${formatShortPrice(priceRange[1])}`}
          </span>
        </div>
        <div className="px-1 py-4">
          <Slider
            value={priceRange}
            onValueChange={(val) => onPriceRangeChange(val as [number, number])}
            min={minPrice}
            max={maxPrice > minPrice ? maxPrice : minPrice + 1}
            step={Math.max(1, Math.round((maxPrice - minPrice) / 100) || 1)}
            disabled={isPriceRangeLoading || (minPrice === 0 && maxPrice === 0)}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
          <span>{formatShortPrice(minPrice)}</span>
          <span>{formatShortPrice(maxPrice)}</span>
        </div>
      </div>

      {/* Clear/Reset Button */}
      <button
        type="button"
        onClick={onResetFilters}
        className="w-full rounded-xl border border-input py-2 text-center text-xs font-semibold text-primary transition-all hover:bg-muted"
      >
        Làm mới bộ lọc
      </button>
    </div>
  );
}
