export type ExerciseType = 'email' | 'article' | 'form' | 'note';

export interface BulletPoint {
  dutch: string;
  english: string;
}

export interface EmailTemplate {
  to: string;
  subject: string;
  greeting: string;
  closing: string;
}

export interface FormField {
  id: string;
  label: string;
  labelEnglish: string;
  type: 'text' | 'multiline' | 'choice';
  choices?: string[];
  sampleValue: string;
}

export interface WritingExercise {
  id: string;
  examNumber: number;
  type: ExerciseType;
  title: string;
  titleEnglish: string;
  context: string;
  contextEnglish: string;
  bulletPoints: BulletPoint[];
  emailTemplate?: EmailTemplate;
  formFields?: FormField[];
  sampleAnswer: string;
  sampleAnswerEnglish: string;
  evaluationCriteria: string[];
}

export const writingExercises: WritingExercise[] = [
  // ─── EXAM 1 ───────────────────────────────────────────────────────────────
  {
    id: 'ex1-afspraak',
    examNumber: 1,
    type: 'email',
    title: 'Afspraak verzetten',
    titleEnglish: 'Rescheduling an appointment',
    context:
      'U volgt een opleiding. U hebt morgen een afspraak met Amber, een andere student. U kunt niet en wilt een andere afspraak maken. U schrijft daarom een e-mail aan Amber.',
    contextEnglish:
      'You are following a course. You have an appointment with Amber, another student, tomorrow. You cannot make it and want to reschedule. You therefore write an email to Amber.',
    bulletPoints: [
      { dutch: 'Schrijf dat u de afspraak wilt verzetten.', english: 'Write that you want to reschedule the appointment.' },
      { dutch: 'Schrijf waarom u dat wilt. Bedenk zelf waarom.', english: 'Write why you want to reschedule. Think of a reason yourself.' },
      { dutch: 'Stel een nieuwe datum voor.', english: 'Propose a new date.' },
    ],
    emailTemplate: {
      to: 'amberdegroot@mail.nl',
      subject: 'Afspraak',
      greeting: 'Beste Amber,',
      closing: 'Vriendelijke groet,',
    },
    sampleAnswer:
      'Beste Amber,\n\nIk schrijf je omdat ik onze afspraak van morgen moet verzetten. Helaas kan ik morgen niet komen, want mijn kind is ziek en ik moet thuis blijven.\n\nKan onze afspraak naar volgende week dinsdag, 22 april om 14:00 uur? Ik hoop dat dit voor jou ook goed uitkomt.\n\nVriendelijke groet,\n[Jouw naam]',
    sampleAnswerEnglish:
      "Dear Amber,\n\nI am writing because I need to reschedule our appointment for tomorrow. Unfortunately I cannot come tomorrow because my child is sick and I need to stay home.\n\nCan we move our appointment to next Tuesday, 22 April at 14:00? I hope this works for you too.\n\nKind regards,\n[Your name]",
    evaluationCriteria: [
      'States that the appointment needs to be rescheduled',
      'Provides a reason for the reschedule',
      'Proposes a new date',
      'Uses complete sentences',
      'Uses appropriate greeting and closing',
      'Grammar and spelling are correct',
    ],
  },
  {
    id: 'ex1-feest',
    examNumber: 1,
    type: 'article',
    title: 'Feest',
    titleEnglish: 'Party / Celebration',
    context:
      'U krijgt elke week een wijkkrant. Iedereen uit de buurt mag iets voor deze krant schrijven.\nU schrijft over een feest dat u elk jaar viert. Schrijf minimaal drie zinnen op.',
    contextEnglish:
      'You receive a weekly neighbourhood newspaper. Everyone in the neighbourhood may write something for this paper.\nWrite about a party/celebration you celebrate every year. Write at least three sentences.',
    bulletPoints: [
      { dutch: 'Waarom viert u het feest?', english: 'Why do you celebrate this?' },
      { dutch: 'Wie komen er op het feest?', english: 'Who comes to the celebration?' },
      { dutch: 'Wat doet u op het feest?', english: 'What do you do at the celebration?' },
    ],
    sampleAnswer:
      'Elk jaar vier ik Eid met mijn familie. Eid is een islamitisch feest dat het einde van de ramadan markeert. Mijn ouders, broers, zussen en vrienden komen altijd naar ons huis. We eten samen lekker eten, geven cadeaus aan de kinderen en bidden samen. Het is mijn favoriete dag van het jaar!',
    sampleAnswerEnglish:
      "Every year I celebrate Eid with my family. Eid is an Islamic festival that marks the end of Ramadan. My parents, brothers, sisters and friends always come to our house. We eat delicious food together, give gifts to the children and pray together. It is my favourite day of the year!",
    evaluationCriteria: [
      'Explains why the celebration takes place',
      'Mentions who attends the celebration',
      'Describes what happens at the celebration',
      'Contains at least three complete sentences',
      'Grammar and spelling are correct',
    ],
  },
  {
    id: 'ex1-sportschool',
    examNumber: 1,
    type: 'form',
    title: 'Inschrijven sportschool',
    titleEnglish: 'Registering at the gym',
    context:
      'U wilt graag sporten. U gaat naar een sportschool in uw buurt. U moet een formulier invullen. Sommige gegevens moet u zelf bedenken.',
    contextEnglish:
      'You want to do sport. You go to a gym in your neighbourhood. You need to fill in a form. You have to think of some of the details yourself.',
    bulletPoints: [
      { dutch: 'Vul het formulier in.', english: 'Fill in the form.' },
    ],
    formFields: [
      { id: 'naam', label: 'Voor- en achternaam', labelEnglish: 'First and last name', type: 'text', sampleValue: 'Ahmed El Fassi' },
      { id: 'adres', label: 'Adres', labelEnglish: 'Address', type: 'text', sampleValue: 'Tulpstraat 12' },
      { id: 'postcode', label: 'Postcode', labelEnglish: 'Postcode', type: 'text', sampleValue: '2512 AB' },
      { id: 'woonplaats', label: 'Woonplaats', labelEnglish: 'City', type: 'text', sampleValue: 'Den Haag' },
      { id: 'telefoon', label: 'Telefoonnummer', labelEnglish: 'Phone number', type: 'text', sampleValue: '06-12345678' },
      { id: 'geslacht', label: 'Geslacht', labelEnglish: 'Gender', type: 'choice', choices: ['Man', 'Vrouw'], sampleValue: 'Man' },
      { id: 'geboortedatum', label: 'Geboortedatum', labelEnglish: 'Date of birth', type: 'text', sampleValue: '15-03-1990' },
      { id: 'groepsles', label: 'Welke groepsles wilt u nu gaan doen?', labelEnglish: 'Which group class do you want to do?', type: 'choice', choices: ['Fitness', 'Yoga', 'Hardlopen'], sampleValue: 'Fitness' },
      { id: 'frequentie', label: 'Hoe vaak wilt u komen?', labelEnglish: 'How often do you want to come?', type: 'choice', choices: ['1x per week', '2x per week', 'meer dan 2x per week'], sampleValue: '2x per week' },
      { id: 'waarom', label: 'Waarom kiest u voor deze groepsles?', labelEnglish: 'Why do you choose this group class?', type: 'multiline', sampleValue: 'Ik kies voor fitness omdat ik sterker wil worden en ik graag in een groep sport. Fitness helpt mij ook om minder stress te hebben.' },
      { id: 'gezondheid', label: 'Hoe is uw gezondheid?', labelEnglish: 'How is your health?', type: 'multiline', sampleValue: 'Mijn gezondheid is goed. Ik heb geen ziektes en ik kan goed bewegen. Soms heb ik een beetje rugpijn, maar dat is niet erg.' },
    ],
    sampleAnswer:
      'Naam: Ahmed El Fassi\nAdres: Tulpstraat 12\nPostcode: 2512 AB\nWoonplaats: Den Haag\nTelefoonnummer: 06-12345678\nGeslacht: Man\nGeboortedatum: 15-03-1990\nGroepsles: Fitness\nFrequentie: 2x per week\nWaarom: Ik kies voor fitness omdat ik sterker wil worden en ik graag in een groep sport.\nGezondheid: Mijn gezondheid is goed. Ik heb geen ziektes en ik kan goed bewegen.',
    sampleAnswerEnglish:
      'Name: Ahmed El Fassi\nAddress: Tulpstraat 12\nPostcode: 2512 AB\nCity: The Hague\nPhone: 06-12345678\nGender: Male\nDate of birth: 15-03-1990\nGroup class: Fitness\nFrequency: 2x per week\nWhy: I choose fitness because I want to get stronger and I enjoy exercising in a group.\nHealth: My health is good. I have no illnesses and I can move well.',
    evaluationCriteria: [
      'Personal details are filled in completely',
      'A group class is selected',
      'A frequency is selected',
      'Provides a reason for the class choice in complete sentences',
      'Describes health in complete sentences',
      'Grammar and spelling are correct',
    ],
  },
  {
    id: 'ex1-dienst',
    examNumber: 1,
    type: 'email',
    title: 'Dienst ruilen',
    titleEnglish: 'Swapping a work shift',
    context:
      'U moet zondag werken maar u wilt graag vrij. U schrijft daarom een e-mail aan uw collega Farida. U vraagt of zij met u wil ruilen.',
    contextEnglish:
      'You have to work on Sunday but you would like to have the day off. You therefore write an email to your colleague Farida. You ask whether she wants to swap shifts with you.',
    bulletPoints: [
      { dutch: 'Schrijf op waarom u mailt.', english: 'Write why you are emailing.' },
      { dutch: 'Schrijf waarom u wilt ruilen. Bedenk het zelf.', english: 'Write why you want to swap. Think of a reason yourself.' },
      { dutch: 'Schrijf op welke dag u wel kunt werken.', english: 'Write which day you can work instead.' },
    ],
    emailTemplate: {
      to: 'farida@hmail.com',
      subject: 'Dienst ruilen',
      greeting: 'Hallo Farida,',
      closing: 'Groetjes,',
    },
    sampleAnswer:
      'Hallo Farida,\n\nIk mail je omdat ik zondag niet kan werken en wil vragen of jij met mij wil ruilen. Mijn ouders komen dit weekend op bezoek uit Marokko en ik wil graag bij hen zijn.\n\nKan jij zondag werken en kan ik maandag jouw dienst overnemen? Ik kan maandag de hele dag werken.\n\nGroetjes,\n[Jouw naam]',
    sampleAnswerEnglish:
      "Hi Farida,\n\nI'm emailing you because I cannot work on Sunday and want to ask if you'd like to swap shifts with me. My parents are visiting this weekend from Morocco and I would love to be with them.\n\nCan you work on Sunday and can I take over your Monday shift? I can work the whole day on Monday.\n\nGreetings,\n[Your name]",
    evaluationCriteria: [
      'States the reason for writing (wants to swap shift)',
      'Provides a personal reason for wanting Sunday off',
      'Mentions which day they can work instead',
      'Uses complete sentences',
      'Uses appropriate greeting and closing',
      'Grammar and spelling are correct',
    ],
  },

  // ─── EXAM 2 ───────────────────────────────────────────────────────────────
  {
    id: 'ex2-kleren',
    examNumber: 2,
    type: 'article',
    title: 'Mooiste kleren',
    titleEnglish: 'Favourite clothes',
    context:
      'U krijgt elke week een wijkkrant. Iedereen uit de buurt mag iets voor deze krant schrijven.\nU schrijft over de kleren die u het liefst draagt. Schrijf minimaal drie zinnen op.',
    contextEnglish:
      'You receive a weekly neighbourhood newspaper. Everyone in the neighbourhood may write something for this paper.\nWrite about the clothes you like to wear most. Write at least three sentences.',
    bulletPoints: [
      { dutch: 'Wat draagt u het liefst?', english: 'What do you like to wear most?' },
      { dutch: 'Hoe zien de kleren eruit?', english: 'What do the clothes look like?' },
      { dutch: 'Wanneer draagt u deze kleren?', english: 'When do you wear these clothes?' },
    ],
    sampleAnswer:
      'Ik draag het liefst een spijkerbroek met een trui. Mijn favoriete spijkerbroek is blauw en mijn trui is grijs en zacht. Ik draag deze kleren bijna elke dag, want ze zijn heel comfortabel. Op speciale gelegenheden, zoals een verjaardag, draag ik liever een mooie jurk of een nette broek met een blouse.',
    sampleAnswerEnglish:
      "I like to wear jeans with a sweater most. My favourite jeans are blue and my sweater is grey and soft. I wear these clothes almost every day because they are very comfortable. On special occasions, such as a birthday, I prefer to wear a nice dress or smart trousers with a blouse.",
    evaluationCriteria: [
      'Describes what they like to wear most',
      'Describes what the clothes look like',
      'Explains when they wear these clothes',
      'Contains at least three complete sentences',
      'Grammar and spelling are correct',
    ],
  },
  {
    id: 'ex2-boek',
    examNumber: 2,
    type: 'email',
    title: 'Boek lenen',
    titleEnglish: 'Borrowing a book',
    context:
      "Voor uw opleiding Techniek heeft u snel het boek 'Natuurkunde 1' nodig. In de bibliotheek is het boek niet. Een medestudente heeft het boek. U wilt het boek van haar lenen. U schrijft haar een e-mail.",
    contextEnglish:
      "For your Technology course you urgently need the book 'Natuurkunde 1' (Physics 1). The book is not in the library. A fellow student has the book. You want to borrow it from her. You write her an email.",
    bulletPoints: [
      { dutch: 'U schrijft welk boek u wilt lenen.', english: 'Write which book you want to borrow.' },
      { dutch: 'U schrijft waarom u het boek van haar wilt lenen.', english: 'Write why you want to borrow the book from her.' },
      { dutch: 'U schrijft wanneer ze het boek terugkrijgt. Bedenk zelf wanneer.', english: 'Write when she will get the book back. Decide yourself when.' },
    ],
    emailTemplate: {
      to: 'wilma@email.nl',
      subject: 'boek',
      greeting: 'Beste Wilma,',
      closing: 'Groetjes,',
    },
    sampleAnswer:
      "Beste Wilma,\n\nIk schrijf je omdat ik het boek 'Natuurkunde 1' heel graag wil lenen. Ik heb dit boek nodig voor mijn opleiding Techniek. De bibliotheek heeft het boek niet meer, maar jij hebt het wel.\n\nKun jij het boek aan mij uitlenen? Ik beloof dat je het boek uiterlijk vrijdag 25 april terugkrijgt.\n\nGroetjes,\n[Jouw naam]",
    sampleAnswerEnglish:
      "Dear Wilma,\n\nI am writing because I would very much like to borrow the book 'Natuurkunde 1'. I need this book for my Technology course. The library no longer has the book, but you do.\n\nCould you lend me the book? I promise you will get the book back by Friday 25 April at the latest.\n\nGreetings,\n[Your name]",
    evaluationCriteria: [
      'Names the specific book they want to borrow',
      'Explains why they need to borrow it from her (library does not have it)',
      'States a clear date or time for returning the book',
      'Uses complete sentences',
      'Uses appropriate greeting and closing',
      'Grammar and spelling are correct',
    ],
  },
  {
    id: 'ex2-ingebroken',
    examNumber: 2,
    type: 'form',
    title: 'Ingebroken',
    titleEnglish: 'Burglary insurance claim',
    context:
      'Er is ingebroken in uw huis. Dieven hebben spullen meegenomen en er is schade. U vult een schadeformulier in van uw verzekering.\n\nGestolen: laptop, horloge. Kapot: raam.',
    contextEnglish:
      'Your house has been broken into. Thieves have taken things and there is damage. You fill in a damage claim form for your insurance.\n\nStolen: laptop, watch. Broken: window.',
    bulletPoints: [
      { dutch: 'Vul het formulier in. Bedenk zelf de gegevens.', english: 'Fill in the form. Think of the details yourself.' },
      { dutch: 'Schrijf op wanneer er is ingebroken.', english: 'Write when the break-in took place.' },
      { dutch: 'Schrijf drie dingen op die zijn gebeurd (laptop gestolen, horloge gestolen, raam kapot).', english: 'Write three things that happened (laptop stolen, watch stolen, window broken).' },
    ],
    formFields: [
      { id: 'achternaam', label: 'Achternaam', labelEnglish: 'Last name', type: 'text', sampleValue: 'Yilmaz' },
      { id: 'voorletters', label: 'Voorletters', labelEnglish: 'Initials', type: 'text', sampleValue: 'M.' },
      { id: 'adres', label: 'Adres', labelEnglish: 'Address', type: 'text', sampleValue: 'Rozenlaan 5' },
      { id: 'telefoon', label: 'Telefoonnummer', labelEnglish: 'Phone number', type: 'text', sampleValue: '06-98765432' },
      { id: 'email', label: 'E-mail', labelEnglish: 'Email', type: 'text', sampleValue: 'myilmaz@mail.nl' },
      { id: 'datum', label: 'Datum van de schade', labelEnglish: 'Date of damage', type: 'text', sampleValue: '10 april 2026' },
      { id: 'schade1', label: 'Omschrijving schade 1', labelEnglish: 'Damage description 1', type: 'multiline', sampleValue: 'Mijn laptop is gestolen. Het is een Dell laptop, gekocht in 2023.' },
      { id: 'schade2', label: 'Omschrijving schade 2', labelEnglish: 'Damage description 2', type: 'multiline', sampleValue: 'Mijn horloge is ook gestolen. Het is een zilverkleurig horloge.' },
      { id: 'schade3', label: 'Omschrijving schade 3', labelEnglish: 'Damage description 3', type: 'multiline', sampleValue: 'Het raam in de keuken is kapot. De dief heeft het raam ingegooid om het huis binnen te komen.' },
    ],
    sampleAnswer:
      'Achternaam: Yilmaz\nVoorletters: M.\nAdres: Rozenlaan 5\nTelefoonnummer: 06-98765432\nE-mail: myilmaz@mail.nl\nDatum schade: 10 april 2026\n\nSchade 1: Mijn laptop is gestolen. Het is een Dell laptop, gekocht in 2023.\nSchade 2: Mijn horloge is ook gestolen. Het is een zilverkleurig horloge.\nSchade 3: Het raam in de keuken is kapot. De dief heeft het raam ingegooid.',
    sampleAnswerEnglish:
      'Last name: Yilmaz\nInitials: M.\nAddress: Rozenlaan 5\nPhone: 06-98765432\nEmail: myilmaz@mail.nl\nDate of damage: 10 April 2026\n\nDamage 1: My laptop has been stolen. It is a Dell laptop, bought in 2023.\nDamage 2: My watch has also been stolen. It is a silver-coloured watch.\nDamage 3: The window in the kitchen is broken. The thief smashed the window to get inside.',
    evaluationCriteria: [
      'Personal details are filled in completely',
      'Date of the break-in is stated',
      'Describes the stolen laptop',
      'Describes the stolen watch',
      'Describes the broken window',
      'Uses complete sentences for descriptions',
      'Grammar and spelling are correct',
    ],
  },
  {
    id: 'ex2-vrije-dag',
    examNumber: 2,
    type: 'email',
    title: 'Vrije dag aanvragen',
    titleEnglish: 'Requesting a day off',
    context:
      'U wilt volgende week een dag vrij vragen. U schrijft een e-mail aan uw chef, meneer Jansen.',
    contextEnglish:
      'You want to request a day off next week. You write an email to your manager, Mr Jansen.',
    bulletPoints: [
      { dutch: 'U schrijft wanneer u vrij wilt hebben. Bedenk zelf een dag en datum.', english: 'Write when you want to have a day off. Choose a day and date yourself.' },
      { dutch: 'U schrijft waarom u vrij wilt hebben. Bedenk zelf waarom.', english: 'Write why you want the day off. Think of a reason yourself.' },
    ],
    emailTemplate: {
      to: 'jjansen@werk.nl',
      subject: 'vrij',
      greeting: 'Beste meneer Jansen,',
      closing: 'Vriendelijke groet,',
    },
    sampleAnswer:
      'Beste meneer Jansen,\n\nIk schrijf u om te vragen of ik volgende week woensdag 23 april vrij kan nemen. Ik moet die dag naar de dokter voor een medisch onderzoek. Het is een belangrijke afspraak die ik al lang geleden heb gemaakt.\n\nIk hoop dat dit geen problemen geeft. Als het niet lukt, laat ik het u weten.\n\nVriendelijke groet,\n[Uw naam]',
    sampleAnswerEnglish:
      "Dear Mr Jansen,\n\nI am writing to ask whether I may take next Wednesday 23 April off. I have to go to the doctor that day for a medical check-up. It is an important appointment that I made a long time ago.\n\nI hope this does not cause any problems. If it is not possible, I will let you know.\n\nKind regards,\n[Your name]",
    evaluationCriteria: [
      'States the specific day and date they want off',
      'Provides a clear reason for the day off',
      'Uses formal language appropriate for a manager',
      'Uses complete sentences',
      'Uses appropriate greeting (Beste meneer Jansen) and formal closing (Vriendelijke groet)',
      'Grammar and spelling are correct',
    ],
  },

  // ─── EXAM 3 ───────────────────────────────────────────────────────────────
  {
    id: 'ex3-docent',
    examNumber: 3,
    type: 'email',
    title: 'E-mail aan docent',
    titleEnglish: 'Email to teacher',
    context:
      'U doet een computercursus. Morgen moet u een toets maken, maar u kunt niet naar school komen. U schrijft een e-mail aan uw docent.',
    contextEnglish:
      'You are doing a computer course. Tomorrow you have to take a test, but you cannot come to school. You write an email to your teacher.',
    bulletPoints: [
      { dutch: 'Schrijf waarom u de e-mail stuurt.', english: 'Write why you are sending the email.' },
      { dutch: 'Schrijf waarom u niet kunt komen. Bedenk het zelf.', english: 'Write why you cannot come. Think of a reason yourself.' },
      { dutch: 'Bied uw excuses aan.', english: 'Apologise.' },
      { dutch: 'Vraag wanneer u de toets kunt maken.', english: 'Ask when you can take the test.' },
    ],
    emailTemplate: {
      to: 'mijndocent@mail.nl',
      subject: 'De toets morgen',
      greeting: 'Beste meneer Bakker,',
      closing: 'Groeten,',
    },
    sampleAnswer:
      'Beste meneer Bakker,\n\nIk schrijf u omdat ik morgen helaas niet naar school kan komen voor de toets. Ik ben vandaag ziek geworden en ik heb koorts. Ik moet thuisblijven van de dokter.\n\nHet spijt me zeer dat ik morgen niet aanwezig kan zijn. Kunt u mij laten weten wanneer ik de toets kan inhalen? Ik ben graag zo snel mogelijk klaar met de toets.\n\nGroeten,\n[Uw naam]',
    sampleAnswerEnglish:
      "Dear Mr Bakker,\n\nI am writing because unfortunately I cannot come to school tomorrow for the test. I became ill today and I have a fever. The doctor told me to stay home.\n\nI am very sorry that I cannot be present tomorrow. Could you please let me know when I can take the make-up test? I would like to complete the test as soon as possible.\n\nGreetings,\n[Your name]",
    evaluationCriteria: [
      'States the reason for writing (cannot come to test)',
      'Explains why they cannot come',
      'Includes an apology',
      'Asks when the test can be taken at a later time',
      'Uses complete sentences',
      'Uses appropriate greeting and closing',
      'Grammar and spelling are correct',
    ],
  },
  {
    id: 'ex3-problemen',
    examNumber: 3,
    type: 'form',
    title: 'Problemen in de straat',
    titleEnglish: 'Problems in the street',
    context:
      'In de straat waar u woont zijn twee problemen. U meldt de problemen bij de gemeente. Sommige gegevens moet u zelf bedenken.\n\nProbleem 1: Er ligt veel afval op straat.\nProbleem 2: Er zijn losse stoeptegels.',
    contextEnglish:
      'There are two problems in the street where you live. You report the problems to the municipality. You have to think of some details yourself.\n\nProblem 1: There is a lot of rubbish in the street.\nProblem 2: There are loose paving stones.',
    bulletPoints: [
      { dutch: 'Vul het formulier in. Sommige gegevens moet u zelf bedenken.', english: 'Fill in the form. Think of some details yourself.' },
    ],
    formFields: [
      { id: 'naam', label: 'Voor- en achternaam', labelEnglish: 'First and last name', type: 'text', sampleValue: 'Fatima Oubali' },
      { id: 'adres', label: 'Adres', labelEnglish: 'Address', type: 'text', sampleValue: 'Kerkstraat 8' },
      { id: 'postcode', label: 'Postcode', labelEnglish: 'Postcode', type: 'text', sampleValue: '3511 BD' },
      { id: 'woonplaats', label: 'Woonplaats', labelEnglish: 'City', type: 'text', sampleValue: 'Utrecht' },
      { id: 'telefoon', label: 'Telefoonnummer', labelEnglish: 'Phone number', type: 'text', sampleValue: '06-55556666' },
      { id: 'email', label: 'E-mail', labelEnglish: 'Email', type: 'text', sampleValue: 'f.oubali@mail.com' },
      { id: 'straat', label: 'In welke straat zijn er problemen?', labelEnglish: 'In which street are there problems?', type: 'text', sampleValue: 'Kerkstraat, Utrecht' },
      { id: 'problemen', label: 'Wat zijn de problemen?', labelEnglish: 'What are the problems?', type: 'multiline', sampleValue: 'Er zijn twee problemen in onze straat. Ten eerste ligt er veel afval op straat, naast de vuilnisbakken. Dit ziet er niet mooi uit en het ruikt slecht. Ten tweede zijn er losse stoeptegels op de stoep voor nummer 6 en 8. Dit is gevaarlijk voor voetgangers, vooral voor oudere mensen.' },
    ],
    sampleAnswer:
      'Naam: Fatima Oubali\nAdres: Kerkstraat 8\nPostcode: 3511 BD\nWoonplaats: Utrecht\nTelefoon: 06-55556666\nE-mail: f.oubali@mail.com\nStraat: Kerkstraat, Utrecht\nProblemen: Er zijn twee problemen in onze straat. Er ligt veel afval op straat naast de vuilnisbakken. Bovendien zijn er losse stoeptegels voor nummer 6 en 8, wat gevaarlijk is.',
    sampleAnswerEnglish:
      'Name: Fatima Oubali\nAddress: Kerkstraat 8\nPostcode: 3511 BD\nCity: Utrecht\nPhone: 06-55556666\nEmail: f.oubali@mail.com\nStreet: Kerkstraat, Utrecht\nProblems: There are two problems in our street. There is a lot of rubbish in the street next to the bins. Furthermore, there are loose paving stones in front of numbers 6 and 8, which is dangerous.',
    evaluationCriteria: [
      'Personal details are filled in completely',
      'States which street has the problems',
      'Describes the rubbish problem',
      'Describes the loose paving stones problem',
      'Uses complete sentences for the problems description',
      'Grammar and spelling are correct',
    ],
  },
  {
    id: 'ex3-weekend',
    examNumber: 3,
    type: 'article',
    title: 'Weekend',
    titleEnglish: 'Weekend',
    context:
      'U krijgt elke week een wijkkrant. Iedereen uit de buurt mag iets voor deze krant schrijven.\nU schrijft over uw weekend. Schrijf minimaal drie zinnen op.',
    contextEnglish:
      'You receive a weekly neighbourhood newspaper. Everyone in the neighbourhood may write something for this paper.\nWrite about your weekend. Write at least three sentences.',
    bulletPoints: [
      { dutch: 'Wat doet u graag in het weekend?', english: 'What do you like to do at the weekend?' },
      { dutch: 'Met wie doet u dat?', english: 'With whom do you do that?' },
      { dutch: 'Waar doet u dat?', english: 'Where do you do that?' },
    ],
    sampleAnswer:
      'In het weekend ga ik graag naar het park om te wandelen. Ik doe dit elke zaterdag met mijn man en onze twee kinderen. We wandelen altijd in het Vondelpark in Amsterdam, want dat park is groot en mooi. Daarna eten we samen ergens een ijsje of gaan we naar een café. Het weekend is de beste tijd voor de familie.',
    sampleAnswerEnglish:
      "At the weekend I like to go to the park for a walk. I do this every Saturday with my husband and our two children. We always walk in Vondelpark in Amsterdam, because that park is large and beautiful. Afterwards we eat an ice cream somewhere together or go to a café. The weekend is the best time for the family.",
    evaluationCriteria: [
      'Describes what they like to do at the weekend',
      'Mentions with whom they do this',
      'States where this takes place',
      'Contains at least three complete sentences',
      'Grammar and spelling are correct',
    ],
  },
  {
    id: 'ex3-collega',
    examNumber: 3,
    type: 'note',
    title: 'Bericht collega',
    titleEnglish: 'Note to colleague',
    context:
      'U werkt in een kledingzaak. Straks komt uw collega Fariha. Zij moet een paar dingen doen.\n\nKijk naar de plaatjes:\n1. Stofzuigen (vacuuming)\n2. Kleren opruimen/sorteren (tidying/sorting clothes)\n3. Kleding ophangen op rekken (hanging clothes on racks)\n4. Afsluiten/de winkel sluiten (locking up / closing the shop)',
    contextEnglish:
      'You work in a clothes shop. Your colleague Fariha will arrive shortly. She needs to do a few things.\n\nLook at the pictures:\n1. Vacuuming\n2. Tidying/sorting clothes\n3. Hanging clothes on racks\n4. Locking up / closing the shop',
    bulletPoints: [
      { dutch: 'Schrijf een briefje voor Fariha.', english: 'Write a note for Fariha.' },
      { dutch: 'Vertel wat zij moet doen. Schrijf drie dingen op.', english: 'Tell her what she needs to do. Write three things.' },
      { dutch: 'Schrijf in hele zinnen.', english: 'Write in complete sentences.' },
    ],
    emailTemplate: {
      to: '',
      subject: '',
      greeting: 'Hallo Fariha,',
      closing: 'Alvast bedankt!\nGroeten,',
    },
    sampleAnswer:
      'Hallo Fariha,\n\nWelkom! Ik heb een paar taken voor je. Kun jij eerst de vloer stofzuigen? Daarna moet je de kleren opruimen en sorteren op maat. Tot slot moet je alle kleren netjes ophangen op de rekken. Vergeet ook niet de winkel af te sluiten als je weggaat!\n\nAlvast bedankt!\nGroeten,\n[Jouw naam]',
    sampleAnswerEnglish:
      "Hi Fariha,\n\nWelcome! I have a few tasks for you. Can you first vacuum the floor? After that you need to tidy and sort the clothes by size. Finally, you need to hang all the clothes neatly on the racks. Don't forget to lock up the shop when you leave!\n\nThanks in advance!\nGreetings,\n[Your name]",
    evaluationCriteria: [
      'Mentions at least three tasks to be done',
      'Includes vacuuming or floor-related task',
      'Includes tidying/sorting or hanging clothes',
      'Includes locking up / closing the shop',
      'Uses complete sentences',
      'Uses appropriate greeting and closing (Hallo Fariha / Alvast bedankt / Groeten)',
      'Grammar and spelling are correct',
    ],
  },
];

export const getExercisesByType = (type: ExerciseType) =>
  writingExercises.filter(e => e.type === type);

export const getExercisesByExam = (examNumber: number) =>
  writingExercises.filter(e => e.examNumber === examNumber);

export const getExerciseById = (id: string) =>
  writingExercises.find(e => e.id === id);
