import { zodResolver } from '@hookform/resolvers/zod';
import { Search, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { TourSearchValues } from '@/features/tours/types';
import { tourSearchSchema } from '@/features/tours/validations';

interface TourSearchBarProps {
  onSearch: (values: TourSearchValues) => void;
  initialValues?: Partial<TourSearchValues>;
  className?: string;
}

const EMPTY_VALUES: TourSearchValues = {
  keyword: '',
};

export default function TourSearchBar({
  onSearch,
  initialValues,
  className = '',
}: TourSearchBarProps) {
  const { register, handleSubmit, setValue, watch, reset } = useForm<TourSearchValues>({
    resolver: zodResolver(tourSearchSchema),
    defaultValues: {
      ...EMPTY_VALUES,
      ...initialValues,
    },
  });

  const keyword = watch('keyword');
  const initKeyword = initialValues?.keyword;

  useEffect(() => {
    reset({
      ...EMPTY_VALUES,
      keyword: initKeyword || '',
    });
  }, [initKeyword, reset]);

  const onSubmit = (data: TourSearchValues) => {
    onSearch(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`relative z-20 mx-auto mt-6 w-full max-w-[1100px] rounded-2xl border border-border bg-white p-3 sm:mt-8 sm:p-4 lg:p-3 ${className}`}
    >
      <div className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center lg:gap-0">
        <label className="flex flex-1 cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-muted/50 lg:rounded-none lg:px-4 lg:py-3">
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
                {...register('keyword')}
                placeholder="Bạn muốn tìm gì?"
                className="w-full min-w-0 bg-transparent text-sm font-semibold text-foreground placeholder:font-normal placeholder:text-muted-foreground/70 focus:outline-none"
              />
            </span>
          </div>
          {keyword && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setValue('keyword', '');
                onSearch({ keyword: '' });
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground/60 hover:bg-muted hover:text-foreground"
              aria-label="Xóa từ khóa"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>

        {/* Submit */}
        <button
          type="submit"
          className="ml-auto inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary-hover hover:shadow-lg lg:ml-3 lg:px-6"
          aria-label="Tìm kiếm"
        >
          <Search className="h-4 w-4" />
          <span>Tìm kiếm</span>
        </button>
      </div>
    </form>
  );
}
