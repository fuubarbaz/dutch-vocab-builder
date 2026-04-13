export type PronunciationExample = {
  dutch: string;      // the Dutch word / phrase
  phonetic: string;   // rough phonetic hint in English
  meaning: string;    // English gloss
};

export type PronunciationRule = {
  id: string;
  sound: string;          // the letter(s) or label shown in the badge
  title: string;          // short name
  description: string;    // one-sentence explanation
  tip: string;            // memory aid / extra detail
  examples: PronunciationExample[];
  color: string;          // accent colour for the card
};

export type PronunciationCategory = {
  id: string;
  label: string;
  rules: PronunciationRule[];
};

export const PRONUNCIATION_CATEGORIES: PronunciationCategory[] = [
  // ─── VOWELS ────────────────────────────────────────────────────────────────
  {
    id: 'vowels',
    label: 'VOWELS',
    rules: [
      {
        id: 'aa',
        sound: 'AA',
        title: 'Long A',
        description: 'A long, open "ah" sound — like the a in "father" held slightly longer.',
        tip: 'A double-A or a single A in an open syllable are both long. Think of it as the most relaxed "ahh" you can make.',
        examples: [
          { dutch: 'naam', phonetic: 'nahm', meaning: 'name' },
          { dutch: 'maan', phonetic: 'mahn', meaning: 'moon' },
          { dutch: 'kaas', phonetic: 'kahs', meaning: 'cheese' },
          { dutch: 'straat', phonetic: 'straht', meaning: 'street' },
        ],
        color: '#e86912',
      },
      {
        id: 'short_a',
        sound: 'A',
        title: 'Short A',
        description: 'A clipped "ah" — like the a in "cat" but slightly more open.',
        tip: 'A single A in a closed syllable (ending in a consonant) is always short.',
        examples: [
          { dutch: 'man', phonetic: 'mun', meaning: 'man' },
          { dutch: 'bad', phonetic: 'but', meaning: 'bath' },
          { dutch: 'tas', phonetic: 'tus', meaning: 'bag' },
          { dutch: 'kat', phonetic: 'cut', meaning: 'cat' },
        ],
        color: '#e86912',
      },
      {
        id: 'ee',
        sound: 'EE',
        title: 'Long E',
        description: 'A pure, steady "ay" — like the e in "they" without the glide at the end.',
        tip: 'Keep your mouth tense and don\'t let it drift into an "ee" sound — Dutch long E is cleaner than English "ay".',
        examples: [
          { dutch: 'been', phonetic: 'bayn', meaning: 'leg / bone' },
          { dutch: 'zee', phonetic: 'zay', meaning: 'sea' },
          { dutch: 'veel', phonetic: 'fayl', meaning: 'much' },
          { dutch: 'nee', phonetic: 'nay', meaning: 'no' },
        ],
        color: '#059669',
      },
      {
        id: 'short_e',
        sound: 'E',
        title: 'Short E',
        description: 'Like the e in "bed" — short and open.',
        tip: 'A single E in a closed syllable. Very similar to English, so this one should feel natural.',
        examples: [
          { dutch: 'bed', phonetic: 'bet', meaning: 'bed' },
          { dutch: 'pet', phonetic: 'pet', meaning: 'cap / hat' },
          { dutch: 'weg', phonetic: 'vekh', meaning: 'road / away' },
          { dutch: 'met', phonetic: 'met', meaning: 'with' },
        ],
        color: '#059669',
      },
      {
        id: 'oo',
        sound: 'OO',
        title: 'Long O',
        description: 'A long, rounded "oh" — like the o in "go" but purer, with no glide.',
        tip: 'Round your lips firmly. Dutch OO doesn\'t drift into a "w" sound the way English "oh" sometimes does.',
        examples: [
          { dutch: 'boot', phonetic: 'boht', meaning: 'boat' },
          { dutch: 'rood', phonetic: 'roht', meaning: 'red' },
          { dutch: 'groot', phonetic: 'khroht', meaning: 'big' },
          { dutch: 'school', phonetic: 'skhohl', meaning: 'school' },
        ],
        color: '#2563eb',
      },
      {
        id: 'short_o',
        sound: 'O',
        title: 'Short O',
        description: 'A short, open "o" — like the o in "hot" (British pronunciation).',
        tip: 'Open your mouth a bit more than you would in English. Think of the British "not" rather than the American "not".',
        examples: [
          { dutch: 'bot', phonetic: 'bot', meaning: 'bone / blunt' },
          { dutch: 'rok', phonetic: 'rok', meaning: 'skirt' },
          { dutch: 'kom', phonetic: 'kom', meaning: 'bowl / come' },
          { dutch: 'slot', phonetic: 'slot', meaning: 'lock / castle' },
        ],
        color: '#2563eb',
      },
      {
        id: 'uu',
        sound: 'UU',
        title: 'Long U',
        description: 'Say "ee" with your lips rounded into a tight "oo" shape — like the French "u" or German "ü".',
        tip: 'This sound doesn\'t exist in English. Start with your tongue in "ee" position, then pucker your lips as if whistling.',
        examples: [
          { dutch: 'uur', phonetic: 'üür', meaning: 'hour' },
          { dutch: 'duur', phonetic: 'düür', meaning: 'expensive' },
          { dutch: 'muur', phonetic: 'müür', meaning: 'wall' },
          { dutch: 'uur', phonetic: 'üür', meaning: 'o\'clock' },
        ],
        color: '#7c3aed',
      },
      {
        id: 'short_u',
        sound: 'U',
        title: 'Short U',
        description: 'A short rounded vowel — like the u in French "tu" said very quickly.',
        tip: 'Similar to the UU but very brief. Often heard in unstressed syllables.',
        examples: [
          { dutch: 'bus', phonetic: 'büs', meaning: 'bus' },
          { dutch: 'mus', phonetic: 'müs', meaning: 'sparrow' },
          { dutch: 'kus', phonetic: 'küs', meaning: 'kiss' },
          { dutch: 'plus', phonetic: 'plüs', meaning: 'plus' },
        ],
        color: '#7c3aed',
      },
    ],
  },

  // ─── VOWEL COMBINATIONS ────────────────────────────────────────────────────
  {
    id: 'combos',
    label: 'VOWEL COMBINATIONS',
    rules: [
      {
        id: 'oe',
        sound: 'OE',
        title: 'OE — "oo" sound',
        description: 'Like the "oo" in "food" or "boot" — a long, tight rounded sound.',
        tip: 'This is the most straightforward Dutch combo. Every time you see OE, think "oo" as in "moon".',
        examples: [
          { dutch: 'boek', phonetic: 'book', meaning: 'book' },
          { dutch: 'moeder', phonetic: 'moo-der', meaning: 'mother' },
          { dutch: 'groep', phonetic: 'khroop', meaning: 'group' },
          { dutch: 'koek', phonetic: 'kook', meaning: 'cookie / cake' },
        ],
        color: '#0891b2',
      },
      {
        id: 'eu',
        sound: 'EU',
        title: 'EU — French-style "uh"',
        description: 'Like the "er" in British English "her", or the French "eu" in "peur".',
        tip: 'Say "eh" and then slowly round your lips. Your tongue stays forward but your lips pucker slightly. It\'s halfway between "ay" and "oh".',
        examples: [
          { dutch: 'deur', phonetic: 'dur (British)', meaning: 'door' },
          { dutch: 'leuk', phonetic: 'lurk', meaning: 'nice / fun' },
          { dutch: 'neus', phonetic: 'nurs', meaning: 'nose' },
          { dutch: 'beurs', phonetic: 'burs', meaning: 'stock exchange / purse' },
        ],
        color: '#d97706',
      },
      {
        id: 'ui',
        sound: 'UI',
        title: 'UI — Unique Dutch sound',
        description: 'The trickiest Dutch sound: a diphthong starting from a rounded EU position and moving up — not like any English vowel.',
        tip: 'Start your mouth in the EU position (lips rounded, tongue forward), then glide toward "ee". Some people describe it as "ow" with rounded lips. Practice with "huis" daily!',
        examples: [
          { dutch: 'huis', phonetic: 'h-OW-s (rounded)', meaning: 'house' },
          { dutch: 'uit', phonetic: 'OW-t (rounded)', meaning: 'out' },
          { dutch: 'buiten', phonetic: 'BOW-ten (rounded)', meaning: 'outside' },
          { dutch: 'tuin', phonetic: 'town (rounded)', meaning: 'garden' },
        ],
        color: '#dc2626',
      },
      {
        id: 'ij_ei',
        sound: 'IJ / EI',
        title: 'IJ and EI — same sound',
        description: 'Both spellings sound identical: like "ay" in "day" or the "i" in "like" — a diphthong from "eh" to "ee".',
        tip: 'IJ and EI are pronounced exactly the same — the difference is only in spelling. When in doubt, just say "ay".',
        examples: [
          { dutch: 'ijs', phonetic: 'ice', meaning: 'ice / ice cream' },
          { dutch: 'zijn', phonetic: 'zayn', meaning: 'to be' },
          { dutch: 'klein', phonetic: 'klayn', meaning: 'small' },
          { dutch: 'rijden', phonetic: 'RAY-den', meaning: 'to drive / ride' },
        ],
        color: '#059669',
      },
      {
        id: 'au_ou',
        sound: 'AU / OU',
        title: 'AU and OU — same sound',
        description: 'Both sound like "ow" in "cow" or "how" — a clear diphthong.',
        tip: 'Like IJ/EI, AU and OU are always identical in sound. Think "cow" every time you see either.',
        examples: [
          { dutch: 'auto', phonetic: 'OW-toh', meaning: 'car' },
          { dutch: 'oud', phonetic: 'owt', meaning: 'old' },
          { dutch: 'blauw', phonetic: 'bloww', meaning: 'blue' },
          { dutch: 'goud', phonetic: 'khowt', meaning: 'gold' },
        ],
        color: '#b45309',
      },
    ],
  },

  // ─── CONSONANTS ───────────────────────────────────────────────────────────
  {
    id: 'consonants',
    label: 'CONSONANTS',
    rules: [
      {
        id: 'g_ch',
        sound: 'G / CH',
        title: 'G and CH — the Dutch throat sound',
        description: 'The most iconic Dutch sound: a voiced or voiceless fricative made at the back of the throat — like clearing your throat gently.',
        tip: 'Imagine fogging up a mirror from the back of your throat instead of the front. In northern Netherlands it\'s more "guttural"; in the south and Belgium it\'s softer. CH is always unvoiced (like clearing throat); G can be voiced.',
        examples: [
          { dutch: 'goed', phonetic: 'khoot', meaning: 'good' },
          { dutch: 'gaan', phonetic: 'khahn', meaning: 'to go' },
          { dutch: 'lachen', phonetic: 'LAH-khən', meaning: 'to laugh' },
          { dutch: 'acht', phonetic: 'ahkht', meaning: 'eight' },
          { dutch: 'nacht', phonetic: 'nahkht', meaning: 'night' },
        ],
        color: '#dc2626',
      },
      {
        id: 'sch',
        sound: 'SCH',
        title: 'SCH — S + throat sound',
        description: 'Pronounced as a plain "s" followed immediately by the Dutch guttural "ch". Not like English "sh".',
        tip: 'Never say "sh" for SCH! It\'s always "s-kh" — an s followed by the guttural sound. In some Dutch accents it approaches "s" alone at the end of words.',
        examples: [
          { dutch: 'school', phonetic: 's-khohl', meaning: 'school' },
          { dutch: 'schip', phonetic: 's-khip', meaning: 'ship' },
          { dutch: 'schoen', phonetic: 's-khoon', meaning: 'shoe' },
          { dutch: 'schrijven', phonetic: 's-KHRAY-vən', meaning: 'to write' },
        ],
        color: '#7c3aed',
      },
      {
        id: 'v_f',
        sound: 'V',
        title: 'V — softer than English V',
        description: 'Dutch V is softer than English V — somewhere between English "v" and "f". At the end of a word it often sounds like "f".',
        tip: 'Think of V as a "lazy f" at the start of a word. At word endings, Dutch consonants "devoice" — so "blauw" sounds like "blowf" and "leeg" sounds like "layk".',
        examples: [
          { dutch: 'vader', phonetic: 'FAH-der', meaning: 'father' },
          { dutch: 'van', phonetic: 'fun', meaning: 'of / from' },
          { dutch: 'vragen', phonetic: 'FRAH-khen', meaning: 'to ask' },
          { dutch: 'vrouw', phonetic: 'froww', meaning: 'woman / wife' },
        ],
        color: '#0891b2',
      },
      {
        id: 'w',
        sound: 'W',
        title: 'W — between V and W',
        description: 'Dutch W is made with both lips lightly touching the upper teeth — between English "v" and "w". Not a pure "w" like in English.',
        tip: 'Put your upper teeth very lightly on your lower lip (like making a "v") but voice it softly. It\'s more like a weak "v" than an English "w".',
        examples: [
          { dutch: 'water', phonetic: 'VAH-ter', meaning: 'water' },
          { dutch: 'werken', phonetic: 'VER-kən', meaning: 'to work' },
          { dutch: 'wonen', phonetic: 'VOH-nən', meaning: 'to live (in a place)' },
          { dutch: 'woord', phonetic: 'vohrt', meaning: 'word' },
        ],
        color: '#2563eb',
      },
      {
        id: 'r',
        sound: 'R',
        title: 'R — rolled or guttural',
        description: 'Dutch R varies by region: in the north it\'s often a guttural R (like French); in some areas it\'s a tap or trill with the tongue tip.',
        tip: 'The easiest starting point is the French-style R — vibrate at the back of your throat. Over time you\'ll pick up the regional variant you hear most.',
        examples: [
          { dutch: 'rood', phonetic: 'roht', meaning: 'red' },
          { dutch: 'straat', phonetic: 'straht', meaning: 'street' },
          { dutch: 'rijden', phonetic: 'RAY-dən', meaning: 'to ride' },
          { dutch: 'moeder', phonetic: 'MOO-der', meaning: 'mother' },
        ],
        color: '#059669',
      },
      {
        id: 'n_silent',
        sound: '-N',
        title: 'Silent N at word endings',
        description: 'The final -N in verb and noun endings is often dropped in casual speech, especially in the western Netherlands (including Amsterdam).',
        tip: 'Words like "lopen" (to walk), "maken" (to make), and "een" (a/an, when unstressed) are often said without the final N in everyday conversation. You\'ll still see the N in writing.',
        examples: [
          { dutch: 'lopen', phonetic: 'LOH-puh', meaning: 'to walk (casual)' },
          { dutch: 'maken', phonetic: 'MAH-kuh', meaning: 'to make (casual)' },
          { dutch: 'eten', phonetic: 'AY-tuh', meaning: 'to eat (casual)' },
          { dutch: 'een', phonetic: 'uh', meaning: 'a / an (unstressed)' },
        ],
        color: '#6b7280',
      },
    ],
  },

  // ─── STRESS & RHYTHM ──────────────────────────────────────────────────────
  {
    id: 'stress',
    label: 'STRESS & RHYTHM',
    rules: [
      {
        id: 'word_stress',
        sound: '\'',
        title: 'Word stress',
        description: 'In native Dutch words, stress usually falls on the first syllable. Loanwords often keep their original stress.',
        tip: 'When in doubt, stress the first syllable. Exceptions include separable verbs and borrowed words (e.g., "ka-FÉ", "mu-ZI-um").',
        examples: [
          { dutch: 'KINderen', phonetic: 'KIN-dər-ən', meaning: 'children' },
          { dutch: 'BEGrijpen', phonetic: 'bə-KHRAY-pən', meaning: 'to understand' },
          { dutch: 'GEzellig', phonetic: 'khə-ZEL-ikh', meaning: 'cosy / fun' },
          { dutch: 'politie', phonetic: 'poh-LEE-tsee', meaning: 'police' },
        ],
        color: '#e86912',
      },
      {
        id: 'schwa',
        sound: 'ə',
        title: 'The schwa — unstressed "uh"',
        description: 'Unstressed syllables (especially -en, -er, -el, -em) reduce to a neutral "uh" sound called the schwa.',
        tip: 'Almost every unstressed E in Dutch reduces to this lazy "uh" sound. It\'s the most common vowel sound in Dutch — relax your mouth completely to produce it.',
        examples: [
          { dutch: 'de', phonetic: 'də', meaning: 'the (unstressed)' },
          { dutch: 'maken', phonetic: 'MAH-kən', meaning: 'to make' },
          { dutch: 'open', phonetic: 'OH-pən', meaning: 'open' },
          { dutch: 'water', phonetic: 'VAH-tər', meaning: 'water' },
        ],
        color: '#6b7280',
      },
    ],
  },
];
