import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { tourService } from '@/features/tours/services/tourService';
import type { TourListParams } from '@/features/tours/types';

export interface TourPriceRange {
  minPrice: number;
  maxPrice: number;
}

interface UseTourPriceRangeResult extends TourPriceRange {
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: UseQueryResult<TourPriceRange, Error>['refetch'];
}

async function fetchAllTourPrices(
  params: Pick<TourListParams, 'keyword' | 'location' | 'difficulty'>
) {
  const firstPage = await tourService.getTours({
    keyword: params.keyword,
    location: params.location,
    difficulty: params.difficulty,
    page: 0,
    size: 100,
    sortBy: 'basePrice',
    sortDir: 'asc',
  });

  const pages = [firstPage.content];

  if (firstPage.totalPages > 1) {
    const remainingPages = await Promise.all(
      Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
        tourService.getTours({
          keyword: params.keyword,
          location: params.location,
          difficulty: params.difficulty,
          page: index + 1,
          size: firstPage.pageSize,
          sortBy: 'basePrice',
          sortDir: 'asc',
        })
      )
    );

    pages.push(...remainingPages.map((page) => page.content));
  }

  const prices = pages.flatMap((page) =>
    page.map((tour) => tour.basePrice).filter((price): price is number => Number.isFinite(price))
  );

  if (prices.length === 0) {
    return { minPrice: 0, maxPrice: 0 };
  }

  return {
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
  };
}

export function useTourPriceRange(
  params: Pick<TourListParams, 'keyword' | 'location' | 'difficulty'> = {}
): UseTourPriceRangeResult {
  const queryKey = [
    'tour-price-range',
    params.keyword ?? '',
    params.location ?? '',
    params.difficulty ?? 'ALL',
  ] as const;

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchAllTourPrices(params),
  });

  return {
    minPrice: data?.minPrice ?? 0,
    maxPrice: data?.maxPrice ?? 0,
    isLoading,
    isFetching,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
