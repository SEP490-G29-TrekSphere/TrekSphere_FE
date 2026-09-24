import type { SyntheticEvent } from 'react';
import type { ApiDifficulty, TourCheckpoint, TourDetailScheduleApi } from '@/features/tours/types';

export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80';

export const DIFFICULTY_LABELS: Record<ApiDifficulty | string, string> = {
  EASY: 'Dễ',
  MODERATE: 'Trung bình',
  HARD: 'Khó',
  EXTREME: 'Cực khó',
};

export const DIFFICULTY_LEVEL: Record<ApiDifficulty | string, number> = {
  EASY: 1,
  MODERATE: 2,
  HARD: 3,
  EXTREME: 4,
};

export const DIFFICULTY_TAGS: Record<ApiDifficulty | string, string> = {
  EASY: 'Cung đường dễ',
  MODERATE: 'Cung đường trung bình',
  HARD: 'Cung đường thách thức',
  EXTREME: 'Cung đường cực khó',
};

export function splitField(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Splits free text authored as dash-bulleted, newline-separated lines
 * (the pattern the tour create/edit form asks vendors to type, e.g.
 * "- Item one\n- Item two") into individual, trimmed list items.
 *
 * `splitField` above intentionally splits on commas instead — it stays
 * dedicated to comma-joined checkpoint image URLs (see
 * `getCheckpointImageUrls`) and must not be reused for this.
 */
export function splitLines(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split('\n')
    .map((line) => line.trim().replace(/^[-*•]\s*/, ''))
    .filter(Boolean);
}

export function getCheckpointImageUrls(
  checkpoint: Pick<TourCheckpoint, 'checkpointImageUrl' | 'checkpointImageUrls'>
): string[] {
  const urls =
    checkpoint.checkpointImageUrls && checkpoint.checkpointImageUrls.length > 0
      ? checkpoint.checkpointImageUrls
      : splitField(checkpoint.checkpointImageUrl);

  return [...new Set(urls.map((url) => url.trim()).filter(Boolean))];
}

export function handleImageFallback(event: SyntheticEvent<HTMLImageElement>): void {
  const img = event.currentTarget;
  if (img.src !== FALLBACK_IMAGE) img.src = FALLBACK_IMAGE;
}

export function isBookableSchedule(schedule: TourDetailScheduleApi): boolean {
  return schedule.status === 'OPEN';
}

export function sortSchedulesByDeparture(
  schedules: TourDetailScheduleApi[]
): TourDetailScheduleApi[] {
  return [...schedules].sort(
    (a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime()
  );
}

export interface TourSection {
  id: string;
  label: string;
}

export const SECTION_IDS = {
  overview: 'tong-quan',
  schedules: 'lich-khoi-hanh',
  route: 'lo-trinh',
  inclusions: 'bao-gom',
  gallery: 'hinh-anh',
  requirements: 'dieu-kien-tham-gia',
  policy: 'chinh-sach',
} as const;

export const SECTION_SCROLL_OFFSET = 140;
