/**
 * Tours feature index
 * Export all public APIs from the tours feature
 */

// Components
export { default as TourCard } from './components/TourCard';
export { default as TourFilters } from './components/TourFilters';
export { default as ToursHeader } from './components/ToursHeader';

// Tour Details Components
export * from './components/tour-details';

// Data
export { popularFilters, tourCategories, tourDetails, tours } from './data/tours';

// Hooks
export { useTours } from './hooks/useTours';

// Pages
export { default as ListTours } from './pages/ListTours';
export { default as TourDetailsPage } from './pages/TourDetails';

// Services
export { tourService } from './services/tourService';

// Types
export type {
  BookingFormState,
  GalleryImage,
  LevelBadgeVariant,
  LevelClass,
  Tour,
  TourApiItem,
  TourCategory,
  TourDetail,
  TourFilter,
  TourItineraryDay,
  TourLevel,
  TourListApiResponse,
  TourListParams,
  TourReview,
  TourTabId,
  TourTabState,
  TourWithDefaults,
} from './types';
