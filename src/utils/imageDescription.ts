import { extractJsonObject } from './aiJson';
import { verifyDutchArticle } from './verifyDutchArticle';

export interface DescribedWord {
  /** Dutch word, nouns carrying their article: "de tafel". */
  dutch: string;
  english: string;
  /** True when our own vocabulary disagreed with the model's article and won. */
  articleCorrected?: boolean;
}

export interface ImageDescription {
  dutch: string;
  english: string;
  words: DescribedWord[];
}

/**
 * Returns null unless there is Dutch to show.
 *
 * The English and the word list are both optional in practice — a small model
 * sometimes returns only the description — but a card with no Dutch on it is not
 * worth rendering in a Dutch learning app.
 */
export function parseImageDescription(raw: string): ImageDescription | null {
  const parsed = extractJsonObject(raw);
  if (!parsed) return null;

  const dutch = typeof parsed.dutch === 'string' ? parsed.dutch.trim() : '';
  if (!dutch) return null;

  const words: DescribedWord[] = Array.isArray(parsed.words)
    ? parsed.words
        .filter((w: any) => w && typeof w.dutch === 'string' && w.dutch.trim())
        .map((w: any) => {
          const dutch = String(w.dutch).trim();
          // Where the noun is one of ours, our article is the authority.
          const checked = verifyDutchArticle(dutch);
          return {
            dutch: checked ? checked.corrected : dutch,
            english: typeof w.english === 'string' ? w.english.trim() : '',
            articleCorrected: checked?.wasWrong ?? false,
          };
        })
    : [];

  return {
    dutch,
    english: typeof parsed.english === 'string' ? parsed.english.trim() : '',
    words,
  };
}
