export type TourLevel = 'Dễ' | 'Trung bình' | 'Khó' | 'Khám phá';

export interface Tour {
  id: string;
  name: string;
  description: string;
  duration: string;
  level: TourLevel;
  price: string;
  basePrice?: number;
  originalPrice?: string;
  image: string;
  images?: string[];
  badge?: string;
  slug: string;
  category: string;
  location: string;
  maxParticipants: number;
  minCapacity?: number;
  maxCapacity?: number;
  highlights: string[];
  includes: string[];
  excludes?: string[];
  schedule?: string;
  isPopular?: boolean;
  isNew?: boolean;
}

// ============================================================
// Detailed Tour Types for Tour Detail Page
// ============================================================

/**
 * Tour itinerary day - represents a single day in the tour schedule
 */
export interface TourItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals?: ('Sáng' | 'Trưa' | 'Tối')[];
  accommodation?: string;
  image?: string;
}

/**
 * Tour review from a traveler
 */
export interface TourReview {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  tourId: string;
  helpful: number;
}

/**
 * Discriminated union for tab navigation state
 */
export type TourTabId = 'details' | 'itinerary' | 'reviews';

export interface TourTabState {
  activeTab: TourTabId;
}

export type TourTabAction =
  | { type: 'SET_TAB'; payload: TourTabId }
  | { type: 'NEXT_TAB' }
  | { type: 'PREV_TAB' };

/**
 * Gallery image with metadata
 */
export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  isPrimary?: boolean;
}

/**
 * Complete tour detail with all additional fields
 */
export interface TourDetail extends Omit<Tour, 'images'> {
  fullDescription: string;
  dayByDay: TourItineraryDay[];
  gallery: GalleryImage[];
  reviews: TourReview[];
  reviewSummary: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  };
  departureDates: string[];
  tourOperator?: string;
  groupSize?: string;
  startingPoint?: string;
  endingPoint?: string;
}

// ============================================================
// Type Utilities for CSS Class Generation
// ============================================================

/**
 * Template literal type for level-based styling
 */
export type LevelClass = `${TourLevel}-level`;

/**
 * Mapped type for level badge variants
 */
export type LevelBadgeVariant = {
  [K in TourLevel]: 'default' | 'secondary' | 'outline' | 'destructive';
};

export const levelBadgeVariants: LevelBadgeVariant = {
  Dễ: 'secondary',
  'Trung bình': 'outline',
  Khó: 'destructive',
  'Khám phá': 'default',
} as const;

/**
 * Utility type for optional tour fields with defaults
 */
export type TourWithDefaults = Required<Tour>;

export interface TourCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  /** Optional cover image used by the circular category pills on the List Tours page. */
  image?: string;
}

/**
 * UI-facing filter shape owned by the List Tours page.
 *
 * Mirrors {@link TourListParams} for the fields the API supports, plus
 * category for client-side UI display (the category chips don't drive a
 * query because the backend doesn't filter on category yet — see
 * `features/tours/pages/ListTours.tsx` for the note).
 */
export interface TourFilter {
  /** Free-text keyword sent as the `keyword` query param. */
  keyword?: string;
  /** Destination/location sent as the `location` query param. */
  location?: string;
  /** Difficulty enum sent as the `difficulty` query param. */
  difficulty?: ApiDifficulty;

  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'duration-asc' | 'duration-desc' | 'name-asc';
  departureDate?: string;
  returnDate?: string;
}

// ============================================================
// API Types for List Tours
// ============================================================

/**
 * Difficulty levels from the API
 */
export type ApiDifficulty = 'EASY' | 'MODERATE' | 'HARD' | 'EXTREME';

/**
 * Status values from the API
 */
export type ApiStatus = 'DRAFT' | 'PUBLISHED' | 'HIDDEN';

/**
 * Allowed sort directions from the API
 */
export type ApiSortDir = 'asc' | 'desc';

export type ApiSortField = 'createdAt' | 'price' | 'durationDays' | 'tourName';

/**
 * Query params for fetching tours list.
 *
 * Source of truth: Swagger screenshots for `/api/v1/tours`. The backend
 * currently accepts:
 *   - keyword       (string, free-text search)
 *   - location      (string, exact-match location filter)
 *   - difficulty    (string, one of ApiDifficulty)
 *   - page          (integer, default 0)
 *   - size          (integer, default 10)
 *   - sortBy        (string, default 'createdAt')
 *   - sortDir       (string, default 'desc')
 *
 * Future server-side filters (price min/max, duration range, rating,
 * date range, category, status) are intentionally NOT typed here so
 * the FE never sends params the BE ignores. Add them once the BE
 * supports them.
 */
export interface TourListParams {
  keyword?: string;
  location?: string;
  difficulty?: ApiDifficulty;
  departureDate?: string;
  returnDate?: string;

  vendorId?: string;
  page?: number;
  size?: number;
  sortBy?: ApiSortField;
  sortDir?: ApiSortDir;
}

/**
 * Individual tour item from API response
 */
export interface TourApiItem {
  tourId: string;
  tourName: string;
  location: string;
  durationDays: number;
  price: number;
  minCapacity: number;
  maxCapacity: number;
  totalDistanceKm: number;
  difficulty: ApiDifficulty;
  status: ApiStatus;
  coverImageUrl: string;
  highlights: string;
  includes: string;
  excludes: string;
  vendorId: string;
  vendorName: string;
  createdAt: string;
  category?: string;
}

export type FitnessLevel = 'ANY' | 'BASIC' | 'MODERATE' | 'HIGH' | 'EXTREME';

export interface TourParticipationPolicy {
  tourId: string;
  policyVersion: number;
  minAge?: number | null;
  maxAge?: number | null;
  minHeightCm?: number | null;
  maxHeightCm?: number | null;
  minWeightKg?: number | null;
  maxWeightKg?: number | null;
  fitnessLevel: FitnessLevel;
  healthRequirements?: string | null;
  restrictedMedicalConditions?: string | null;
  requiredExperience?: string | null;
  requiredSkills?: string | null;
  requiredEquipment?: string | null;
  requiredDocuments?: string | null;
  requiresHealthDeclaration: boolean;
  requiresMedicalCertificate: boolean;
  guardianRequiredUnderAge?: number | null;
  additionalRequirements?: string | null;
}

/**
 * Paginated response from tours API
 */
export interface TourListApiResponse {
  content: TourApiItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ============================================================
// API Types for Tour Detail (GET /api/v1/tours/{tourId})
// ============================================================

/**
 * Image object from the tour detail API response
 */
export interface TourDetailImageApi {
  imageId: string;
  imageUrl: string;
  sortOrder: number;
  caption: string | null;
}

/**
 * Schedule object from the tour detail API response
 */
export interface TourDetailScheduleApi {
  scheduleId: string;
  tourId: string;
  departureDate: string;
  returnDate: string;

  status: 'OPEN' | 'CLOSED' | 'CANCELLED' | 'COMPLETED';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  deletedAt: string | null;
  deletedBy: string | null;
}

/**
 * Full tour detail from the API endpoint: GET /api/v1/tours/{tourId}
 *
 * This mirrors the `data` field inside the standard envelope
 * `{ success, code, message, data, timestamp }`.
 */
export interface TourDetailFromApi {
  tourId: string;
  tourName: string;
  description: string;
  difficulty: ApiDifficulty;
  location: string;
  durationDays: number;
  price: number;
  minCapacity: number;
  maxCapacity: number;
  totalDistanceKm: number;
  highlights: string | null;
  includes: string | null;
  excludes: string | null;
  coverImageUrl: string | null;
  status: ApiStatus;
  createdAt: string;
  updatedAt: string | null;
  vendorId: string;
  vendorManagerId: string;
  vendorName: string;
  vendorLogoUrl: string | null;
  vendorContactEmail: string | null;
  vendorContactPhone: string | null;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  images: TourDetailImageApi[];
  schedules: TourDetailScheduleApi[];

  participationPolicy?: TourParticipationPolicy | null;
}

export interface TourSearchValues {
  keyword: string;
}

// ============================================================
// API Types for Recommended Tours (GET /api/v1/tours/recommended)
// ============================================================

export type RecommendationReason =
  | 'AREA'
  | 'BEHAVIOR'
  | 'SIMILAR_TO_HISTORY'
  | 'DIFFICULTY'
  | 'SKILL_PROGRESSION'
  | 'EXPERIENCE'
  | 'SCHEDULE_FLEXIBILITY'
  | 'AVAILABLE_GROUP'
  | 'POPULAR'
  | 'DISCOVERY';

export interface RecommendedTourSummaryApi {
  tourId: string;
  tourName: string;
  location: string;
  durationDays: number;
  price: number;
  minCapacity: number;
  maxCapacity: number;
  totalDistanceKm: number;
  difficulty: ApiDifficulty;
  status: ApiStatus;
  coverImageUrl: string | null;
  highlights: string | null;
  includes: string | null;
  excludes: string | null;
  vendorId: string;
  vendorName: string;
  createdAt: string;
  publishedAt: string | null;
}

export interface RecommendedTourApiItem {
  tour: RecommendedTourSummaryApi;
  matchReasons: RecommendationReason[];
}

export interface RecommendedTourListApiResponse {
  content: RecommendedTourApiItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface TourCheckpoint {
  checkpointId: string;
  tourId: string;
  checkpointName: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  checkpointOrder: number;
  checkpointImageUrl: string | null;

  checkpointImageUrls?: string[];
}
