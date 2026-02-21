
export interface SRSResult {
  interval: number;
  repetition: number;
  easeFactor: number;
  nextReview: Date;
}

export function calculateSRS(
  quality: number, // 0-5
  previousInterval: number,
  previousRepetition: number,
  previousEaseFactor: number
): SRSResult {
  let interval = 0;
  let repetition = previousRepetition;
  let easeFactor = previousEaseFactor;

  if (quality >= 3) {
    if (previousRepetition === 0) {
      interval = 1;
    } else if (previousRepetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(previousInterval * previousEaseFactor);
    }
    repetition += 1;
  } else {
    repetition = 0;
    interval = 1;
  }

  easeFactor = previousEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    interval,
    repetition,
    easeFactor,
    nextReview,
  };
}
