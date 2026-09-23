import { useQuery } from '@tanstack/react-query';
import { mapApiItemToTour } from '@/features/tours/hooks/useTours';
import { tourService } from '@/features/tours/services/tourService';
import type { Tour } from '@/features/tours/types';

const FEATURED_LIMIT = 6;

async function fetchFeaturedTours(): Promise<Tour[]> {
  const response = await tourService.getTours({
    page: 0,
    size: FEATURED_LIMIT,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  return response.content.map(mapApiItemToTour);
}

export interface UseFeaturedToursResult {
  tours: Tour[];
  isLoading: boolean;
  error: Error | null;
}

export function useFeaturedTours(): UseFeaturedToursResult {
  const { data, isLoading, error } = useQuery({
    queryKey: ['featured-tours', FEATURED_LIMIT],
    queryFn: fetchFeaturedTours,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    tours: data ?? [],
    isLoading,
    error: error instanceof Error ? error : null,
  };
}
