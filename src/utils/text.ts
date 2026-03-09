/**
 * Lightweight utility to convert numbers to Dutch words.
 * Handles numbers from 0 to 9999.
 */
export function numberToDutchWords(n: number): string {
    if (n === 0) return 'nul';
    if (n < 0) return 'min ' + numberToDutchWords(Math.abs(n));

    const units = ['', 'één', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen'];
    const teens = ['tien', 'elf', 'twaalf', 'dertien', 'veertien', 'vijftien', 'zestien', 'zeventien', 'achttien', 'negentien'];
    const tens = ['', 'tien', 'twintig', 'dertig', 'veertig', 'vijftig', 'zestig', 'zeventig', 'tachtig', 'negentig'];

    let words = '';

    if (n >= 1000) {
        const thousands = Math.floor(n / 1000);
        words += (thousands === 1 ? '' : units[thousands]) + 'duizend';
        n %= 1000;
    }

    if (n >= 100) {
        const hundreds = Math.floor(n / 100);
        words += (hundreds === 1 ? '' : units[hundreds]) + 'honderd';
        n %= 100;
    }

    if (n > 0) {
        if (words !== '' && n < 10) words += 'en'; // e.g. honderdenéén (though often just honderd één)

        if (n < 10) {
            words += units[n];
        } else if (n < 20) {
            words += teens[n - 10];
        } else {
            const ten = Math.floor(n / 10);
            const unit = n % 10;
            if (unit === 0) {
                words += tens[ten];
            } else {
                // Inverted tens-ones: eenentwintig
                let connector = 'en';
                if (units[unit].endsWith('e')) connector = 'ënt'; // tweeëntwintig, drieëntwintig
                else if (unit === 3) connector = 'ënt'; // drie is special too

                // Re-calculating connector properly for Dutch
                // 22: tweeëntwintig
                // 23: drieëntwintig
                // 24: vierentwintig
                const unitWord = units[unit];
                const tenWord = tens[ten];

                if (unitWord === 'twee' || unitWord === 'drie') {
                    words += unitWord + 'ën' + tenWord;
                } else {
                    words += unitWord + 'en' + tenWord;
                }
            }
        }
    }

    return words.trim();
}

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
            return numberToDutchWords(parseInt(match, 10));
        } catch (e) {
            return match;
        }
    });

    // Lowercase and remove punctuation
    return withWords.toLowerCase().replace(/[.,!?;:]/g, '').trim();
}
