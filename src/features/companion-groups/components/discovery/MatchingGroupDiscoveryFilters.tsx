import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { SearchableTourSelect } from '@/shared/components/SearchableTourSelect';
import { AppDatePicker } from '@/shared/ui';
import {
  formatShortPrice,
  MATCHING_GROUP_DIFFICULTY_OPTIONS,
  MATCHING_GROUP_PRICE_DEFAULT_MAX,
  MATCHING_GROUP_PRICE_DEFAULT_MIN,
  MATCHING_GROUP_STATUS_FILTER_OPTIONS,
  type MatchingGroupDifficultyFilter,
  type MatchingGroupStatusFilter,
} from '../../constants';

interface TourOption {
  id: string;
  name: string;
}

interface MatchingGroupDiscoveryFiltersProps {
  tours: TourOption[];
  selectedTourId: string;
  selectedDate: string;
  difficulty: MatchingGroupDifficultyFilter;
  priceRange: [number, number];
  minPrice?: number;
  maxPrice?: number;
  statusFilter: MatchingGroupStatusFilter;
  availableSlotsOnly?: boolean;
  hideJoinedGroups?: boolean;
  isGuest?: boolean;
  onTourChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onDifficultyChange: (value: MatchingGroupDifficultyFilter) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onStatusChange: (value: MatchingGroupStatusFilter) => void;
  onAvailableSlotsChange?: (value: boolean) => void;
  onHideJoinedGroupsChange?: (value: boolean) => void;
  onReset: () => void;
}

function toLocalDate(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1_000).toISOString().split('T')[0];
}

export function MatchingGroupDiscoveryFilters({
  tours,
  selectedTourId,
  selectedDate,
  difficulty,
  priceRange,
  minPrice = MATCHING_GROUP_PRICE_DEFAULT_MIN,
  maxPrice = MATCHING_GROUP_PRICE_DEFAULT_MAX,
  statusFilter,
  availableSlotsOnly = false,
  hideJoinedGroups = false,
  isGuest = false,
  onTourChange,
  onDateChange,
  onDifficultyChange,
  onPriceRangeChange,
  onStatusChange,
  onAvailableSlotsChange,
  onHideJoinedGroupsChange,
  onReset,
}: MatchingGroupDiscoveryFiltersProps) {
  const isAllPrice = priceRange[0] <= minPrice && priceRange[1] >= maxPrice;

  return (
    <aside className="flex flex-col gap-6 lg:col-span-3">
      <div className="rounded-2xl border border-border bg-white p-5 shadow-xs">
        <h2 className="mb-5 font-bold text-lg text-primary">Bộ lọc</h2>

        {/* Section: Tour */}
        <div className="mb-6">
          <span className="mb-3 block font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
            Tour
          </span>
          <SearchableTourSelect
            tours={tours}
            value={selectedTourId}
            onChange={onTourChange}
            allOptionLabel="-- Tất cả các Tour --"
            placeholder="-- Tất cả các Tour --"
          />
        </div>

        <hr className="my-5 border-border" />

        {/* Section: Ngày khởi hành */}
        <div className="mb-6">
          <span className="mb-3 block font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
            Ngày khởi hành
          </span>
          <AppDatePicker
            selected={selectedDate ? new Date(selectedDate) : null}
            onChange={(date: Date | null) => onDateChange(date ? toLocalDate(date) : '')}
            className="w-full cursor-pointer rounded-xl border border-border bg-muted/40 px-3 py-2 text-foreground text-xs outline-none focus:ring-1 focus:ring-primary"
            placeholderText="Chọn ngày khởi hành"
          />
        </div>

        <hr className="my-5 border-border" />

        {/* Section: Độ khó */}
        <fieldset className="mb-6">
          <legend className="mb-3 block font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
            Độ khó
          </legend>
          <div className="flex flex-col gap-2.5">
            {MATCHING_GROUP_DIFFICULTY_OPTIONS.map((option) => {
              const isActive = difficulty === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onDifficultyChange(option.value)}
                  aria-pressed={isActive}
                  className="flex items-center gap-3 text-left transition-colors hover:text-primary cursor-pointer"
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
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <hr className="my-5 border-border" />

        {/* Section: Khoảng giá (VND) */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Khoảng giá (VND)
            </span>
            <span className="text-xs font-bold text-primary">
              {isAllPrice
                ? 'Tất cả mức giá'
                : `${formatShortPrice(priceRange[0])} - ${formatShortPrice(priceRange[1])}`}
            </span>
          </div>
          <div className="px-1 py-4">
            <Slider
              value={priceRange}
              onValueChange={(val) => onPriceRangeChange(val as [number, number])}
              min={minPrice}
              max={maxPrice > minPrice ? maxPrice : minPrice + 1}
              step={100_000}
              disabled={minPrice === 0 && maxPrice === 0}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
            <span>{formatShortPrice(minPrice)}</span>
            <span>{formatShortPrice(maxPrice)}</span>
          </div>
        </div>

        <hr className="my-5 border-border" />

        {/* Section: Tùy chọn hiển thị */}
        {onAvailableSlotsChange && (
          <>
            <div className="mb-6">
              <span className="mb-3 block font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
                Tùy chọn hiển thị
              </span>
              <div className="flex flex-col gap-2.5">
                <label className="flex cursor-pointer items-center gap-2.5 text-xs text-foreground">
                  <input
                    type="checkbox"
                    checked={availableSlotsOnly}
                    onChange={(e) => onAvailableSlotsChange(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span>Chỉ hiện nhóm còn chỗ trống</span>
                </label>
                {!isGuest && onHideJoinedGroupsChange && (
                  <label className="flex cursor-pointer items-center gap-2.5 text-xs text-foreground">
                    <input
                      type="checkbox"
                      checked={hideJoinedGroups}
                      onChange={(e) => onHideJoinedGroupsChange(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span>Ẩn nhóm đã tham gia / sở hữu</span>
                  </label>
                )}
              </div>
            </div>
            <hr className="my-5 border-border" />
          </>
        )}

        {/* Section: Trạng thái */}
        <fieldset className="mb-6">
          <legend className="mb-3 block font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
            Trạng thái
          </legend>
          <div className="flex flex-col gap-2.5">
            {MATCHING_GROUP_STATUS_FILTER_OPTIONS.map((option) => {
              const isActive = statusFilter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onStatusChange(option.value)}
                  aria-pressed={isActive}
                  className="flex items-center gap-3 text-left transition-colors hover:text-primary cursor-pointer"
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
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Clear/Reset Button */}
        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-xl border border-input py-2 text-center font-semibold text-primary text-xs transition-all hover:bg-muted cursor-pointer"
        >
          Làm mới bộ lọc
        </button>
      </div>
    </aside>
  );
}
