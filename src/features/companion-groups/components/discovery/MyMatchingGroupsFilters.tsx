import { cn } from '@/lib/utils';
import { AppDatePicker } from '@/shared/ui';
import {
  MATCHING_GROUP_STATUS_FILTER_OPTIONS,
  type MatchingGroupStatusFilter,
} from '../../constants';

interface TourOption {
  id: string;
  name: string;
}

interface MyMatchingGroupsFiltersProps {
  tours: TourOption[];
  selectedTourId: string;
  selectedDate: string;
  statusFilter: MatchingGroupStatusFilter;
  onTourChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onStatusChange: (value: MatchingGroupStatusFilter) => void;
  onReset: () => void;
}

function toLocalDate(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1_000).toISOString().split('T')[0];
}

export function MyMatchingGroupsFilters({
  tours,
  selectedTourId,
  selectedDate,
  statusFilter,
  onTourChange,
  onDateChange,
  onStatusChange,
  onReset,
}: MyMatchingGroupsFiltersProps) {
  return (
    <aside className="flex flex-col gap-6 lg:col-span-3">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <h3 className="mb-5 font-bold text-base text-foreground">Bộ lọc</h3>

        {/* Tour Filter */}
        <div className="mb-6">
          <span className="mb-2 block font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
            Tour
          </span>
          <select
            value={selectedTourId}
            onChange={(e) => onTourChange(e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-foreground text-xs outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">-- Tất cả các Tour --</option>
            {tours.map((tour) => (
              <option key={tour.id} value={tour.id}>
                {tour.name}
              </option>
            ))}
          </select>
        </div>

        <hr className="my-5 border-border" />

        {/* Departure Date Filter */}
        <div className="mb-6">
          <span className="mb-2 block font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
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

        {/* Status Filter */}
        <div className="mb-6">
          <span className="mb-2 block font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
            Trạng thái
          </span>
          <div className="flex flex-col gap-2.5">
            {MATCHING_GROUP_STATUS_FILTER_OPTIONS.map((opt) => {
              const isActive = statusFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onStatusChange(opt.value)}
                  aria-pressed={isActive}
                  className="flex items-center gap-3 text-left transition-colors hover:text-primary"
                >
                  <span
                    className={cn(
                      'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all',
                      isActive ? 'border-primary bg-primary' : 'border-input bg-transparent'
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

        {/* Reset button */}
        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-xl border border-input py-2 text-center font-semibold text-primary text-xs transition-all hover:bg-muted"
        >
          Làm mới bộ lọc
        </button>
      </div>
    </aside>
  );
}
