import { MapPin, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { TourSearchValues } from '@/features/tours/types';
import { tourService } from '../services/tourService';

interface TourSearchBarProps {
  onSearch: (values: TourSearchValues) => void;
  initialValues?: Partial<TourSearchValues>;
  className?: string;
}

const EMPTY_VALUES: TourSearchValues = {
  keyword: '',
  location: '',
  departureDate: '',
  budget: '',
};

const FALLBACK_LOCATIONS = [
  'Lào Cai',
  'Lai Châu',
  'Lâm Đồng',
  'Cao Bằng',
  'Yên Bái',
  'Hòa Bình',
  'Hà Giang',
];

/**
 * TourSearchBar — search card that overlaps the hero on the List Tours page.
 * Uses shadcn Popover + Command to render a searchable location Combobox.
 */
export default function TourSearchBar({
  onSearch,
  initialValues,
  className = '',
}: TourSearchBarProps) {
  const [values, setValues] = useState<TourSearchValues>({
    ...EMPTY_VALUES,
    ...initialValues,
  });
  const [open, setOpen] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);

  // Fetch unique locations on mount
  useEffect(() => {
    tourService
      .getTours({ size: 100 })
      .then((res) => {
        const rawLocations = res.content.map((t) => t.location).filter(Boolean);
        const splitLocations = rawLocations.flatMap((loc) =>
          loc
            .split(/[-–—]+/)
            .map((part) => part.trim())
            .filter(Boolean)
        );
        const unique = Array.from(new Set(splitLocations)) as string[];
        setLocations(unique.length > 0 ? unique : FALLBACK_LOCATIONS);
      })
      .catch((err) => {
        console.error('Failed to load locations', err);
        setLocations(FALLBACK_LOCATIONS);
      });
  }, []);

  const initKeyword = initialValues?.keyword;
  const initLocation = initialValues?.location;

  useEffect(() => {
    setValues({
      ...EMPTY_VALUES,
      keyword: initKeyword || '',
      location: initLocation || '',
    });
  }, [initKeyword, initLocation]);

  const update = <K extends keyof TourSearchValues>(key: K, val: TourSearchValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(values);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative z-20 mx-auto -mt-20 w-full max-w-[1100px] rounded-2xl bg-white p-3 shadow-xl ring-1 ring-black/5 sm:-mt-24 sm:p-4 lg:p-3 ${className}`}
    >
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-0">
        {/* Từ khóa */}
        <label className="flex flex-1 cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-muted/50 sm:rounded-none sm:px-4 sm:py-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Search className="h-5 w-5" />
            </span>
            <span className="flex flex-col flex-1 min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
                Từ khóa
              </span>
              <input
                type="text"
                value={values.keyword}
                onChange={(e) => update('keyword', e.target.value)}
                placeholder="Bạn muốn tìm gì?"
                className="w-full min-w-0 bg-transparent text-sm font-semibold text-foreground placeholder:font-normal placeholder:text-muted-foreground/70 focus:outline-none"
              />
            </span>
          </div>
          {values.keyword && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                update('keyword', '');
                onSearch({ ...values, keyword: '' });
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground/60 hover:bg-muted hover:text-foreground"
              aria-label="Xóa từ khóa"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>

        <div className="hidden h-10 w-px bg-border sm:block" />

        {/* Điểm đến (Combobox) */}
        <div className="flex flex-1 items-center justify-between gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-muted/50 sm:rounded-none sm:px-4 sm:py-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </span>
            <span className="flex flex-col flex-1 min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
                Điểm đến
              </span>

              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                  type="button"
                  className="w-full text-left bg-transparent text-sm font-semibold text-foreground placeholder:font-normal placeholder:text-muted-foreground/70 focus:outline-none flex justify-between items-center"
                >
                  <span
                    className={
                      values.location ? 'text-foreground' : 'text-muted-foreground/70 font-normal'
                    }
                  >
                    {values.location || 'Bạn muốn đi đâu?'}
                  </span>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Tìm địa danh..." />
                    <CommandList>
                      <CommandEmpty>Không tìm thấy địa danh</CommandEmpty>
                      <CommandGroup>
                        {locations.map((loc) => (
                          <CommandItem
                            key={loc}
                            value={loc}
                            onSelect={() => {
                              update('location', loc);
                              setOpen(false);
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
            </span>
          </div>
          {values.location && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                update('location', '');
                onSearch({ ...values, location: '' });
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground/60 hover:bg-muted hover:text-foreground"
              aria-label="Xóa điểm đến"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="ml-auto inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary-hover hover:shadow-lg sm:ml-3 lg:px-6"
          aria-label="Tìm kiếm"
        >
          <Search className="h-4 w-4" />
          <span>Tìm kiếm</span>
        </button>
      </div>
    </form>
  );
}
