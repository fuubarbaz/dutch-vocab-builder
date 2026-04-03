// ============================================================================
// Grammar Topics Data
// Each topic has explanations (English), examples (Dutch + English), and quiz questions.
// Used by the Grammar hub and Grammar topic detail screens.
// ============================================================================

export type QuizQuestionType = 'multiple_choice' | 'fill_blank' | 'translate';

export interface GrammarExample {
  dutch: string;
  english: string;
}

export interface GrammarQuizQuestion {
  id: string;
  type: QuizQuestionType;
  prompt: string;
  correctAnswer: string;
  options?: string[];
  hint?: string;
  explanation: string;
}

export interface GrammarTopic {
  id: string;
  title: string;
  level: 'basic' | 'advanced';
  order: number;
  icon: string;
  description: string;
  explanation: string;
  keyRules: string[];
  examples: GrammarExample[];
  quizQuestions: GrammarQuizQuestion[];
}

// ============================================================================
// BASIC TOPICS (8)
// ============================================================================

const BASIC_TOPICS: GrammarTopic[] = [
  // --------------------------------------------------------------------------
  // 1. Sentence Basics
  // --------------------------------------------------------------------------
  {
    id: 'sentence-basics',
    title: 'Sentence Basics',
    level: 'basic',
    order: 1,
    icon: 'text-outline',
    description: 'Word order, yes/no questions, and simple negation.',
    explanation:
      'Dutch main clauses follow Subject-Verb-Object (SVO) order, just like English. The verb always takes the second position in a statement. To form a yes/no question, move the verb to the first position (inversion). Dutch has two negation words: "niet" (not) negates verbs, adjectives, and adverbs, while "geen" (no/not any) negates indefinite nouns.',
    keyRules: [
      'Main clause word order: Subject + Verb + Object (SVO)',
      'Yes/No questions: Verb + Subject + Object',
      '"niet" negates verbs, adjectives, and adverbs',
      '"geen" replaces "een" or negates uncountable/plural nouns without articles',
      '"niet" usually goes at the end, or before what it negates',
    ],
    examples: [
      { dutch: 'Ik eet een appel.', english: 'I eat an apple.' },
      { dutch: 'Eet jij een appel?', english: 'Do you eat an apple?' },
      { dutch: 'Ik eet geen appel.', english: "I don't eat an apple." },
      { dutch: 'Hij werkt niet.', english: "He doesn't work." },
      { dutch: 'Zij is niet groot.', english: 'She is not tall.' },
    ],
    quizQuestions: [
      {
        id: 'sb-1',
        type: 'multiple_choice',
        prompt: 'What is the standard word order in a Dutch main clause?',
        correctAnswer: 'Subject - Verb - Object',
        options: ['Verb - Subject - Object', 'Subject - Verb - Object', 'Object - Verb - Subject', 'Subject - Object - Verb'],
        explanation: 'Dutch main clauses follow SVO order. The verb always takes the second position.',
      },
      {
        id: 'sb-2',
        type: 'multiple_choice',
        prompt: 'How do you form a yes/no question in Dutch?',
        correctAnswer: 'Move the verb to the first position',
        options: ['Add "do" before the verb', 'Move the verb to the first position', 'Add a question mark only', 'Use "of" at the start'],
        explanation: 'In Dutch yes/no questions, the verb moves to position 1 (inversion): "Eet jij?" instead of "Jij eet."',
      },
      {
        id: 'sb-3',
        type: 'fill_blank',
        prompt: 'Ik heb ___ auto. (I have no car.)',
        correctAnswer: 'geen',
        hint: 'Which negation word replaces "een"?',
        explanation: '"Geen" is used to negate indefinite nouns. It replaces "een" (a/an).',
      },
      {
        id: 'sb-4',
        type: 'fill_blank',
        prompt: 'Hij werkt ___. (He does not work.)',
        correctAnswer: 'niet',
        hint: 'Which negation word is used for verbs?',
        explanation: '"Niet" is used to negate verbs. It usually goes at the end of the clause.',
      },
      {
        id: 'sb-5',
        type: 'translate',
        prompt: 'Translate: "Do you drink coffee?"',
        correctAnswer: 'Drink jij koffie?',
        hint: 'Remember: verb first for questions',
        explanation: 'In yes/no questions, the verb comes first: "Drink jij koffie?"',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 2. Nouns & Articles
  // --------------------------------------------------------------------------
  {
    id: 'nouns-articles',
    title: 'Nouns & Articles',
    level: 'basic',
    order: 2,
    icon: 'bookmark-outline',
    description: 'de/het articles, plurals, and diminutives.',
    explanation:
      'Dutch has two definite articles: "de" (common gender) and "het" (neuter gender). There is one indefinite article: "een" (a/an). Unfortunately, there is no simple rule to predict whether a noun uses "de" or "het" \u2014 you must memorize them. Plurals typically end in -en or -s. Diminutives (small/cute versions) always use "het" and add -je, -tje, -pje, or -etje to the noun.',
    keyRules: [
      '"de" is used for common gender nouns (about 2/3 of all nouns)',
      '"het" is used for neuter gender nouns (about 1/3 of all nouns)',
      '"een" is the indefinite article for both genders',
      'Most plurals add -en (boek \u2192 boeken) or -s (tafel \u2192 tafels)',
      'Diminutives always use "het" and add -je (huis \u2192 het huisje)',
    ],
    examples: [
      { dutch: 'de man, de vrouw, de tafel', english: 'the man, the woman, the table' },
      { dutch: 'het kind, het huis, het boek', english: 'the child, the house, the book' },
      { dutch: 'een man, een huis', english: 'a man, a house' },
      { dutch: 'boeken, tafels, kinderen', english: 'books, tables, children' },
      { dutch: 'het huisje, het hondje, het bloemetje', english: 'the little house, the little dog, the little flower' },
    ],
    quizQuestions: [
      {
        id: 'na-1',
        type: 'multiple_choice',
        prompt: 'Which article goes with "boek" (book)?',
        correctAnswer: 'het',
        options: ['de', 'het', 'een', 'die'],
        explanation: '"Boek" is a neuter noun, so it uses "het boek".',
      },
      {
        id: 'na-2',
        type: 'multiple_choice',
        prompt: 'Which article goes with "vrouw" (woman)?',
        correctAnswer: 'de',
        options: ['de', 'het', 'der', 'den'],
        explanation: '"Vrouw" is a common gender noun, so it uses "de vrouw".',
      },
      {
        id: 'na-3',
        type: 'fill_blank',
        prompt: '___ kind speelt buiten. (The child plays outside.)',
        correctAnswer: 'het',
        hint: 'Is "kind" a de-word or a het-word?',
        explanation: '"Kind" is neuter, so it takes "het": het kind.',
      },
      {
        id: 'na-4',
        type: 'multiple_choice',
        prompt: 'What is the diminutive of "huis" (house)?',
        correctAnswer: 'huisje',
        options: ['huisen', 'huisje', 'huisken', 'huisie'],
        explanation: 'The diminutive adds -je: huis \u2192 huisje (little house). All diminutives use "het".',
      },
      {
        id: 'na-5',
        type: 'fill_blank',
        prompt: 'Ik heb twee ___. (I have two books.)',
        correctAnswer: 'boeken',
        hint: 'What is the plural of "boek"?',
        explanation: 'The plural of "boek" is "boeken" (add -en).',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 3. Pronouns
  // --------------------------------------------------------------------------
  {
    id: 'pronouns',
    title: 'Pronouns',
    level: 'basic',
    order: 3,
    icon: 'people-outline',
    description: 'Subject, object, and possessive pronouns.',
    explanation:
      'Dutch pronouns change form depending on whether they are the subject, object, or showing possession. Subject pronouns are used as the doer of an action. Object pronouns receive the action. Possessive pronouns show ownership. Dutch also distinguishes between formal "u" and informal "jij/je".',
    keyRules: [
      'Subject: ik, jij/je, hij, zij/ze, het, wij/we, jullie, zij/ze, u',
      'Object: mij/me, jou/je, hem, haar, het, ons, jullie, hen/hun, u',
      'Possessive: mijn, jouw/je, zijn, haar, ons/onze, jullie, hun, uw',
      '"jij/je" is informal, "u" is formal (both for "you")',
      '"zij/ze" means both "she" and "they" \u2014 context clarifies',
    ],
    examples: [
      { dutch: 'Ik zie hem. Hij ziet mij.', english: 'I see him. He sees me.' },
      { dutch: 'Zij geeft haar boek aan jou.', english: 'She gives her book to you.' },
      { dutch: 'Mijn huis is groot.', english: 'My house is big.' },
      { dutch: 'Wij kennen jullie ouders.', english: 'We know your parents.' },
      { dutch: 'U bent zeer vriendelijk.', english: 'You are very kind. (formal)' },
    ],
    quizQuestions: [
      {
        id: 'pr-1',
        type: 'multiple_choice',
        prompt: 'What is the object pronoun for "ik" (I)?',
        correctAnswer: 'mij',
        options: ['mijn', 'mij', 'me', 'mij/me'],
        explanation: 'The object form of "ik" is "mij" (or "me" in casual speech). Both "mij" and "me" are correct.',
      },
      {
        id: 'pr-2',
        type: 'fill_blank',
        prompt: '___ huis is klein. (My house is small.)',
        correctAnswer: 'mijn',
        hint: 'Which possessive pronoun for "I"?',
        explanation: '"Mijn" is the possessive pronoun for "ik": mijn huis = my house.',
      },
      {
        id: 'pr-3',
        type: 'multiple_choice',
        prompt: 'Which is the formal "you" in Dutch?',
        correctAnswer: 'u',
        options: ['jij', 'je', 'u', 'jullie'],
        explanation: '"U" is the formal form of "you" in Dutch, used for politeness.',
      },
      {
        id: 'pr-4',
        type: 'fill_blank',
        prompt: 'Ik geef het boek aan ___. (I give the book to him.)',
        correctAnswer: 'hem',
        hint: 'Object pronoun for "hij"',
        explanation: '"Hem" is the object pronoun for "hij" (he).',
      },
      {
        id: 'pr-5',
        type: 'translate',
        prompt: 'Translate: "She sees us."',
        correctAnswer: 'Zij ziet ons.',
        hint: '"She" = zij, "sees" = ziet, "us" = ons',
        explanation: '"Zij" is the subject, "ziet" is the verb, "ons" is the object pronoun for "wij".',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 4. Verbs (Present Tense)
  // --------------------------------------------------------------------------
  {
    id: 'present-tense',
    title: 'Verbs (Present Tense)',
    level: 'basic',
    order: 4,
    icon: 'flash-outline',
    description: 'Regular, irregular, and modal verbs in the present.',
    explanation:
      'In the present tense, Dutch regular verbs follow a pattern: take the stem (infinitive minus -en) and add endings. For "jij/je" and "hij/zij," add -t to the stem. For "wij/jullie/zij" (plural), use the full infinitive. Important irregular verbs include "zijn" (to be), "hebben" (to have), and "gaan" (to go). Modal verbs (kunnen, willen, moeten) send the main verb to the end of the sentence in infinitive form.',
    keyRules: [
      'Stem = infinitive minus -en (werken \u2192 werk)',
      'ik + stem: ik werk',
      'jij/hij/zij + stem + t: jij werkt, hij werkt',
      'wij/jullie/zij + infinitive: wij werken',
      'zijn: ik ben, jij bent, hij is, wij zijn',
      'hebben: ik heb, jij hebt, hij heeft, wij hebben',
      'Modal + infinitive at end: Ik kan zwemmen',
    ],
    examples: [
      { dutch: 'Ik werk, jij werkt, hij werkt, wij werken', english: 'I work, you work, he works, we work' },
      { dutch: 'Ik ben student. Jij bent groot.', english: 'I am a student. You are tall.' },
      { dutch: 'Hij heeft een hond.', english: 'He has a dog.' },
      { dutch: 'Wij gaan naar school.', english: 'We go to school.' },
      { dutch: 'Ik kan zwemmen. Zij wil leren.', english: 'I can swim. She wants to learn.' },
    ],
    quizQuestions: [
      {
        id: 'pt-1',
        type: 'fill_blank',
        prompt: 'Jij ___ elke dag. (You work every day.) [werken]',
        correctAnswer: 'werkt',
        hint: 'jij + stem + t',
        explanation: 'For "jij," add -t to the stem: werk + t = werkt.',
      },
      {
        id: 'pt-2',
        type: 'multiple_choice',
        prompt: 'Which is the correct form of "zijn" for "wij"?',
        correctAnswer: 'zijn',
        options: ['ben', 'bent', 'is', 'zijn'],
        explanation: 'Wij zijn (we are). "Zijn" is used for wij, jullie, and zij (plural).',
      },
      {
        id: 'pt-3',
        type: 'fill_blank',
        prompt: 'Hij ___ een kat. (He has a cat.) [hebben]',
        correctAnswer: 'heeft',
        hint: 'Irregular form of "hebben" for hij',
        explanation: '"Hebben" is irregular: hij heeft.',
      },
      {
        id: 'pt-4',
        type: 'fill_blank',
        prompt: 'Ik ___ Nederlands leren. (I want to learn Dutch.) [willen]',
        correctAnswer: 'wil',
        hint: 'Modal verb "willen" for ik',
        explanation: 'Modal verbs: ik wil. The main verb "leren" goes to the end as an infinitive.',
      },
      {
        id: 'pt-5',
        type: 'translate',
        prompt: 'Translate: "We go to the store."',
        correctAnswer: 'Wij gaan naar de winkel.',
        hint: '"go" = gaan, "store" = de winkel',
        explanation: '"Gaan" is irregular: wij gaan. "Naar" means "to."',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 5. Adjectives
  // --------------------------------------------------------------------------
  {
    id: 'adjectives',
    title: 'Adjectives',
    level: 'basic',
    order: 5,
    icon: 'color-palette-outline',
    description: 'Basic adjective use and when to add -e.',
    explanation:
      'Dutch adjectives usually add -e when they come before a noun. The exception: with "het" nouns preceded by "een" (or no article), the adjective does NOT get -e. This is the most important rule to memorize. After the noun (predicative position), adjectives never get -e.',
    keyRules: [
      'Before a de-word: always add -e (de grote man)',
      'Before a het-word with "de/het": add -e (het grote huis)',
      'Before a het-word with "een": NO -e (een groot huis)',
      'After the noun (predicative): NO -e (het huis is groot)',
      'Plural nouns always get -e (grote huizen)',
    ],
    examples: [
      { dutch: 'de grote man', english: 'the tall man' },
      { dutch: 'het grote huis', english: 'the big house' },
      { dutch: 'een groot huis', english: 'a big house' },
      { dutch: 'Het huis is groot.', english: 'The house is big.' },
      { dutch: 'een mooie vrouw, de mooie vrouw', english: 'a beautiful woman, the beautiful woman' },
    ],
    quizQuestions: [
      {
        id: 'adj-1',
        type: 'multiple_choice',
        prompt: 'Which is correct: "een ___ huis" (a small house)?',
        correctAnswer: 'klein',
        options: ['kleine', 'klein', 'kleiner', 'kleinste'],
        explanation: 'With "een" + het-word, the adjective does NOT get -e: een klein huis.',
      },
      {
        id: 'adj-2',
        type: 'multiple_choice',
        prompt: 'Which is correct: "de ___ auto" (the red car)?',
        correctAnswer: 'rode',
        options: ['rood', 'rode', 'roder', 'roodst'],
        explanation: 'With "de" + noun, always add -e: de rode auto.',
      },
      {
        id: 'adj-3',
        type: 'fill_blank',
        prompt: 'het ___ kind (the small child)',
        correctAnswer: 'kleine',
        hint: 'het + adjective + het-word = ?',
        explanation: 'With "het" + het-word, add -e: het kleine kind.',
      },
      {
        id: 'adj-4',
        type: 'fill_blank',
        prompt: 'een ___ boek (an interesting book)',
        correctAnswer: 'interessant',
        hint: 'een + adjective + het-word = no -e',
        explanation: 'With "een" + het-word, no -e: een interessant boek.',
      },
      {
        id: 'adj-5',
        type: 'multiple_choice',
        prompt: '"De kat is ___." (The cat is small.) Which form?',
        correctAnswer: 'klein',
        options: ['kleine', 'klein', 'kleintje', 'kleins'],
        explanation: 'After the noun (predicative), adjectives never get -e: De kat is klein.',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 6. Prepositions (Basic)
  // --------------------------------------------------------------------------
  {
    id: 'prepositions-basic',
    title: 'Prepositions (Basic)',
    level: 'basic',
    order: 6,
    icon: 'navigate-outline',
    description: 'Common prepositions and fixed expressions.',
    explanation:
      'Dutch prepositions are small words that show relationships between nouns and other words. The most common ones are: "in" (in), "op" (on/at), "met" (with), "naar" (to), "van" (of/from), "bij" (at/near), "voor" (for/before), and "aan" (on/to). Many prepositions form fixed expressions that you should memorize as chunks.',
    keyRules: [
      '"in" = in/inside (in de keuken = in the kitchen)',
      '"op" = on/at (op tafel = on the table, op vakantie = on vacation)',
      '"met" = with (met de bus = by bus)',
      '"naar" = to (naar school = to school, naar huis = home)',
      '"van" = of/from (van mij = mine, van Amsterdam = from Amsterdam)',
      '"bij" = at/near (bij de dokter = at the doctor)',
    ],
    examples: [
      { dutch: 'Ik ben in de keuken.', english: 'I am in the kitchen.' },
      { dutch: 'Het boek ligt op tafel.', english: 'The book is on the table.' },
      { dutch: 'Ik ga met de trein.', english: 'I go by train.' },
      { dutch: 'Wij gaan naar school.', english: 'We go to school.' },
      { dutch: 'Zij gaat op vakantie.', english: 'She goes on vacation.' },
    ],
    quizQuestions: [
      {
        id: 'pb-1',
        type: 'fill_blank',
        prompt: 'Ik ga ___ de winkel. (I go to the store.)',
        correctAnswer: 'naar',
        hint: 'Which preposition means "to"?',
        explanation: '"Naar" means "to" for direction: naar de winkel.',
      },
      {
        id: 'pb-2',
        type: 'fill_blank',
        prompt: 'Het boek ligt ___ tafel. (The book is on the table.)',
        correctAnswer: 'op',
        hint: 'Which preposition means "on"?',
        explanation: '"Op" means "on": op tafel (on the table).',
      },
      {
        id: 'pb-3',
        type: 'multiple_choice',
        prompt: 'Which preposition completes: "Ik ga ___ vakantie"?',
        correctAnswer: 'op',
        options: ['in', 'op', 'naar', 'met'],
        explanation: '"Op vakantie" is a fixed expression meaning "on vacation."',
      },
      {
        id: 'pb-4',
        type: 'fill_blank',
        prompt: 'Zij gaat ___ de bus. (She goes by bus.)',
        correctAnswer: 'met',
        hint: '"With" or "by" (transport)',
        explanation: '"Met" means "with" and is used for transportation: met de bus.',
      },
      {
        id: 'pb-5',
        type: 'translate',
        prompt: 'Translate: "I am at home."',
        correctAnswer: 'Ik ben thuis.',
        hint: '"at home" = thuis',
        explanation: '"Thuis" means "at home." It is an adverb, not a prepositional phrase.',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 7. Numbers, Time & Dates
  // --------------------------------------------------------------------------
  {
    id: 'numbers-time',
    title: 'Numbers, Time & Dates',
    level: 'basic',
    order: 7,
    icon: 'time-outline',
    description: 'Numbers, telling time, days, and months.',
    explanation:
      'Dutch numbers follow a pattern similar to German: for numbers 21\u201399, the ones digit comes before the tens (drieentwintig = three-and-twenty = 23). Telling time uses "uur" (o\'clock), "half" (half past, but referring to the NEXT hour), "kwart over" (quarter past), and "kwart voor" (quarter to). Days of the week are lowercase and months are also lowercase in Dutch.',
    keyRules: [
      '1-12: een, twee, drie, vier, vijf, zes, zeven, acht, negen, tien, elf, twaalf',
      '13-19: dertien, veertien, vijftien... (add -tien)',
      '20+: ones + en + tens (drieentwintig = 23)',
      'Time: "half drie" = 2:30 (half TOWARD three, not half past three!)',
      'Days: maandag, dinsdag, woensdag, donderdag, vrijdag, zaterdag, zondag',
      'Months: januari, februari, maart, april, mei, juni, juli, augustus, september, oktober, november, december',
    ],
    examples: [
      { dutch: 'Het is drie uur.', english: "It is three o'clock." },
      { dutch: 'Het is half drie.', english: 'It is half past two. (2:30)' },
      { dutch: 'Het is kwart over vier.', english: 'It is quarter past four. (4:15)' },
      { dutch: 'Vandaag is het maandag.', english: 'Today is Monday.' },
      { dutch: 'Ik heb vijfentwintig boeken.', english: 'I have twenty-five books.' },
    ],
    quizQuestions: [
      {
        id: 'nt-1',
        type: 'multiple_choice',
        prompt: '"Half drie" in Dutch means:',
        correctAnswer: '2:30',
        options: ['3:30', '2:30', '3:00', '2:00'],
        explanation: '"Half drie" means half toward three = 2:30. This is a common mistake for English speakers!',
      },
      {
        id: 'nt-2',
        type: 'fill_blank',
        prompt: 'Het is kwart ___ vijf. (It is 4:45.)',
        correctAnswer: 'voor',
        hint: '4:45 = quarter TO five',
        explanation: '"Kwart voor vijf" = quarter to five = 4:45.',
      },
      {
        id: 'nt-3',
        type: 'multiple_choice',
        prompt: 'How do you say 27 in Dutch?',
        correctAnswer: 'zevenentwintig',
        options: ['tweeenzestig', 'zevenentwintig', 'twintigzeven', 'zeventwintig'],
        explanation: 'Dutch puts the ones first: zeven-en-twintig (seven-and-twenty).',
      },
      {
        id: 'nt-4',
        type: 'fill_blank',
        prompt: 'Vandaag is het ___. (Today is Wednesday.)',
        correctAnswer: 'woensdag',
        hint: 'The third day of the week',
        explanation: 'Woensdag = Wednesday. Dutch days are not capitalized.',
      },
      {
        id: 'nt-5',
        type: 'multiple_choice',
        prompt: 'Which month is "maart"?',
        correctAnswer: 'March',
        options: ['May', 'March', 'Monday', 'April'],
        explanation: '"Maart" = March.',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 8. Separable Verbs (Intro)
  // --------------------------------------------------------------------------
  {
    id: 'separable-verbs-intro',
    title: 'Separable Verbs (Intro)',
    level: 'basic',
    order: 8,
    icon: 'git-branch-outline',
    description: 'Basic separable verbs in the present tense.',
    explanation:
      'Many Dutch verbs are "separable": they have a prefix that splits off and moves to the end of the sentence in main clauses. For example, "opstaan" (to get up) splits into "sta ... op": "Ik sta vroeg op" (I get up early). Common separable prefixes include: op-, aan-, af-, uit-, mee-, terug-, and door-. In the infinitive, the prefix and verb are written as one word.',
    keyRules: [
      'In main clauses, the prefix goes to the END of the sentence',
      'opstaan \u2192 Ik sta op (I get up)',
      'aankomen \u2192 De trein komt aan (The train arrives)',
      'meenemen \u2192 Ik neem een boek mee (I take a book along)',
      'Common prefixes: op, aan, af, uit, mee, terug, door',
    ],
    examples: [
      { dutch: 'Ik sta elke dag vroeg op.', english: 'I get up early every day.' },
      { dutch: 'De trein komt om drie uur aan.', english: "The train arrives at three o'clock." },
      { dutch: 'Zij ruimt haar kamer op.', english: 'She cleans up her room.' },
      { dutch: 'Wij bellen morgen terug.', english: 'We call back tomorrow.' },
      { dutch: 'Hij neemt zijn tas mee.', english: 'He takes his bag along.' },
    ],
    quizQuestions: [
      {
        id: 'sv-1',
        type: 'multiple_choice',
        prompt: 'Where does the prefix go in a main clause with a separable verb?',
        correctAnswer: 'At the end of the sentence',
        options: ['Before the subject', 'After the verb', 'At the end of the sentence', 'It stays attached'],
        explanation: 'In main clauses, the prefix separates and moves to the end.',
      },
      {
        id: 'sv-2',
        type: 'fill_blank',
        prompt: 'Ik sta elke dag vroeg ___. (I get up early every day.) [opstaan]',
        correctAnswer: 'op',
        hint: 'The prefix of "opstaan"',
        explanation: '"Opstaan" separates: ik sta ... op.',
      },
      {
        id: 'sv-3',
        type: 'translate',
        prompt: 'Translate: "She cleans up the house." (opruimen)',
        correctAnswer: 'Zij ruimt het huis op.',
        hint: 'opruimen splits: ruimt ... op',
        explanation: '"Opruimen" separates: zij ruimt ... op. "Het huis" = the house.',
      },
      {
        id: 'sv-4',
        type: 'fill_blank',
        prompt: 'De trein ___ om vijf uur aan. (The train arrives at five.) [aankomen]',
        correctAnswer: 'komt',
        hint: 'Conjugate "komen" for "de trein"',
        explanation: '"Aankomen" separates. The verb part conjugates normally: de trein komt ... aan.',
      },
      {
        id: 'sv-5',
        type: 'multiple_choice',
        prompt: 'Which of these is a separable verb?',
        correctAnswer: 'meenemen',
        options: ['beginnen', 'meenemen', 'studeren', 'begrijpen'],
        explanation: '"Meenemen" has the separable prefix "mee-": Ik neem het mee.',
      },
    ],
  },
];

// ============================================================================
// ADVANCED TOPICS (10)
// ============================================================================

const ADVANCED_TOPICS: GrammarTopic[] = [
  // --------------------------------------------------------------------------
  // 1. Word Order (Advanced)
  // --------------------------------------------------------------------------
  {
    id: 'word-order-advanced',
    title: 'Word Order (Advanced)',
    level: 'advanced',
    order: 1,
    icon: 'swap-horizontal-outline',
    description: 'Inversion, V2 rule, and sentence brackets.',
    explanation:
      'The V2 (verb-second) rule is the most important word order rule in Dutch. In main clauses, the conjugated verb ALWAYS occupies the second position. When something other than the subject starts the sentence (time, place, etc.), the subject and verb invert to keep the verb in second position. In compound tenses, the conjugated verb stays in position 2, while participles and infinitives go to the very end, creating a "sentence bracket."',
    keyRules: [
      'V2 Rule: the conjugated verb is ALWAYS in position 2 in main clauses',
      'Inversion: "Vandaag ga ik..." (Today go I...)',
      'Sentence bracket: Ik heb het boek gelezen (gelezen at the end)',
      'With modals: Ik wil een boek lezen (lezen at the end)',
      'Time-Manner-Place order for extra info after the verb',
    ],
    examples: [
      { dutch: 'Vandaag ga ik naar de winkel.', english: 'Today I go to the store.' },
      { dutch: 'Morgen komt hij niet.', english: 'Tomorrow he is not coming.' },
      { dutch: 'Ik heb het boek gelezen.', english: 'I have read the book.' },
      { dutch: 'Zij wil morgen een taart bakken.', english: 'She wants to bake a cake tomorrow.' },
      { dutch: 'In Amsterdam wonen veel mensen.', english: 'In Amsterdam live many people.' },
    ],
    quizQuestions: [
      {
        id: 'woa-1',
        type: 'multiple_choice',
        prompt: 'In a Dutch main clause, the conjugated verb is always in position:',
        correctAnswer: '2',
        options: ['1', '2', '3', 'Last'],
        explanation: 'The V2 rule: the conjugated verb is always in position 2.',
      },
      {
        id: 'woa-2',
        type: 'translate',
        prompt: 'Translate: "Tomorrow I work at home."',
        correctAnswer: 'Morgen werk ik thuis.',
        hint: 'Inversion: time first, then verb, then subject',
        explanation: 'When "morgen" starts the sentence, the verb "werk" must be in position 2, so the subject "ik" moves after it.',
      },
      {
        id: 'woa-3',
        type: 'fill_blank',
        prompt: 'Ik heb een brief ___. (I have written a letter.) [schrijven]',
        correctAnswer: 'geschreven',
        hint: 'Past participle of "schrijven"',
        explanation: 'In the sentence bracket, the participle goes to the end: heb ... geschreven.',
      },
      {
        id: 'woa-4',
        type: 'translate',
        prompt: 'Translate: "Yesterday she bought a book."',
        correctAnswer: 'Gisteren heeft zij een boek gekocht.',
        hint: 'Inversion + sentence bracket',
        explanation: '"Gisteren" in position 1, "heeft" in position 2, "gekocht" at the end.',
      },
      {
        id: 'woa-5',
        type: 'multiple_choice',
        prompt: 'What happens when a time expression starts a Dutch sentence?',
        correctAnswer: 'Subject and verb invert',
        options: ['Nothing changes', 'Subject and verb invert', 'Verb goes to the end', 'Subject is dropped'],
        explanation: 'Inversion occurs: the subject moves behind the verb to keep V2.',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 2. Past Tenses
  // --------------------------------------------------------------------------
  {
    id: 'past-tenses',
    title: 'Past Tenses',
    level: 'advanced',
    order: 2,
    icon: 'hourglass-outline',
    description: 'Perfect tense and simple past (imperfect).',
    explanation:
      'Dutch has two main past tenses. The PERFECT tense (most common in spoken Dutch) uses "hebben" or "zijn" + past participle: "Ik heb gegeten" (I have eaten). The past participle usually starts with ge- and ends in -t (regular/weak) or -en (irregular/strong). The SIMPLE PAST (imperfect) is used more in writing and storytelling. Use "zijn" instead of "hebben" for verbs of movement or change of state.',
    keyRules: [
      'Perfect: hebben/zijn + past participle',
      'Regular participle: ge- + stem + -t (werken \u2192 gewerkt)',
      'Irregular participle: ge- + stem change + -en (schrijven \u2192 geschreven)',
      'Use "zijn" for movement/change verbs: Ik ben gegaan, zij is gekomen',
      'Simple past regular: stem + -te(n) or -de(n)',
      'Simple past irregular: memorize forms (was, had, ging, kwam)',
    ],
    examples: [
      { dutch: 'Ik heb een boek gelezen.', english: 'I have read a book.' },
      { dutch: 'Zij is naar huis gegaan.', english: 'She has gone home.' },
      { dutch: 'Wij hebben hard gewerkt.', english: 'We have worked hard.' },
      { dutch: 'Hij was ziek. (simple past)', english: 'He was sick.' },
      { dutch: 'Zij ging naar school. (simple past)', english: 'She went to school.' },
    ],
    quizQuestions: [
      {
        id: 'pst-1',
        type: 'multiple_choice',
        prompt: 'Which auxiliary verb is used with "gaan" (to go) in the perfect tense?',
        correctAnswer: 'zijn',
        options: ['hebben', 'zijn', 'worden', 'zullen'],
        explanation: '"Gaan" is a verb of movement, so it uses "zijn": Ik ben gegaan.',
      },
      {
        id: 'pst-2',
        type: 'fill_blank',
        prompt: 'Ik heb hard ___. (I have worked hard.) [werken]',
        correctAnswer: 'gewerkt',
        hint: 'ge- + stem + -t for regular verbs',
        explanation: 'Regular past participle: ge- + werk + -t = gewerkt.',
      },
      {
        id: 'pst-3',
        type: 'fill_blank',
        prompt: 'Zij ___ gisteren naar Amsterdam gegaan. (She went to Amsterdam yesterday.)',
        correctAnswer: 'is',
        hint: 'Movement verb = zijn',
        explanation: '"Gaan" uses "zijn": zij is gegaan.',
      },
      {
        id: 'pst-4',
        type: 'multiple_choice',
        prompt: 'What is the past participle of "schrijven" (to write)?',
        correctAnswer: 'geschreven',
        options: ['geschrijft', 'geschreven', 'geschrijven', 'schreefde'],
        explanation: '"Schrijven" is irregular: geschreven.',
      },
      {
        id: 'pst-5',
        type: 'translate',
        prompt: 'Translate: "We have eaten pizza."',
        correctAnswer: 'Wij hebben pizza gegeten.',
        hint: '"eten" \u2192 "gegeten"',
        explanation: '"Eten" is irregular: gegeten. "Eten" uses "hebben."',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 3. Subordinate Clauses
  // --------------------------------------------------------------------------
  {
    id: 'subordinate-clauses',
    title: 'Subordinate Clauses',
    level: 'advanced',
    order: 3,
    icon: 'git-merge-outline',
    description: 'Conjunctions that send the verb to the end.',
    explanation:
      'Subordinating conjunctions introduce dependent clauses where the conjugated verb moves to the VERY END. Common subordinating conjunctions include: "dat" (that), "omdat" (because), "terwijl" (while), "als" (if/when), "wanneer" (when), "hoewel" (although), "voordat" (before), and "nadat" (after). The main clause keeps normal V2 order, but the subordinate clause has verb-final order.',
    keyRules: [
      'After subordinating conjunctions, the verb goes to the END',
      '"dat" = that: Ik weet dat hij komt',
      '"omdat" = because: ...omdat ik ziek ben',
      '"als" = if/when: Als het regent, blijf ik thuis',
      '"terwijl" = while: ...terwijl zij slaapt',
      'When the subordinate clause comes first, the main clause inverts',
    ],
    examples: [
      { dutch: 'Ik weet dat hij morgen komt.', english: 'I know that he is coming tomorrow.' },
      { dutch: 'Ik blijf thuis omdat ik ziek ben.', english: 'I stay home because I am sick.' },
      { dutch: 'Als het regent, neem ik een paraplu mee.', english: 'If it rains, I take an umbrella.' },
      { dutch: 'Zij leest terwijl hij kookt.', english: 'She reads while he cooks.' },
      { dutch: 'Voordat ik ga, drink ik koffie.', english: 'Before I go, I drink coffee.' },
    ],
    quizQuestions: [
      {
        id: 'sc-1',
        type: 'multiple_choice',
        prompt: 'In a subordinate clause, where does the verb go?',
        correctAnswer: 'At the end',
        options: ['Position 1', 'Position 2', 'Position 3', 'At the end'],
        explanation: 'After subordinating conjunctions, the verb moves to the end of the clause.',
      },
      {
        id: 'sc-2',
        type: 'fill_blank',
        prompt: 'Ik weet dat hij morgen ___. (I know that he comes tomorrow.) [komen]',
        correctAnswer: 'komt',
        hint: 'The verb goes to the end in a "dat" clause',
        explanation: 'In the subordinate clause "dat hij morgen komt," the verb "komt" is at the end.',
      },
      {
        id: 'sc-3',
        type: 'translate',
        prompt: 'Translate: "I stay home because I am tired."',
        correctAnswer: 'Ik blijf thuis omdat ik moe ben.',
        hint: '"omdat" sends the verb to the end',
        explanation: '"Omdat ik moe ben" \u2014 the verb "ben" goes to the end of the subordinate clause.',
      },
      {
        id: 'sc-4',
        type: 'multiple_choice',
        prompt: 'Which is a subordinating conjunction?',
        correctAnswer: 'omdat',
        options: ['en', 'maar', 'omdat', 'of'],
        explanation: '"Omdat" is subordinating (verb to end). "En," "maar," and "of" are coordinating (no word order change).',
      },
      {
        id: 'sc-5',
        type: 'fill_blank',
        prompt: '___ het regent, blijf ik thuis. (If it rains, I stay home.)',
        correctAnswer: 'als',
        hint: 'Which conjunction means "if/when"?',
        explanation: '"Als" means "if" or "when" for single/future events.',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 4. Reflexive Verbs
  // --------------------------------------------------------------------------
  {
    id: 'reflexive-verbs',
    title: 'Reflexive Verbs',
    level: 'advanced',
    order: 4,
    icon: 'refresh-outline',
    description: 'Verbs with "zich" (zich wassen, zich herinneren).',
    explanation:
      'Reflexive verbs are verbs where the subject performs the action on itself. They use reflexive pronouns: "me/mij" (myself), "je" (yourself), "zich" (himself/herself/itself/themselves), "ons" (ourselves). The infinitive uses "zich": "zich wassen" (to wash oneself). Common reflexive verbs include: zich herinneren (to remember), zich voelen (to feel), zich vergissen (to be mistaken), and zich amuseren (to enjoy oneself).',
    keyRules: [
      'Reflexive pronouns: me, je, zich, ons, je, zich',
      '"zich" is used for hij/zij/het/u and zij (plural)',
      'Ik was me, jij wast je, hij wast zich, wij wassen ons',
      'In subordinate clauses, the reflexive pronoun stays near the subject',
      'Some verbs are always reflexive in Dutch but not in English',
    ],
    examples: [
      { dutch: 'Ik was me elke ochtend.', english: 'I wash myself every morning.' },
      { dutch: 'Hij herinnert zich de vakantie.', english: 'He remembers the vacation.' },
      { dutch: 'Zij voelt zich goed.', english: 'She feels good.' },
      { dutch: 'Wij amuseren ons op het feest.', english: 'We enjoy ourselves at the party.' },
      { dutch: 'Je vergist je!', english: 'You are mistaken!' },
    ],
    quizQuestions: [
      {
        id: 'rv-1',
        type: 'fill_blank',
        prompt: 'Hij herinnert ___ de dag. (He remembers the day.)',
        correctAnswer: 'zich',
        hint: 'Reflexive pronoun for hij',
        explanation: '"Zich" is the reflexive pronoun for hij/zij/het.',
      },
      {
        id: 'rv-2',
        type: 'fill_blank',
        prompt: 'Ik voel ___ ziek. (I feel sick.)',
        correctAnswer: 'me',
        hint: 'Reflexive pronoun for ik',
        explanation: '"Me" (or "mij") is the reflexive pronoun for "ik."',
      },
      {
        id: 'rv-3',
        type: 'multiple_choice',
        prompt: 'Which reflexive pronoun goes with "wij"?',
        correctAnswer: 'ons',
        options: ['ons', 'zich', 'me', 'je'],
        explanation: '"Ons" is the reflexive pronoun for "wij": wij wassen ons.',
      },
      {
        id: 'rv-4',
        type: 'translate',
        prompt: 'Translate: "She washes herself."',
        correctAnswer: 'Zij wast zich.',
        hint: '"zich wassen" for zij',
        explanation: '"Zich" is used for zij: zij wast zich.',
      },
      {
        id: 'rv-5',
        type: 'multiple_choice',
        prompt: 'Which is a reflexive verb in Dutch?',
        correctAnswer: 'zich vergissen',
        options: ['lopen', 'eten', 'zich vergissen', 'schrijven'],
        explanation: '"Zich vergissen" (to be mistaken) is always reflexive in Dutch.',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 5. Separable Verbs (Advanced)
  // --------------------------------------------------------------------------
  {
    id: 'separable-verbs-advanced',
    title: 'Separable Verbs (Advanced)',
    level: 'advanced',
    order: 5,
    icon: 'git-branch-outline',
    description: 'Separable verbs in different tenses and with modals.',
    explanation:
      'Separable verbs behave differently in various contexts. In the perfect tense, "ge-" is inserted BETWEEN the prefix and the stem: "opgestaan" (got up), "aangebeld" (rang the bell). With modal verbs, the separable verb stays together as an infinitive at the end: "Ik wil opstaan" (I want to get up). In subordinate clauses, the verb reunites with its prefix at the end: "...dat ik opsta."',
    keyRules: [
      'Perfect tense: prefix + ge + stem + t/en (opgestaan, aangebeld)',
      'With modal verbs: infinitive stays whole at end (Ik moet opstaan)',
      'Subordinate clauses: verb reunites at end (...omdat ik opsta)',
      'te + infinitive: prefix + te + verb (op te staan)',
      'Main clause present: still separates (Ik sta op)',
    ],
    examples: [
      { dutch: 'Ik ben vroeg opgestaan.', english: 'I got up early. (perfect)' },
      { dutch: 'Ik wil morgen vroeg opstaan.', english: 'I want to get up early tomorrow.' },
      { dutch: '...omdat ik vroeg opsta.', english: '...because I get up early.' },
      { dutch: 'Het is moeilijk om vroeg op te staan.', english: 'It is difficult to get up early.' },
      { dutch: 'Zij heeft de deur opengemaakt.', english: 'She opened the door.' },
    ],
    quizQuestions: [
      {
        id: 'sva-1',
        type: 'fill_blank',
        prompt: 'Ik ben vroeg ___. (I got up early.) [opstaan, perfect tense]',
        correctAnswer: 'opgestaan',
        hint: 'prefix + ge + staan',
        explanation: 'In the perfect tense, "ge-" goes between prefix and stem: op-ge-staan.',
      },
      {
        id: 'sva-2',
        type: 'multiple_choice',
        prompt: 'With a modal verb, what happens to a separable verb?',
        correctAnswer: 'It stays together as infinitive at the end',
        options: ['It separates normally', 'It stays together as infinitive at the end', 'The prefix is dropped', 'The modal goes to the end'],
        explanation: 'Modal + separable verb infinitive at end: Ik wil opstaan.',
      },
      {
        id: 'sva-3',
        type: 'translate',
        prompt: 'Translate: "I want to call back tomorrow." (terugbellen)',
        correctAnswer: 'Ik wil morgen terugbellen.',
        hint: 'Modal + infinitive stays together at end',
        explanation: 'With modal "wil," the separable verb stays whole: terugbellen at the end.',
      },
      {
        id: 'sva-4',
        type: 'fill_blank',
        prompt: '...omdat hij vroeg ___. (because he gets up early) [opstaan]',
        correctAnswer: 'opstaat',
        hint: 'In subordinate clause, verb reunites with prefix',
        explanation: 'In subordinate clauses, the separable verb rejoins: ...omdat hij vroeg opstaat.',
      },
      {
        id: 'sva-5',
        type: 'fill_blank',
        prompt: 'Zij heeft de tafel ___. (She cleared the table.) [afruimen]',
        correctAnswer: 'afgeruimd',
        hint: 'prefix + ge + stem + d',
        explanation: 'Perfect participle: af-ge-ruimd.',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 6. Adjectives (Advanced)
  // --------------------------------------------------------------------------
  {
    id: 'adjectives-advanced',
    title: 'Adjectives (Advanced)',
    level: 'advanced',
    order: 6,
    icon: 'trending-up-outline',
    description: 'Comparative, superlative, and advanced endings.',
    explanation:
      'Dutch comparatives add "-er" to the adjective: groot \u2192 groter (bigger). Superlatives add "-st": groot \u2192 grootst (biggest). Before a noun, the superlative takes -e: "de grootste stad" (the biggest city). Some adjectives are irregular: goed \u2192 beter \u2192 best, veel \u2192 meer \u2192 meest. The comparative/superlative forms also follow the -e ending rules when placed before nouns.',
    keyRules: [
      'Comparative: adjective + -er (groot \u2192 groter)',
      'Superlative: adjective + -st (groot \u2192 grootst)',
      'Before a noun, superlative adds -e: de grootst-e stad',
      'Irregular: goed \u2192 beter \u2192 best',
      'Irregular: veel \u2192 meer \u2192 meest',
      'Irregular: weinig \u2192 minder \u2192 minst',
      'Comparison: groter dan... (bigger than...)',
    ],
    examples: [
      { dutch: 'Hij is groter dan ik.', english: 'He is taller than me.' },
      { dutch: 'Amsterdam is de grootste stad.', english: 'Amsterdam is the biggest city.' },
      { dutch: 'Dit boek is beter dan dat boek.', english: 'This book is better than that book.' },
      { dutch: 'Zij heeft meer geld dan hij.', english: 'She has more money than him.' },
      { dutch: 'Dit is het mooiste huis.', english: 'This is the most beautiful house.' },
    ],
    quizQuestions: [
      {
        id: 'adva-1',
        type: 'fill_blank',
        prompt: 'Hij is ___ dan ik. (He is taller than me.) [groot]',
        correctAnswer: 'groter',
        hint: 'Comparative: + er',
        explanation: 'Comparative: groot + er = groter.',
      },
      {
        id: 'adva-2',
        type: 'multiple_choice',
        prompt: 'What is the comparative of "goed" (good)?',
        correctAnswer: 'beter',
        options: ['goeder', 'beter', 'goedst', 'best'],
        explanation: '"Goed" is irregular: goed \u2192 beter \u2192 best.',
      },
      {
        id: 'adva-3',
        type: 'fill_blank',
        prompt: 'Amsterdam is de ___ stad. (Amsterdam is the biggest city.) [groot]',
        correctAnswer: 'grootste',
        hint: 'Superlative before a noun adds -e',
        explanation: 'Superlative + -e before a noun: de grootst-e stad.',
      },
      {
        id: 'adva-4',
        type: 'fill_blank',
        prompt: 'Zij heeft ___ geld dan hij. (She has more money than him.) [veel]',
        correctAnswer: 'meer',
        hint: 'Irregular comparative of "veel"',
        explanation: '"Veel" is irregular: veel \u2192 meer \u2192 meest.',
      },
      {
        id: 'adva-5',
        type: 'translate',
        prompt: 'Translate: "This house is the most beautiful."',
        correctAnswer: 'Dit huis is het mooiste.',
        hint: 'mooi \u2192 mooiste',
        explanation: 'Superlative of "mooi": het mooiste.',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 7. Passive Voice
  // --------------------------------------------------------------------------
  {
    id: 'passive-voice',
    title: 'Passive Voice',
    level: 'advanced',
    order: 7,
    icon: 'return-down-back-outline',
    description: '"worden" and "zijn" for passive constructions.',
    explanation:
      'The Dutch passive voice is formed with "worden" (present/imperfect passive) or "zijn" (perfect passive) + past participle. Present passive: "Het boek wordt gelezen" (The book is being read). Perfect passive: "Het huis is gebouwd" (The house has been built). The agent (doer) is introduced with "door" (by).',
    keyRules: [
      'Present passive: worden + past participle',
      'Perfect passive: zijn + past participle',
      'Het boek wordt gelezen (is being read)',
      'Het huis is gebouwd (has been built)',
      'Agent with "door": Het boek wordt door mij gelezen',
    ],
    examples: [
      { dutch: 'Het boek wordt gelezen.', english: 'The book is being read.' },
      { dutch: 'Het huis is gebouwd.', english: 'The house has been built.' },
      { dutch: 'De brief werd geschreven door hem.', english: 'The letter was written by him.' },
      { dutch: 'De taarten worden gebakken.', english: 'The cakes are being baked.' },
      { dutch: 'Het probleem is opgelost.', english: 'The problem has been solved.' },
    ],
    quizQuestions: [
      {
        id: 'pv-1',
        type: 'multiple_choice',
        prompt: 'Which verb is used for the present passive in Dutch?',
        correctAnswer: 'worden',
        options: ['zijn', 'worden', 'hebben', 'zullen'],
        explanation: 'Present passive uses "worden" + past participle.',
      },
      {
        id: 'pv-2',
        type: 'fill_blank',
        prompt: 'Het boek ___ gelezen. (The book is being read.)',
        correctAnswer: 'wordt',
        hint: 'Present passive of "worden"',
        explanation: '"Wordt" is the present tense passive auxiliary for het/singular.',
      },
      {
        id: 'pv-3',
        type: 'fill_blank',
        prompt: 'Het huis ___ gebouwd. (The house has been built.)',
        correctAnswer: 'is',
        hint: 'Perfect passive uses "zijn"',
        explanation: 'Perfect passive: "is" + past participle: Het huis is gebouwd.',
      },
      {
        id: 'pv-4',
        type: 'translate',
        prompt: 'Translate: "The letter is written by her."',
        correctAnswer: 'De brief wordt geschreven door haar.',
        hint: 'worden + past participle + door',
        explanation: 'Passive with agent: wordt geschreven door haar.',
      },
      {
        id: 'pv-5',
        type: 'multiple_choice',
        prompt: 'How do you introduce the agent (doer) in a Dutch passive sentence?',
        correctAnswer: 'door',
        options: ['bij', 'van', 'door', 'met'],
        explanation: '"Door" (by) introduces the agent: door hem, door haar.',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 8. Prepositions (Advanced)
  // --------------------------------------------------------------------------
  {
    id: 'prepositions-advanced',
    title: 'Prepositions (Advanced)',
    level: 'advanced',
    order: 8,
    icon: 'link-outline',
    description: 'Fixed verb-preposition combinations.',
    explanation:
      'Many Dutch verbs require a specific preposition, and these combinations must be memorized. For example: "wachten op" (to wait for), "denken aan" (to think of), "houden van" (to love/like), "luisteren naar" (to listen to). When referring to things (not people), the preposition combines with "er": "eraan" (about it), "erop" (on it), "ervan" (of it). These are called prepositional objects.',
    keyRules: [
      'wachten op = to wait for',
      'denken aan = to think of/about',
      'houden van = to love/like',
      'luisteren naar = to listen to',
      'beginnen met = to begin with',
      'For things: er + preposition (eraan, erop, ervan)',
      'For people: preposition + pronoun (aan hem, op haar)',
    ],
    examples: [
      { dutch: 'Ik wacht op de bus.', english: 'I wait for the bus.' },
      { dutch: 'Zij denkt aan haar vader.', english: 'She thinks about her father.' },
      { dutch: 'Ik houd van kaas.', english: 'I love cheese.' },
      { dutch: 'Ik denk eraan. (thinking about it)', english: "I'm thinking about it." },
      { dutch: 'Wij luisteren naar muziek.', english: 'We listen to music.' },
    ],
    quizQuestions: [
      {
        id: 'pa-1',
        type: 'fill_blank',
        prompt: 'Ik wacht ___ de trein. (I wait for the train.)',
        correctAnswer: 'op',
        hint: 'wachten + ?',
        explanation: '"Wachten op" = to wait for.',
      },
      {
        id: 'pa-2',
        type: 'fill_blank',
        prompt: 'Zij denkt ___ haar moeder. (She thinks about her mother.)',
        correctAnswer: 'aan',
        hint: 'denken + ?',
        explanation: '"Denken aan" = to think about.',
      },
      {
        id: 'pa-3',
        type: 'multiple_choice',
        prompt: '"Houden van" means:',
        correctAnswer: 'to love/like',
        options: ['to hold', 'to keep', 'to love/like', 'to stay'],
        explanation: '"Houden van" means to love or like something/someone.',
      },
      {
        id: 'pa-4',
        type: 'fill_blank',
        prompt: 'Ik denk ___. (I think about it.) [eraan/erop/ervan]',
        correctAnswer: 'eraan',
        hint: 'denken aan + it = er + aan',
        explanation: 'For things: er + preposition. Denken aan \u2192 eraan.',
      },
      {
        id: 'pa-5',
        type: 'translate',
        prompt: 'Translate: "We listen to music."',
        correctAnswer: 'Wij luisteren naar muziek.',
        hint: 'luisteren naar',
        explanation: '"Luisteren naar" = to listen to.',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 9. Relative Clauses
  // --------------------------------------------------------------------------
  {
    id: 'relative-clauses',
    title: 'Relative Clauses',
    level: 'advanced',
    order: 9,
    icon: 'chatbubbles-outline',
    description: 'die/dat for describing nouns with clauses.',
    explanation:
      'Relative clauses describe a noun and are introduced by "die" or "dat." Use "die" for de-words and all plurals. Use "dat" for het-words (singular). The verb in the relative clause goes to the END, just like in subordinate clauses. "Wat" is used when the antecedent is "alles," "iets," "niets," or a whole clause.',
    keyRules: [
      '"die" for de-words: de man die daar staat',
      '"dat" for het-words: het boek dat ik lees',
      '"die" for ALL plurals: de kinderen die spelen',
      'Verb goes to the end in the relative clause',
      '"wat" after alles, iets, niets: alles wat ik weet',
    ],
    examples: [
      { dutch: 'De man die daar staat, is mijn vader.', english: 'The man who stands there is my father.' },
      { dutch: 'Het boek dat ik lees, is interessant.', english: 'The book that I am reading is interesting.' },
      { dutch: 'De kinderen die buiten spelen, zijn blij.', english: 'The children who play outside are happy.' },
      { dutch: 'Alles wat hij zegt, is waar.', english: 'Everything that he says is true.' },
      { dutch: 'De vrouw die ik ken, woont in Amsterdam.', english: 'The woman whom I know lives in Amsterdam.' },
    ],
    quizQuestions: [
      {
        id: 'rc-1',
        type: 'multiple_choice',
        prompt: 'Which relative pronoun for: "het huis ___ ik koop"?',
        correctAnswer: 'dat',
        options: ['die', 'dat', 'wat', 'wie'],
        explanation: '"Huis" is a het-word, so use "dat."',
      },
      {
        id: 'rc-2',
        type: 'fill_blank',
        prompt: 'De man ___ daar staat, is mijn vader. (The man who stands there...)',
        correctAnswer: 'die',
        hint: '"man" is a de-word',
        explanation: '"Man" is a de-word, so use "die."',
      },
      {
        id: 'rc-3',
        type: 'multiple_choice',
        prompt: 'Which relative pronoun is used for ALL plurals?',
        correctAnswer: 'die',
        options: ['die', 'dat', 'wat', 'wie'],
        explanation: '"Die" is used for all plurals, regardless of gender.',
      },
      {
        id: 'rc-4',
        type: 'fill_blank',
        prompt: 'Alles ___ hij zegt, is waar. (Everything that he says is true.)',
        correctAnswer: 'wat',
        hint: 'After "alles," use...',
        explanation: '"Wat" is used after "alles," "iets," and "niets."',
      },
      {
        id: 'rc-5',
        type: 'translate',
        prompt: 'Translate: "The book that I read is interesting."',
        correctAnswer: 'Het boek dat ik lees is interessant.',
        hint: '"boek" = het-word \u2192 dat',
        explanation: '"Boek" is a het-word, so "dat." Verb "lees" goes to end of relative clause.',
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 10. Imperatives
  // --------------------------------------------------------------------------
  {
    id: 'imperatives',
    title: 'Imperatives',
    level: 'advanced',
    order: 10,
    icon: 'megaphone-outline',
    description: 'Giving commands and instructions.',
    explanation:
      'The imperative (command form) in Dutch is simply the verb stem. For regular verbs, drop the -en ending: "komen" \u2192 "Kom!" (Come!). For formal commands, add "u": "Komt u binnen" (Please come in). You can soften commands with "even," "maar," or "alsjeblieft/alstublieft." Negative imperatives use the stem + "niet": "Loop niet zo snel!" (Don\'t walk so fast!).',
    keyRules: [
      'Imperative = verb stem: Kom! (Come!), Loop! (Walk!)',
      'Formal: stem + u: Komt u hier (Come here, sir/madam)',
      'Soften with "even": Wacht even! (Wait a moment!)',
      'Soften with "maar": Ga maar zitten (Go ahead and sit)',
      'Negative: stem + niet: Doe dat niet! (Don\'t do that!)',
      '"alsjeblieft" (informal) / "alstublieft" (formal) = please',
    ],
    examples: [
      { dutch: 'Kom hier!', english: 'Come here!' },
      { dutch: 'Wacht even!', english: 'Wait a moment!' },
      { dutch: 'Ga zitten, alsjeblieft.', english: 'Please sit down.' },
      { dutch: 'Doe dat niet!', english: "Don't do that!" },
      { dutch: 'Komt u binnen.', english: 'Please come in. (formal)' },
    ],
    quizQuestions: [
      {
        id: 'imp-1',
        type: 'multiple_choice',
        prompt: 'How do you form the imperative in Dutch?',
        correctAnswer: 'Use the verb stem',
        options: ['Use the infinitive', 'Use the verb stem', 'Add -t to the stem', 'Use "doe" + infinitive'],
        explanation: 'The imperative is simply the verb stem: werken \u2192 Werk!',
      },
      {
        id: 'imp-2',
        type: 'fill_blank',
        prompt: '___ hier! (Come here!) [komen]',
        correctAnswer: 'Kom',
        hint: 'Verb stem of "komen"',
        explanation: 'Imperative of "komen" = Kom (the stem).',
      },
      {
        id: 'imp-3',
        type: 'translate',
        prompt: 'Translate: "Don\'t do that!"',
        correctAnswer: 'Doe dat niet!',
        hint: 'stem + object + niet',
        explanation: 'Negative imperative: Doe dat niet!',
      },
      {
        id: 'imp-4',
        type: 'fill_blank',
        prompt: 'Wacht ___! (Wait a moment!)',
        correctAnswer: 'even',
        hint: 'A word that softens the command',
        explanation: '"Even" softens a command: Wacht even! (Wait a moment).',
      },
      {
        id: 'imp-5',
        type: 'multiple_choice',
        prompt: 'How do you say "please" informally in Dutch?',
        correctAnswer: 'alsjeblieft',
        options: ['alstublieft', 'alsjeblieft', 'gelieve', 'bedankt'],
        explanation: '"Alsjeblieft" is informal, "alstublieft" is formal.',
      },
    ],
  },
];

// ============================================================================
// EXPORT
// ============================================================================

export const GRAMMAR_TOPICS: GrammarTopic[] = [...BASIC_TOPICS, ...ADVANCED_TOPICS];

export const BASIC_GRAMMAR_TOPICS = BASIC_TOPICS;
export const ADVANCED_GRAMMAR_TOPICS = ADVANCED_TOPICS;
