/**
 * Inburgering A2 — Spreken (speaking exam) practice material.
 *
 * Format mirrors DUO's official oefenexamen Spreken A2: 16 questions in 35 minutes,
 * four parts of four questions each.
 *
 *   1. vragen met een video   — someone asks you something; you answer
 *   2. vragen met 1 plaatje   — answer using the picture
 *   3. vragen met 2 plaatjes  — choose ONE of the two and answer
 *   4. vragen met 3 plaatjes  — use ALL three, say something about each
 *
 * The official exam items are copyrighted by the Ministerie van Sociale Zaken en
 * Werkgelegenheid, so every task below is written fresh in the same shape rather
 * than copied. The real exam shows photos and video; here a scene is carried by an
 * icon card and a Dutch caption, and part 1's question is spoken aloud with TTS.
 *
 * `icon` names come from lucide-react-native and are resolved by the screens.
 * Icons rather than emoji because some iOS simulator runtimes ship without the
 * colour emoji font, and the rest of the app is lucide throughout.
 */

export type SpeakingPartId = 'video' | 'plaatje1' | 'plaatje2' | 'plaatje3';

export interface SpeakingPart {
  id: SpeakingPartId;
  /** Part number as it appears in the real exam. */
  number: number;
  title: string;
  titleEnglish: string;
  /** The instruction DUO gives at the start of the part. */
  instruction: string;
  instructionEnglish: string;
  color: string;
}

/** One "plaatje" — a scene the learner has to talk about. */
export interface SpeakingScene {
  /** lucide-react-native icon name. */
  icon: string;
  caption: string;
  captionEnglish: string;
}

export interface SpeakingTask {
  id: string;
  part: SpeakingPartId;
  /** Short line that sets the situation, as the exam does above the picture. */
  context: string;
  contextEnglish: string;
  /** What the learner must actually say. Spoken aloud for part 1. */
  question: string;
  questionEnglish: string;
  /** Empty for part 1; 1, 2 or 3 entries for the picture parts. */
  scenes: SpeakingScene[];
  /** A good spoken answer, at A2 level. */
  sampleAnswer: string;
  sampleAnswerEnglish: string;
  /** What an examiner listens for. Drives the AI feedback. */
  checkpoints: string[];
}

export const SPEAKING_PARTS: SpeakingPart[] = [
  {
    id: 'video',
    number: 1,
    title: 'Vragen met een video',
    titleEnglish: 'Questions with a video',
    instruction: 'Een man of vrouw vraagt u iets. U moet antwoord geven.',
    instructionEnglish: 'A man or woman asks you something. You have to answer.',
    color: '#3b82f6',
  },
  {
    id: 'plaatje1',
    number: 2,
    title: 'Vragen met 1 plaatje',
    titleEnglish: 'Questions with 1 picture',
    instruction: 'Geef antwoord op de vragen. Gebruik steeds het plaatje.',
    instructionEnglish: 'Answer the questions. Always use the picture.',
    color: '#10b981',
  },
  {
    id: 'plaatje2',
    number: 3,
    title: 'Vragen met 2 plaatjes',
    titleEnglish: 'Questions with 2 pictures',
    instruction: 'Geef antwoord op de vragen. U kiest steeds één plaatje.',
    instructionEnglish: 'Answer the questions. You always choose one picture.',
    color: '#f59e0b',
  },
  {
    id: 'plaatje3',
    number: 4,
    title: 'Vragen met 3 plaatjes',
    titleEnglish: 'Questions with 3 pictures',
    instruction: 'Gebruik steeds alle plaatjes. Vertel iets bij elk plaatje.',
    instructionEnglish: 'Always use all the pictures. Say something about each one.',
    color: '#8b5cf6',
  },
];

export const SPEAKING_TASKS: SpeakingTask[] = [
  // ─── Onderdeel 1 — vragen met een video ───────────────────────────────────
  {
    id: 'sp-v1',
    part: 'video',
    context: 'Een collega spreekt u aan in de kantine.',
    contextEnglish: 'A colleague speaks to you in the canteen.',
    question: 'Ik ga vrijdag na het werk iets drinken met een paar collega\'s. Ga je mee?',
    questionEnglish: 'I am going for a drink with a few colleagues after work on Friday. Are you coming?',
    scenes: [],
    sampleAnswer:
      'Wat leuk, dank je wel! Ja, ik ga graag mee. Hoe laat spreken we af? Ik moet eerst mijn zoon naar huis brengen.',
    sampleAnswerEnglish:
      'How nice, thank you! Yes, I would like to come. What time shall we meet? I have to take my son home first.',
    checkpoints: [
      'De vraag wordt echt beantwoord (ja of nee)',
      'Er wordt gereageerd op de uitnodiging, niet alleen ja/nee',
      'Er wordt iets teruggevraagd of uitgelegd',
    ],
  },
  {
    id: 'sp-v2',
    part: 'video',
    context: 'De buurvrouw belt aan.',
    contextEnglish: 'Your neighbour rings the doorbell.',
    question: 'Sorry dat ik stoor. Ik ben mijn sleutel kwijt. Mag ik heel even bij u binnen wachten?',
    questionEnglish: 'Sorry to bother you. I have lost my key. May I wait inside at your place for a moment?',
    scenes: [],
    sampleAnswer:
      'Ja, natuurlijk, komt u binnen. Wilt u een kopje koffie? U kunt hier wachten tot uw man thuis is.',
    sampleAnswerEnglish:
      'Yes, of course, come in. Would you like a cup of coffee? You can wait here until your husband is home.',
    checkpoints: [
      'Er wordt duidelijk ja of nee gezegd',
      'De reactie is beleefd (u-vorm past hier)',
      'Er wordt iets aangeboden of voorgesteld',
    ],
  },
  {
    id: 'sp-v3',
    part: 'video',
    context: 'U bent bij de huisarts. De dokter vraagt iets.',
    contextEnglish: 'You are at the doctor. The doctor asks something.',
    question: 'Goedemiddag. Vertelt u eens, wat is er aan de hand?',
    questionEnglish: 'Good afternoon. Tell me, what is the matter?',
    scenes: [],
    sampleAnswer:
      'Ik heb al drie dagen keelpijn en ik ben erg moe. Ik kan bijna niet slapen. Ik heb ook een beetje koorts gehad.',
    sampleAnswerEnglish:
      'I have had a sore throat for three days and I am very tired. I can hardly sleep. I have also had a slight fever.',
    checkpoints: [
      'De klacht wordt genoemd',
      'Er wordt gezegd hoe lang de klacht al duurt',
      'Er worden minstens twee dingen verteld',
    ],
  },
  {
    id: 'sp-v4',
    part: 'video',
    context: 'Een medewerker van de bibliotheek spreekt u aan.',
    contextEnglish: 'A library employee speaks to you.',
    question: 'U bent hier voor het eerst, hè? Wilt u weten hoe u boeken kunt lenen?',
    questionEnglish: 'This is your first time here, right? Would you like to know how you can borrow books?',
    scenes: [],
    sampleAnswer:
      'Ja, graag. Ik weet nog niet hoe het werkt. Heb ik een pas nodig? En hoe lang mag ik een boek houden?',
    sampleAnswerEnglish:
      'Yes, please. I do not know yet how it works. Do I need a card? And how long may I keep a book?',
    checkpoints: [
      'Er wordt antwoord gegeven op de vraag',
      'Er wordt minstens één vraag gesteld',
      'De vragen passen bij de situatie',
    ],
  },

  // ─── Onderdeel 2 — vragen met 1 plaatje ───────────────────────────────────
  {
    id: 'sp-p1a',
    part: 'plaatje1',
    context: 'Fatima doet boodschappen op de markt.',
    contextEnglish: 'Fatima is doing her shopping at the market.',
    question: 'Vertel wat Fatima kan kopen. Vertel ook wat u zelf graag koopt op de markt.',
    questionEnglish: 'Say what Fatima can buy. Also say what you yourself like to buy at the market.',
    scenes: [
      {
        icon: 'ShoppingBasket',
        caption: 'Een marktkraam met groente en fruit: tomaten, appels, sla en aardappelen.',
        captionEnglish: 'A market stall with vegetables and fruit: tomatoes, apples, lettuce and potatoes.',
      },
    ],
    sampleAnswer:
      'Op het plaatje zie ik een marktkraam. Fatima kan tomaten, appels en sla kopen. Er zijn ook aardappelen. Ik koop zelf graag fruit op de markt, want het is daar goedkoop en heel vers.',
    sampleAnswerEnglish:
      'In the picture I see a market stall. Fatima can buy tomatoes, apples and lettuce. There are also potatoes. I myself like to buy fruit at the market, because it is cheap and very fresh there.',
    checkpoints: [
      'Er worden dingen uit het plaatje genoemd',
      'Er wordt ook iets over uzelf verteld',
      'Er wordt een reden gegeven (want/omdat)',
    ],
  },
  {
    id: 'sp-p1b',
    part: 'plaatje1',
    context: 'Youssef reist naar zijn werk.',
    contextEnglish: 'Youssef travels to his work.',
    question: 'Vertel hoe Youssef naar zijn werk gaat. Vertel ook hoe u zelf naar uw werk of school gaat.',
    questionEnglish: 'Say how Youssef goes to work. Also say how you yourself go to work or school.',
    scenes: [
      {
        icon: 'Bike',
        caption: 'Een man op een fiets bij een druk station. Het regent een beetje.',
        captionEnglish: 'A man on a bicycle at a busy station. It is raining a little.',
      },
    ],
    sampleAnswer:
      'Youssef gaat met de fiets naar het station. Het regent, dus hij draagt een jas. Daarna neemt hij waarschijnlijk de trein. Ik ga zelf met de bus naar mijn werk, omdat ik geen fiets heb.',
    sampleAnswerEnglish:
      'Youssef goes to the station by bike. It is raining, so he is wearing a coat. After that he probably takes the train. I myself go to work by bus, because I do not have a bicycle.',
    checkpoints: [
      'Het vervoermiddel op het plaatje wordt genoemd',
      'Er wordt iets over het weer of de situatie gezegd',
      'Er wordt over de eigen situatie verteld',
    ],
  },
  {
    id: 'sp-p1c',
    part: 'plaatje1',
    context: 'De familie De Vries eet samen.',
    contextEnglish: 'The De Vries family is eating together.',
    question: 'Vertel wat de familie doet. Vertel ook wat u van samen eten vindt.',
    questionEnglish: 'Say what the family is doing. Also say what you think of eating together.',
    scenes: [
      {
        icon: 'Utensils',
        caption: 'Een gezin aan tafel: vader, moeder en twee kinderen. Ze eten en praten.',
        captionEnglish: 'A family at the table: father, mother and two children. They are eating and talking.',
      },
    ],
    sampleAnswer:
      'Op het plaatje zie ik een gezin aan tafel. Ze eten samen en ze praten met elkaar. De kinderen lijken vrolijk. Ik vind samen eten heel gezellig, omdat je dan tijd hebt voor elkaar.',
    sampleAnswerEnglish:
      'In the picture I see a family at the table. They are eating together and talking to each other. The children look cheerful. I find eating together very pleasant, because then you have time for each other.',
    checkpoints: [
      'De mensen en de handeling worden beschreven',
      'Er wordt een mening gegeven',
      'De mening wordt uitgelegd',
    ],
  },
  {
    id: 'sp-p1d',
    part: 'plaatje1',
    context: 'Anna is op het gemeentehuis.',
    contextEnglish: 'Anna is at the town hall.',
    question: 'Vertel wat Anna daar doet. Vertel ook wanneer u zelf naar het gemeentehuis gaat.',
    questionEnglish: 'Say what Anna is doing there. Also say when you yourself go to the town hall.',
    scenes: [
      {
        icon: 'Landmark',
        caption: 'Een vrouw wacht bij een loket met een nummertje in haar hand.',
        captionEnglish: 'A woman waits at a counter with a numbered ticket in her hand.',
      },
    ],
    sampleAnswer:
      'Anna is bij het loket. Ze heeft een nummertje en ze wacht op haar beurt. Misschien komt ze haar paspoort halen. Ik ga zelf naar het gemeentehuis als ik me moet inschrijven of papieren nodig heb.',
    sampleAnswerEnglish:
      'Anna is at the counter. She has a ticket and she is waiting for her turn. Maybe she is collecting her passport. I myself go to the town hall when I have to register or need documents.',
    checkpoints: [
      'De situatie op het plaatje wordt beschreven',
      'Er wordt geraden of uitgelegd waarom zij daar is',
      'Er wordt iets over de eigen ervaring verteld',
    ],
  },

  // ─── Onderdeel 3 — vragen met 2 plaatjes (kies er één) ────────────────────
  {
    id: 'sp-p2a',
    part: 'plaatje2',
    context: 'U heeft zaterdag een vrije dag.',
    contextEnglish: 'You have a free day on Saturday.',
    question: 'Kies één plaatje. Vertel wat u gaat doen en waarom u dat kiest.',
    questionEnglish: 'Choose one picture. Say what you are going to do and why you choose that.',
    scenes: [
      {
        icon: 'Umbrella',
        caption: 'Een dag naar het strand met vrienden.',
        captionEnglish: 'A day at the beach with friends.',
      },
      {
        icon: 'BookOpen',
        caption: 'Een rustige dag thuis met een boek.',
        captionEnglish: 'A quiet day at home with a book.',
      },
    ],
    sampleAnswer:
      'Ik kies het tweede plaatje. Ik blijf liever thuis met een boek, omdat ik in de week heel hard werk. Op zaterdag wil ik rustig zijn. Naar het strand ga ik liever in de zomer.',
    sampleAnswerEnglish:
      'I choose the second picture. I would rather stay at home with a book, because I work very hard during the week. On Saturday I want to be calm. I prefer to go to the beach in summer.',
    checkpoints: [
      'Er wordt duidelijk één plaatje gekozen',
      'Er wordt verteld wat u gaat doen',
      'Er wordt een reden gegeven (want/omdat)',
    ],
  },
  {
    id: 'sp-p2b',
    part: 'plaatje2',
    context: 'U wilt een cursus volgen.',
    contextEnglish: 'You want to take a course.',
    question: 'Kies één plaatje. Vertel welke cursus u kiest en waarom.',
    questionEnglish: 'Choose one picture. Say which course you choose and why.',
    scenes: [
      {
        icon: 'Laptop',
        caption: 'Een computercursus in een klaslokaal.',
        captionEnglish: 'A computer course in a classroom.',
      },
      {
        icon: 'MessagesSquare',
        caption: 'Een cursus Nederlands spreken in een klein groepje.',
        captionEnglish: 'A Dutch speaking course in a small group.',
      },
    ],
    sampleAnswer:
      'Ik kies de cursus Nederlands spreken. Ik versta al veel, maar praten vind ik nog moeilijk. In een klein groepje durf ik meer te zeggen. Een computercursus heb ik nu niet nodig.',
    sampleAnswerEnglish:
      'I choose the Dutch speaking course. I already understand a lot, but I still find speaking difficult. In a small group I dare to say more. I do not need a computer course right now.',
    checkpoints: [
      'De keuze wordt duidelijk gemaakt',
      'De reden wordt uitgelegd',
      'Er wordt iets gezegd over het andere plaatje',
    ],
  },
  {
    id: 'sp-p2c',
    part: 'plaatje2',
    context: 'U zoekt een woning.',
    contextEnglish: 'You are looking for a place to live.',
    question: 'Kies één plaatje. Vertel welke woning u kiest en waarom.',
    questionEnglish: 'Choose one picture. Say which home you choose and why.',
    scenes: [
      {
        icon: 'Building2',
        caption: 'Een appartement in het centrum, dicht bij winkels.',
        captionEnglish: 'An apartment in the centre, close to shops.',
      },
      {
        icon: 'House',
        caption: 'Een huis met een tuin buiten de stad.',
        captionEnglish: 'A house with a garden outside the city.',
      },
    ],
    sampleAnswer:
      'Ik kies het huis met een tuin. Ik heb twee kinderen en ze kunnen daar buiten spelen. Het is ook rustiger dan in het centrum. Maar het is wel verder van mijn werk.',
    sampleAnswerEnglish:
      'I choose the house with a garden. I have two children and they can play outside there. It is also quieter than in the centre. But it is further from my work.',
    checkpoints: [
      'Eén woning wordt gekozen',
      'Er worden minstens twee redenen gegeven',
      'Er wordt een vergelijking gemaakt',
    ],
  },
  {
    id: 'sp-p2d',
    part: 'plaatje2',
    context: 'Uw vriend is jarig. U koopt een cadeau.',
    contextEnglish: 'It is your friend\'s birthday. You buy a present.',
    question: 'Kies één plaatje. Vertel welk cadeau u koopt en waarom.',
    questionEnglish: 'Choose one picture. Say which present you buy and why.',
    scenes: [
      {
        icon: 'BookOpen',
        caption: 'Een boek over koken.',
        captionEnglish: 'A book about cooking.',
      },
      {
        icon: 'Clapperboard',
        caption: 'Twee kaartjes voor de bioscoop.',
        captionEnglish: 'Two tickets for the cinema.',
      },
    ],
    sampleAnswer:
      'Ik koop de kaartjes voor de bioscoop. Mijn vriend houdt heel veel van films en we kunnen samen gaan. Dat vind ik leuker dan een boek, want dan doen we iets samen.',
    sampleAnswerEnglish:
      'I buy the cinema tickets. My friend loves films very much and we can go together. I find that nicer than a book, because then we do something together.',
    checkpoints: [
      'Het cadeau wordt gekozen',
      'Er wordt iets over de vriend verteld',
      'De keuze wordt uitgelegd',
    ],
  },

  // ─── Onderdeel 4 — vragen met 3 plaatjes (gebruik alle drie) ──────────────
  {
    id: 'sp-p3a',
    part: 'plaatje3',
    context: 'Vertel over de dag van meneer Bakker.',
    contextEnglish: 'Tell about Mr Bakker\'s day.',
    question: 'Vertel wat meneer Bakker doet. Gebruik alle drie de plaatjes.',
    questionEnglish: 'Say what Mr Bakker does. Use all three pictures.',
    scenes: [
      { icon: 'AlarmClock', caption: 'Hij staat om zes uur op.', captionEnglish: 'He gets up at six o\'clock.' },
      { icon: 'Bus', caption: 'Hij neemt de bus naar zijn werk.', captionEnglish: 'He takes the bus to work.' },
      { icon: 'ChefHat', caption: 'Hij kookt \'s avonds voor zijn gezin.', captionEnglish: 'In the evening he cooks for his family.' },
    ],
    sampleAnswer:
      'Op het eerste plaatje staat meneer Bakker om zes uur op. Dat is heel vroeg. Daarna neemt hij de bus naar zijn werk. Op het laatste plaatje kookt hij \'s avonds voor zijn gezin. Hij heeft dus een lange dag.',
    sampleAnswerEnglish:
      'In the first picture Mr Bakker gets up at six o\'clock. That is very early. After that he takes the bus to work. In the last picture he cooks for his family in the evening. So he has a long day.',
    checkpoints: [
      'Alle drie de plaatjes komen terug',
      'De volgorde is duidelijk (eerst, daarna, dan)',
      'Er wordt bij elk plaatje een hele zin gezegd',
    ],
  },
  {
    id: 'sp-p3b',
    part: 'plaatje3',
    context: 'Vertel over een verhuizing.',
    contextEnglish: 'Tell about a house move.',
    question: 'Vertel wat er gebeurt. Gebruik alle drie de plaatjes.',
    questionEnglish: 'Say what happens. Use all three pictures.',
    scenes: [
      { icon: 'Package', caption: 'Dozen inpakken in het oude huis.', captionEnglish: 'Packing boxes in the old house.' },
      { icon: 'Truck', caption: 'Alles gaat in een grote wagen.', captionEnglish: 'Everything goes into a big van.' },
      { icon: 'KeyRound', caption: 'De sleutel van het nieuwe huis.', captionEnglish: 'The key to the new house.' },
    ],
    sampleAnswer:
      'Eerst pakt de familie alle spullen in dozen. Daarna gaat alles in een grote wagen. Ten slotte krijgen ze de sleutel van hun nieuwe huis. Ik denk dat ze heel blij zijn.',
    sampleAnswerEnglish:
      'First the family packs all their things in boxes. Then everything goes into a big van. Finally they get the key to their new house. I think they are very happy.',
    checkpoints: [
      'Alle drie de plaatjes worden gebruikt',
      'Woorden als eerst, daarna en ten slotte worden gebruikt',
      'Er wordt een klein verhaal verteld',
    ],
  },
  {
    id: 'sp-p3c',
    part: 'plaatje3',
    context: 'Vertel over een bezoek aan de dokter.',
    contextEnglish: 'Tell about a visit to the doctor.',
    question: 'Vertel wat er gebeurt. Gebruik alle drie de plaatjes.',
    questionEnglish: 'Say what happens. Use all three pictures.',
    scenes: [
      { icon: 'Phone', caption: 'Bellen voor een afspraak.', captionEnglish: 'Calling for an appointment.' },
      { icon: 'Stethoscope', caption: 'De dokter onderzoekt de patiënt.', captionEnglish: 'The doctor examines the patient.' },
      { icon: 'Pill', caption: 'Medicijnen halen bij de apotheek.', captionEnglish: 'Getting medicine at the pharmacy.' },
    ],
    sampleAnswer:
      'Eerst belt de vrouw naar de huisarts voor een afspraak. Daarna onderzoekt de dokter haar. Hij geeft haar een recept. Ten slotte haalt ze de medicijnen bij de apotheek.',
    sampleAnswerEnglish:
      'First the woman calls the doctor for an appointment. Then the doctor examines her. He gives her a prescription. Finally she gets the medicine at the pharmacy.',
    checkpoints: [
      'De drie stappen worden in volgorde verteld',
      'Woorden uit de gezondheidszorg worden gebruikt',
      'Elke zin is compleet',
    ],
  },
  {
    id: 'sp-p3d',
    part: 'plaatje3',
    context: 'Vertel over een verjaardagsfeest.',
    contextEnglish: 'Tell about a birthday party.',
    question: 'Vertel wat er gebeurt. Gebruik alle drie de plaatjes.',
    questionEnglish: 'Say what happens. Use all three pictures.',
    scenes: [
      { icon: 'Mail', caption: 'De uitnodigingen gaan de deur uit.', captionEnglish: 'The invitations go out.' },
      { icon: 'Cake', caption: 'De taart staat klaar op tafel.', captionEnglish: 'The cake is ready on the table.' },
      { icon: 'Gift', caption: 'De gasten geven cadeaus.', captionEnglish: 'The guests give presents.' },
    ],
    sampleAnswer:
      'Eerst stuurt zij uitnodigingen naar haar vrienden en familie. Daarna maakt ze een taart klaar en zet die op tafel. Als de gasten komen, geven ze cadeaus. Iedereen zingt en het is heel gezellig.',
    sampleAnswerEnglish:
      'First she sends invitations to her friends and family. Then she prepares a cake and puts it on the table. When the guests come, they give presents. Everyone sings and it is very pleasant.',
    checkpoints: [
      'Alle drie de plaatjes komen aan bod',
      'De volgorde is logisch',
      'Er wordt meer verteld dan alleen losse woorden',
    ],
  },
];

// ─── Cheat sheet ────────────────────────────────────────────────────────────

export interface CheatPhrase {
  dutch: string;
  english: string;
  /** Optional usage hint shown under the phrase. */
  hint?: string;
}

export interface CheatSection {
  id: string;
  title: string;
  titleEnglish: string;
  /** Which part of the exam this section is most useful for. */
  usedIn: string;
  /** lucide-react-native icon name. */
  icon: string;
  phrases: CheatPhrase[];
}

/**
 * Organised by what the exam actually asks you to do, not by grammar topic —
 * each section maps onto one of the four parts.
 */
export const SPEAKING_CHEATSHEET: CheatSection[] = [
  {
    id: 'starten',
    title: 'Beginnen en tijd winnen',
    titleEnglish: 'Starting and buying time',
    usedIn: 'Elk onderdeel',
    icon: 'Hourglass',
    phrases: [
      { dutch: 'Even denken…', english: 'Let me think…', hint: 'Better than silence — the microphone is recording.' },
      { dutch: 'Dat is een goede vraag.', english: 'That is a good question.' },
      { dutch: 'Ik denk dat…', english: 'I think that…' },
      { dutch: 'Nou, ik zal het vertellen.', english: 'Well, I will tell you.' },
      { dutch: 'Wat ik wil zeggen is…', english: 'What I want to say is…' },
    ],
  },
  {
    id: 'antwoorden',
    title: 'Antwoord geven op een vraag',
    titleEnglish: 'Answering a question',
    usedIn: 'Onderdeel 1 — video',
    icon: 'MessageCircle',
    phrases: [
      { dutch: 'Ja, natuurlijk. Dat is goed.', english: 'Yes, of course. That is fine.' },
      { dutch: 'Ja, graag. Dank u wel.', english: 'Yes, please. Thank you.' },
      { dutch: 'Nee, sorry, dat kan helaas niet.', english: 'No, sorry, unfortunately that is not possible.' },
      { dutch: 'Dat is jammer, maar ik heb geen tijd.', english: 'That is a shame, but I do not have time.' },
      { dutch: 'Mag ik u iets vragen?', english: 'May I ask you something?', hint: 'Asking something back scores well.' },
      { dutch: 'Hoe laat spreken we af?', english: 'What time shall we meet?' },
    ],
  },
  {
    id: 'beschrijven',
    title: 'Een plaatje beschrijven',
    titleEnglish: 'Describing a picture',
    usedIn: 'Onderdeel 2, 3 en 4',
    icon: 'Image',
    phrases: [
      { dutch: 'Op het plaatje zie ik…', english: 'In the picture I see…', hint: 'The safest way to start every picture question.' },
      { dutch: 'Er is een… / Er zijn twee…', english: 'There is a… / There are two…' },
      { dutch: 'De man is aan het werken.', english: 'The man is working.', hint: '"aan het" + infinitive = happening right now.' },
      { dutch: 'Links zie ik… en rechts…', english: 'On the left I see… and on the right…' },
      { dutch: 'Op de achtergrond staat…', english: 'In the background there is…' },
      { dutch: 'Het lijkt erop dat…', english: 'It looks like…', hint: 'Use this when you are guessing.' },
      { dutch: 'Misschien is zij…', english: 'Maybe she is…' },
    ],
  },
  {
    id: 'mening',
    title: 'Je mening geven',
    titleEnglish: 'Giving your opinion',
    usedIn: 'Onderdeel 2 — bijna elke vraag',
    icon: 'ThumbsUp',
    phrases: [
      { dutch: 'Ik vind het heel leuk.', english: 'I find it very nice.' },
      { dutch: 'Ik vind dat lekker / mooi / gezellig.', english: 'I find that tasty / beautiful / pleasant.' },
      { dutch: 'Ik hou van…', english: 'I love…' },
      { dutch: 'Ik vind het niet zo leuk.', english: 'I do not find it that nice.' },
      { dutch: 'Zelf doe ik dat ook vaak.', english: 'I often do that myself too.', hint: 'Part 2 almost always asks about you as well.' },
      { dutch: '…, omdat het gezond is.', english: '…, because it is healthy.', hint: 'omdat sends the verb to the end.' },
      { dutch: '…, want het is goedkoop.', english: '…, because it is cheap.', hint: 'want keeps normal word order — easier under pressure.' },
    ],
  },
  {
    id: 'kiezen',
    title: 'Kiezen en uitleggen',
    titleEnglish: 'Choosing and explaining',
    usedIn: 'Onderdeel 3 — 2 plaatjes',
    icon: 'Scale',
    phrases: [
      { dutch: 'Ik kies het eerste plaatje.', english: 'I choose the first picture.', hint: 'Say your choice first — the examiner listens for it.' },
      { dutch: 'Ik kies voor… omdat…', english: 'I choose… because…' },
      { dutch: 'Ik ga liever naar het strand.', english: 'I would rather go to the beach.' },
      { dutch: 'Dat lijkt me leuker dan…', english: 'That seems nicer to me than…' },
      { dutch: 'Het andere plaatje vind ik minder leuk.', english: 'I find the other picture less nice.', hint: 'Mentioning the other option adds content.' },
      { dutch: 'Bovendien is het goedkoper.', english: 'Moreover, it is cheaper.' },
    ],
  },
  {
    id: 'verhaal',
    title: 'Een verhaal vertellen',
    titleEnglish: 'Telling a story',
    usedIn: 'Onderdeel 4 — 3 plaatjes',
    icon: 'BookMarked',
    phrases: [
      { dutch: 'Op het eerste plaatje…', english: 'In the first picture…' },
      { dutch: 'Eerst…', english: 'First…' },
      { dutch: 'Daarna…', english: 'After that…', hint: 'Careful: after daarna the verb comes straight away — "Daarna gaat hij…".' },
      { dutch: 'Dan…', english: 'Then…' },
      { dutch: 'Ten slotte…', english: 'Finally…' },
      { dutch: 'Op het laatste plaatje…', english: 'In the last picture…' },
      { dutch: 'Ik denk dat ze blij zijn.', english: 'I think that they are happy.', hint: 'A closing sentence rounds the story off.' },
    ],
  },
  {
    id: 'problemen',
    title: 'Als je iets niet weet',
    titleEnglish: 'When you are stuck',
    usedIn: 'Elk onderdeel',
    icon: 'LifeBuoy',
    phrases: [
      { dutch: 'Sorry, ik weet het woord niet.', english: 'Sorry, I do not know the word.', hint: 'Say it in Dutch and keep going — never stay silent.' },
      { dutch: 'Ik bedoel zoiets als…', english: 'I mean something like…' },
      { dutch: 'Hoe zeg je dat in het Nederlands?', english: 'How do you say that in Dutch?' },
      { dutch: 'Kunt u dat herhalen, alstublieft?', english: 'Could you repeat that, please?' },
      { dutch: 'Ik begrijp de vraag niet helemaal.', english: 'I do not completely understand the question.' },
    ],
  },
  {
    id: 'bouwstenen',
    title: 'Handige bouwstenen',
    titleEnglish: 'Useful building blocks',
    usedIn: 'Elk onderdeel',
    icon: 'Blocks',
    phrases: [
      { dutch: 'Ik wil graag…', english: 'I would like…' },
      { dutch: 'Ik moet nog…', english: 'I still have to…' },
      { dutch: 'Ik kan niet… want…', english: 'I cannot… because…' },
      { dutch: 'Ik ben al drie jaar in Nederland.', english: 'I have been in the Netherlands for three years.', hint: 'Dutch uses the present tense here, not the perfect.' },
      { dutch: 'Vroeger woonde ik in…', english: 'I used to live in…' },
      { dutch: 'Meestal / soms / altijd / nooit', english: 'Usually / sometimes / always / never' },
      { dutch: 'een beetje / heel / erg', english: 'a bit / very / very' },
    ],
  },
];

export const SPEAKING_EXAM_FACTS = {
  questions: 16,
  minutes: 35,
  parts: 4,
  perPart: 4,
};
