import n2words from 'n2words';

/**
 * Normalizes Dutch text by converting any digits into written words.
 * This is useful for string similarity comparisons where the speech
 * recognition API returns digits (e.g. "80") but the target string
 * uses words ("tachtig"), or vice versa.
 */
export function normalizeDutchText(text: string): string {
    if (!text) return '';

    // Convert digits to Dutch words
    const withWords = text.replace(/\b\d+\b/g, (match) => {
        try {
            return n2words(parseInt(match, 10), { lang: 'nl' });
        } catch (e) {
            return match;
        }
    });

    // Lowercase and remove punctuation
    return withWords.toLowerCase().replace(/[.,!?;:]/g, '').trim();
}
