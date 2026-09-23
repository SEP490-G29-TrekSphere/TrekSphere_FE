import { useQuery } from '@tanstack/react-query';
import { getPrimaryRole, ROLES } from '@/constants/roles';
import { tourService } from '@/features/tours/services/tourService';
import type { ApiDifficulty, RecommendationReason, Tour } from '@/features/tours/types';
import { useAppStore } from '@/store/useAppStore';
import { formatTourDuration } from '@/utils/format';

const DEFAULT_LIMIT = 6;

const DIFFICULTY_MAP: Record<ApiDifficulty, Tour['level']> = {
  EASY: 'Dễ',
  MODERATE: 'Trung bình',
  HARD: 'Khó',
  EXTREME: 'Khám phá',
};

const REASON_LABEL: Record<RecommendationReason, string> = {
  AREA: 'Gần khu vực bạn quan tâm',
  BEHAVIOR: 'Dựa trên lịch sử xem',
  SIMILAR_TO_HISTORY: 'Tương tự tour bạn từng xem',
  DIFFICULTY: 'Phù hợp độ khó bạn hay chọn',
  SKILL_PROGRESSION: 'Thử thách cao hơn 1 chút',
  EXPERIENCE: 'Phù hợp kinh nghiệm của bạn',
  SCHEDULE_FLEXIBILITY: 'Lịch khởi hành linh hoạt',
  AVAILABLE_GROUP: 'Đang có nhóm ghép còn chỗ',
  POPULAR: 'Đang được quan tâm',
  DISCOVERY: 'Gợi ý khám phá điều mới',
};

const DEFAULT_REASON_LABEL = 'Gợi ý dành cho bạn';

function formatPrice(price?: number | null): string {
  if (price == null || Number.isNaN(price) || price < 0) return '0đ';
  return `${price.toLocaleString('vi-VN')}đ`;
}

export interface RecommendedTour extends Tour {

  matchReasonLabel: string;
}

function describeFirstReason(reasons: RecommendationReason[]): string {
  const first = reasons[0];
  return first ? (REASON_LABEL[first] ?? DEFAULT_REASON_LABEL) : DEFAULT_REASON_LABEL;
}

async function fetchRecommendedTours(limit: number): Promise<RecommendedTour[]> {
  const response = await tourService.getRecommendedTours(0, limit);

  return response.content.map(({ tour, matchReasons }) => {
    const safePrice =
      tour.price == null || Number.isNaN(tour.price) || tour.price < 0 ? 0 : tour.price;
    return {
      id: tour.tourId,
      name: tour.tourName,
      description: '',
      duration: formatTourDuration(tour.durationDays ?? 1),
      level: DIFFICULTY_MAP[tour.difficulty] ?? 'Trung bình',
      price: formatPrice(safePrice),
      basePrice: safePrice,
      image: tour.coverImageUrl ?? '',
      slug: tour.tourId,
      category: '',
      location: tour.location,
      maxParticipants: tour.maxCapacity ?? 0,
      minCapacity: tour.minCapacity,
      maxCapacity: tour.maxCapacity,
      highlights: [],
      includes: [],
      isPopular: false,
      isNew: false,
      matchReasonLabel: describeFirstReason(matchReasons),
    };
  });
}

export interface UseRecommendedToursResult {
  tours: RecommendedTour[];
  isLoading: boolean;
  error: Error | null;
}

export function useRecommendedTours(limit = DEFAULT_LIMIT): UseRecommendedToursResult {
  const user = useAppStore((state) => state.user);
  const isTrekker = getPrimaryRole(user?.roles) === ROLES.TREKKER;

  const { data, isLoading, error } = useQuery({
    queryKey: ['recommended-tours', limit],
    queryFn: () => fetchRecommendedTours(limit),
    enabled: isTrekker,
    staleTime: 5 * 60 * 1000,
  });

  return {
    tours: isTrekker ? (data ?? []) : [],
    isLoading: isTrekker && isLoading,
    error: error instanceof Error ? error : null,
  };
}
