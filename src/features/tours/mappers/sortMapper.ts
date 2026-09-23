import type { ApiSortDir, ApiSortField, TourFilter } from '../types';

/**
 * Maps the UI sort key to the (sortBy, sortDir) pair expected by the backend API.
 */
export function resolveTourSort(sortBy: TourFilter['sortBy']): {
  sortBy: ApiSortField;
  sortDir: ApiSortDir;
} {
  switch (sortBy) {
    case 'price-asc':
      return { sortBy: 'price', sortDir: 'asc' };
    case 'price-desc':
      return { sortBy: 'price', sortDir: 'desc' };
    case 'newest':
      return { sortBy: 'createdAt', sortDir: 'desc' };
    case 'duration-asc':
      return { sortBy: 'durationDays', sortDir: 'asc' };
    case 'duration-desc':
      return { sortBy: 'durationDays', sortDir: 'desc' };
    case 'name-asc':
      return { sortBy: 'tourName', sortDir: 'asc' };
    default:
      return { sortBy: 'createdAt', sortDir: 'desc' };
  }
}
