/**
 * SM-2 Spaced Repetition Algorithm
 *
 * Rating scale:
 *   0 = Again (complete blackout)
 *   3 = Hard  (significant difficulty)
 *   4 = Good  (correct with some hesitation)
 *   5 = Easy  (perfect recall)
 */

export interface SM2Input {
  easeFactor: number;
  interval: number;
  repetitions: number;
}

export interface SM2Output {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string; // ISO date string (YYYY-MM-DD)
}

export function calculateSM2(input: SM2Input, rating: number): SM2Output {
  let { easeFactor, interval, repetitions } = input;

  if (rating < 3) {
    // Failed — reset to beginning
    repetitions = 0;
    interval = 0;
  } else {
    // Successful recall
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor (minimum 1.3)
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
  );

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  const nextReviewDate = nextDate.toISOString().split("T")[0];

  return { easeFactor, interval, repetitions, nextReviewDate };
}

export const RATING_OPTIONS = [
  { value: 0, label: "Again", description: "Complete blackout", color: "text-red-600 dark:text-red-400" },
  { value: 3, label: "Hard", description: "Significant difficulty", color: "text-orange-600 dark:text-orange-400" },
  { value: 4, label: "Good", description: "Correct with hesitation", color: "text-blue-600 dark:text-blue-400" },
  { value: 5, label: "Easy", description: "Perfect recall", color: "text-green-600 dark:text-green-400" },
] as const;
