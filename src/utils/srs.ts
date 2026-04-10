/**
 * SM-2 Spaced Repetition Algorithm
 * Based on the SuperMemo SM-2 algorithm by Piotr Woźniak.
 *
 * Quality grades (passed to calculateNextReview):
 *   2 = Hard   (barely remembered, resets streak)
 *   3 = Good   (remembered with some effort)
 *   5 = Easy   (remembered instantly)
 */

export interface WordSRSData {
  wordId: string;
  easeFactor: number;   // Starts at 2.5; range [1.3, ∞)
  interval: number;     // Days until next review
  repetitions: number;  // Consecutive correct reviews
  nextReview: string;   // YYYY-MM-DD
  lastQuality: number;  // 0–5
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function DEFAULT_SRS_DATA(wordId: string): WordSRSData {
  return {
    wordId,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: todayISO(),
    lastQuality: 0,
  };
}

export function isDue(data: WordSRSData): boolean {
  return data.nextReview <= todayISO();
}

export function calculateNextReview(data: WordSRSData, quality: number): WordSRSData {
  let { easeFactor, interval, repetitions } = data;

  if (quality < 3) {
    // Failed — reset streak but keep ease factor penalty
    repetitions = 0;
    interval = 1;
  } else {
    // Passed — advance
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor: EF' = EF + (0.1 − (5 − q) × (0.08 + (5 − q) × 0.02))
  easeFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );

  return {
    ...data,
    easeFactor,
    interval,
    repetitions,
    nextReview: addDays(todayISO(), interval),
    lastQuality: quality,
  };
}

/** Mastery label based on SRS state */
export function masteryLevel(data: WordSRSData | undefined): 'new' | 'learning' | 'review' | 'mastered' {
  if (!data || data.repetitions === 0) return 'new';
  if (data.repetitions <= 2) return 'learning';
  if (data.interval >= 21) return 'mastered';
  return 'review';
}
