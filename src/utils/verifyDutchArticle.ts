import { VOCABULARY_DATA } from '@/data/vocabulary';

/**
 * Checks a generated noun's article against the app's own vocabulary.
 *
 * The model gets de/het wrong often enough to matter, and it is precisely the part a
 * learner cannot work out for themselves. We now have 876 curated, corrected entries,
 * so where the word is one of ours the article is a fact rather than a guess.
 *
 * Deliberately narrow: this verifies articles for words we know. It says nothing about
 * words outside the list, and it is not a spell checker — a dictionary this size would
 * flag most correct Dutch as unknown.
 */

/** base noun (lowercased, no article) -> "de" | "het", built once. */
let articleIndex: Map<string, string> | null = null;

function buildIndex(): Map<string, string> {
  const index = new Map<string, string>();
  for (const category of VOCABULARY_DATA) {
    for (const word of category.words ?? []) {
      const match = /^(de|het)\s+(.+)$/i.exec(word.dutch.trim());
      if (!match) continue;
      const article = match[1].toLowerCase();
      const noun = match[2].toLowerCase();
      // First entry wins; the data has no conflicting duplicates after the audit.
      if (!index.has(noun)) index.set(noun, article);
    }
  }
  return index;
}

export interface ArticleCheck {
  /** The word with the article we believe is right. */
  corrected: string;
  /** True when the generated article disagreed with our data. */
  wasWrong: boolean;
}

/**
 * Returns null when the noun is not in our vocabulary, or the input carries no
 * article — in both cases we have nothing trustworthy to say.
 */
export function verifyDutchArticle(dutch: string): ArticleCheck | null {
  const match = /^(de|het)\s+(.+)$/i.exec(dutch.trim());
  if (!match) return null;

  const given = match[1].toLowerCase();
  const noun = match[2].trim();

  if (!articleIndex) articleIndex = buildIndex();
  const known = articleIndex.get(noun.toLowerCase());
  if (!known) return null;

  return { corrected: `${known} ${noun}`, wasWrong: known !== given };
}
