import { useEffect, useMemo, useState } from 'react';
import { TOUR_PAGE_SIZE } from '@/features/tours/constants';
import { useTourPriceRange } from '@/features/tours/hooks/useTourPriceRange';
import { useTours } from '@/features/tours/hooks/useTours';
import { resolveTourSort } from '@/features/tours/mappers';
import type {
  ApiDifficulty,
  TourFilter,
  TourListParams,
  TourSearchValues,
} from '@/features/tours/types';
import { useDebounce } from '@/shared/hooks';

export function useTourFilters() {
  const [draft, setDraft] = useState<TourSearchValues>({ keyword: '' });
  const [filters, setFilters] = useState<TourFilter>({ sortBy: 'newest' });
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [page, setPage] = useState(0);
  const [layout, setLayout] = useState<'list' | 'grid'>('grid');

  const debouncedKeyword = useDebounce(draft.keyword, 400);

  // Reset to page 0 when search keyword changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: setPage is a stable useState setter
  useEffect(() => {
    setPage(0);
  }, [debouncedKeyword]);

  const handleSearch = (values: TourSearchValues) => {
    setDraft(values);
    setFilters((prev) => ({
      ...prev,
      keyword: values.keyword,
    }));
    setPage(0);
  };

  const handleLocationChange = (location: string) => {
    setFilters((prev) => ({ ...prev, location }));
    setPage(0);
  };

  const handleDifficultySelect = (difficulty: ApiDifficulty | 'ALL') => {
    setFilters((prev) => ({
      ...prev,
      difficulty: difficulty === 'ALL' ? undefined : difficulty,
    }));
    setPage(0);
  };

  const handleSortChange = (sortBy: TourFilter['sortBy']) => {
    setFilters((prev) => ({ ...prev, sortBy }));
    setPage(0);
  };

  const handlePriceRangeChange = (val: [number, number]) => {
    setPriceRange(val);
    setPage(0);
  };

  const handleDepartureDateChange = (date: string) => {
    setFilters((prev) => ({ ...prev, departureDate: date }));
    setPage(0);
  };

  const handleReturnDateChange = (date: string) => {
    setFilters((prev) => ({ ...prev, returnDate: date }));
    setPage(0);
  };

  const handleResetFilters = () => {
    setDraft({ keyword: '' });
    setFilters({ sortBy: 'newest', location: '', departureDate: '', returnDate: '' });
    setPriceRange([0, 0]);
    setPage(0);
  };

  const handlePageChange = (next: number) => {
    setPage(next);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const {
    minPrice,
    maxPrice,
    isLoading: isPriceRangeLoading,
  } = useTourPriceRange({
    keyword: debouncedKeyword,
    location: filters.location,
    difficulty: filters.difficulty,
  });

  useEffect(() => {
    if (!isPriceRangeLoading && minPrice > 0 && priceRange[0] === 0 && priceRange[1] === 0) {
      setPriceRange([minPrice, maxPrice]);
    }
  }, [minPrice, maxPrice, isPriceRangeLoading, priceRange]);

  const isPriceFilterActive =
    (priceRange[0] > 0 || priceRange[1] > 0) &&
    (priceRange[0] > minPrice || priceRange[1] < maxPrice);

  const { sortBy, sortDir } = resolveTourSort(filters.sortBy);

  const queryParams = useMemo<TourListParams>(
    () => ({
      keyword: debouncedKeyword,
      location: filters.location,
      difficulty: filters.difficulty,
      departureDate: filters.departureDate,
      returnDate: filters.returnDate,
      page,
      size: TOUR_PAGE_SIZE,
      sortBy,
      sortDir,
    }),
    [
      debouncedKeyword,
      filters.location,
      filters.difficulty,
      filters.departureDate,
      filters.returnDate,
      page,
      sortBy,
      sortDir,
    ]
  );

  const { tours, totalElements, totalPages, pageNumber, isLoading, error, refetch } =
    useTours(queryParams);

  const filteredTours = useMemo(() => {
    if (!isPriceFilterActive || isLoading) return tours;
    return tours.filter((tour) => {
      if (!tour.basePrice) return true;
      return tour.basePrice >= priceRange[0] && tour.basePrice <= priceRange[1];
    });
  }, [tours, priceRange, isLoading, isPriceFilterActive]);

  return {
    draft,
    filters,
    priceRange,
    page,
    layout,
    setLayout,
    minPrice,
    maxPrice,
    isPriceRangeLoading,
    isPriceFilterActive,
    tours,
    filteredTours,
    totalElements,
    totalPages,
    pageNumber,
    isLoading,
    error,
    refetch,
    handleSearch,
    handleLocationChange,
    handleDifficultySelect,
    handleSortChange,
    handlePriceRangeChange,
    handleDepartureDateChange,
    handleReturnDateChange,
    handleResetFilters,
    handlePageChange,
  };
}
