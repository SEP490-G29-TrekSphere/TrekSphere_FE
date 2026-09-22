/**
 * Trust Score & Completed Trips Calculator.
 * Single source of truth for user reputation metrics across companion groups, join request reviews, and profiles.
 * Scale: Normalized 0-100 score.
 */

/** Stable hash generator for baseline demo score (70-99 range). */
function baseTrustScore(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) % 1000;
  }
  return 70 + (hash % 30);
}

/** In-memory store for peer review bonuses aggregated by userId. */
const trustScoreBonusByUserId: Record<string, number> = {};

/**
 * Computes the aggregate trust score for a given user, clamped to [0, 100].
 */
export function computeTrustScore(userId: string): number {
  const bonus = trustScoreBonusByUserId[userId] ?? 0;
  return Math.max(0, Math.min(100, baseTrustScore(userId) + bonus));
}

/**
 * Adds bonus points from a submitted peer review to the user's trust score.
 */
export function addTrustScoreBonus(userId: string, bonus: number): void {
  trustScoreBonusByUserId[userId] = (trustScoreBonusByUserId[userId] ?? 0) + bonus;
}

/**
 * Computes a deterministic completed trips count (0-11) for demo data based on userId hash.
 */
export function computeCompletedTrips(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 17 + userId.charCodeAt(i)) % 100;
  }
  return hash % 12;
}
