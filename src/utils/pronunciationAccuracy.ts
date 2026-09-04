import levenshtein from 'fast-levenshtein';
import { normalizeDutchText } from './text';

/**
 * How close a spoken attempt is to the target, as a percentage.
 *
 * Edit distance over the normalised strings — the same scoring the pronunciation and
 * sentence-practice screens each had their own copy of. It measures what the recogniser
 * *heard*, so it rewards saying the right words; it is not a judgement of accent.
 */
export function pronunciationAccuracy(target: string, spoken: string): number {
  const distance = levenshtein.get(
    normalizeDutchText(target).toLowerCase(),
    normalizeDutchText(spoken).toLowerCase(),
  );
  const longest = Math.max(target.length, spoken.length);
  if (longest === 0) return 100;
  return Math.max(0, Math.round((1 - distance / longest) * 100));
}
