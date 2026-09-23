/**
 * Calculates approximate word count and estimated reading time (~200 words/min).
 */
export function computeReadStats(content: string): { words: number; minutes: number } {
  const words = content.trim().length === 0 ? 0 : content.trim().split(/\s+/).length;
  const minutes = words === 0 ? 0 : Math.max(1, Math.round(words / 200));
  return { words, minutes };
}
