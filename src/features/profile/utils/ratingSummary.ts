import type { PeerReviewItem } from '@/features/companion-groups/services/peerReviewService';

export interface PeerReviewSummary {
  totalReviews: number;

  overallAverage: number | null;
  enduranceAverage: number | null;
  punctualityAverage: number | null;
  financeAverage: number | null;

  starCounts: Record<number, number>;
}

const EMPTY_STAR_COUNTS: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

function average(total: number, count: number): number | null {
  return count > 0 ? total / count : null;
}

export function summarizePeerReviews(reviews: PeerReviewItem[]): PeerReviewSummary {
  const starCounts: Record<number, number> = { ...EMPTY_STAR_COUNTS };
  let sumOverall = 0;
  let sumEndurance = 0;
  let sumPunctuality = 0;
  let sumFinance = 0;

  for (const review of reviews) {
    const overall =
      Number(review.averageRating) ||
      (review.actualEnduranceRating +
        review.punctualityResponsibilityRating +
        review.financialFairnessRating) /
        3;

    sumOverall += overall;
    const rounded = Math.min(5, Math.max(1, Math.round(overall)));
    starCounts[rounded] = (starCounts[rounded] ?? 0) + 1;

    sumEndurance += review.actualEnduranceRating ?? 0;
    sumPunctuality += review.punctualityResponsibilityRating ?? 0;
    sumFinance += review.financialFairnessRating ?? 0;
  }

  const totalReviews = reviews.length;

  return {
    totalReviews,
    overallAverage: average(sumOverall, totalReviews),
    enduranceAverage: average(sumEndurance, totalReviews),
    punctualityAverage: average(sumPunctuality, totalReviews),
    financeAverage: average(sumFinance, totalReviews),
    starCounts,
  };
}

export function formatRatingValue(value: number | null): string {
  return value === null ? '—' : value.toFixed(1);
}
