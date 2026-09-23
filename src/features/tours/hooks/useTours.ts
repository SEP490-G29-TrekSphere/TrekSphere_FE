import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type TourListResponse, tourService } from '@/features/tours/services/tourService';
import type { ApiDifficulty, Tour, TourApiItem, TourListParams } from '@/features/tours/types';
import { formatTourDuration } from '@/utils/format';

const DIFFICULTY_MAP: Record<ApiDifficulty, Tour['level']> = {
  EASY: 'Dễ',
  MODERATE: 'Trung bình',
  HARD: 'Khó',
  EXTREME: 'Khám phá',
};

function formatPrice(price?: number | null): string {
  if (price == null || Number.isNaN(price) || price < 0) return '0đ';
  return `${price.toLocaleString('vi-VN')}đ`;
}

export function mapApiItemToTour(item: TourApiItem): Tour {
  const safePrice =
    item.price == null || Number.isNaN(item.price) || item.price < 0 ? 0 : item.price;
  return {
    id: item.tourId,
    name: item.tourName,
    description: '',
    duration: formatTourDuration(item.durationDays ?? 1),
    level: (item.difficulty && DIFFICULTY_MAP[item.difficulty]) || 'Trung bình',
    price: formatPrice(safePrice),
    basePrice: safePrice,
    image: item.coverImageUrl,
    slug: item.tourId,
    category: item.category || '',
    location: item.location,
    maxParticipants: item.maxCapacity ?? 0,
    minCapacity: item.minCapacity,
    maxCapacity: item.maxCapacity,
    highlights: [],
    includes: [],
    isPopular: false,
    isNew: false,
  };
}

export interface UseToursResult {
  tours: Tour[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  last: boolean;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: UseQueryResult<TourListResponse, Error>['refetch'];
}

export function useTours(
  params: TourListParams = {},
  options?: { enabled?: boolean }
): UseToursResult {
  const queryParams: TourListParams = {
    page: params.page ?? 0,
    size: params.size ?? 10,
    sortBy: params.sortBy ?? 'createdAt',
    sortDir: params.sortDir ?? 'desc',
    keyword: params.keyword,
    location: params.location,
    difficulty: params.difficulty,
    departureDate: params.departureDate,
    returnDate: params.returnDate,
    vendorId: params.vendorId,
  };

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['tours', queryParams],
    queryFn: () => tourService.getTours(queryParams),
    ...options,
  });

  return {
    tours: data?.content?.map(mapApiItemToTour) ?? [],
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    pageNumber: data?.pageNumber ?? 0,
    pageSize: data?.pageSize ?? 0,
    last: data?.last ?? true,
    isLoading,
    isFetching,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
