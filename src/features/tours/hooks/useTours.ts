import { useQuery } from '@tanstack/react-query';
import { tourService } from '../services/tourService';
import type { Tour, TourApiItem, TourListParams } from '../types';

const DIFFICULTY_MAP: Record<string, Tour['level']> = {
  HARD: 'Khó',
  MODERATE: 'Trung bình',
  EASY: 'Dễ',
  BEGINNER: 'Khám phá',
};

function formatPrice(price: number): string {
  return `${price.toLocaleString('vi-VN')}đ`;
}

function mapApiItemToTour(item: TourApiItem): Tour {
  return {
    id: item.tourId,
    name: item.tourName,
    description: '',
    duration: `${item.durationDays} ngày`,
    level: DIFFICULTY_MAP[item.difficulty] || 'Khám phá',
    price: formatPrice(item.basePrice),
    rating: item.averageRating ?? 0,
    reviewCount: item.totalReviews,
    image: item.coverImageUrl,
    slug: item.tourId,
    category: '',
    location: item.location,
    maxParticipants: 0,
    highlights: [],
    includes: [],
    isPopular: false,
    isNew: false,
  };
}

interface UseToursResult {
  tours: Tour[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
  last: boolean;
  isLoading: boolean;
  error: Error | null;
}

export function useTours(params: TourListParams = {}): UseToursResult {
  const queryParams: TourListParams = {
    page: params.page ?? 0,
    size: params.size ?? 10,
    sortBy: params.sortBy ?? 'createdAt',
    sortDir: params.sortDir ?? 'desc',
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['tours', queryParams],
    queryFn: () => tourService.getTours(queryParams),
  });

  return {
    tours: data?.content.map(mapApiItemToTour) ?? [],
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    pageNumber: data?.pageNumber ?? 0,
    last: data?.last ?? true,
    isLoading,
    error: error instanceof Error ? error : null,
  };
}
