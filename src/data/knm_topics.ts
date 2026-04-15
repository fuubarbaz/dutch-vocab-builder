// ============================================================================
// KNM (Kennis van de Nederlandse Maatschappij) Topics
// All 11 exam topic areas with bilingual lessons and quiz questions.
// ============================================================================

export type KNMLanguage = 'en' | 'nl';

export interface KNMBilingual {
  en: string;
  nl: string;
}

export interface KNMQuestion {
  id: string;
  question: KNMBilingual;
  options: { en: string[]; nl: string[] };
  correctIndex: number;
  explanation: KNMBilingual;
}

export interface KNMTopic {
  id: string;
  icon: string;
  title: KNMBilingual;
  description: KNMBilingual;
  color: string;
  explanation: KNMBilingual;
  keyPoints: KNMBilingual[];
  examples: KNMBilingual[];
  quizQuestions: KNMQuestion[];
}

// ============================================================================
// TOPIC 1 — Living in the Netherlands (Wonen)
// ============================================================================
const LIVING: KNMTopic = {
  id: 'living',
  icon: 'home-outline',
  title: { en: 'Living in the Netherlands', nl: 'Wonen in Nederland' },
  description: {
    en: 'Housing, registration, and daily neighbourhood rules.',
    nl: 'Wonen, inschrijving en regels in de buurt.',
  },
  color: '#3b82f6',
  explanation: {
    en: `In the Netherlands, most people rent their homes — either from a housing corporation (woningcorporatie) or a private landlord. A rental contract (huurcontract) outlines your rights and duties. If your income is low, you may qualify for housing benefit (huurtoeslag).

When you move to a new address, you must register at the local municipality (gemeente) within five days. This registration is mandatory and is linked to your BSN (citizen service number).

Waste separation (afvalscheiding) is taken very seriously: paper, glass, plastic, and organic waste each go into separate bins or containers. Neighbours share the same living environment, so noise rules (especially at night) and general respect are expected.`,
    nl: `In Nederland huren de meeste mensen hun woning — van een woningcorporatie of een particuliere verhuurder. In een huurcontract staan je rechten en plichten. Als je inkomen laag is, kun je misschien huurtoeslag krijgen.

Als je naar een nieuw adres verhuist, moet je je binnen vijf dagen inschrijven bij de gemeente. Deze inschrijving is verplicht en is gekoppeld aan je BSN (burgerservicenummer).

Afvalscheiding wordt heel serieus genomen: papier, glas, plastic en gft-afval gaan elk in aparte bakken of containers. Buren delen dezelfde leefomgeving, dus regels voor geluid (vooral 's nachts) en algemeen respect worden verwacht.`,
  },
  keyPoints: [
    {
      en: 'You must register at the gemeente within 5 days of moving.',
      nl: 'Je moet je binnen 5 dagen na verhuizing inschrijven bij de gemeente.',
    },
    {
      en: 'Housing benefit (huurtoeslag) is available for people with lower incomes.',
      nl: 'Huurtoeslag is beschikbaar voor mensen met een lager inkomen.',
    },
    {
      en: 'Waste must be separated: paper, glass, plastic, and organic waste.',
      nl: 'Afval moet worden gescheiden: papier, glas, plastic en gft.',
    },
    {
      en: 'Social housing (woningcorporatie) has long waiting lists.',
      nl: 'Sociale huur (woningcorporatie) heeft lange wachtlijsten.',
    },
    {
      en: 'Noise between 23:00 and 07:00 should be kept to a minimum.',
      nl: 'Geluid tussen 23:00 en 07:00 moet tot een minimum worden beperkt.',
    },
    {
      en: 'Your landlord must give you a proper rental contract.',
      nl: 'Je verhuurder moet je een geldig huurcontract geven.',
    },
  ],
  examples: [
    {
      en: 'Maria moved to Amsterdam and registered at the gemeente on day 3.',
      nl: 'Maria verhuisde naar Amsterdam en schreef zich op dag 3 in bij de gemeente.',
    },
    {
      en: 'Ahmed receives huurtoeslag because his salary is below the threshold.',
      nl: 'Ahmed ontvangt huurtoeslag omdat zijn salaris onder de grens ligt.',
    },
    {
      en: 'Throwing glass in the plastic bin is incorrect — it must go to the glass container.',
      nl: 'Glas in de plasticbak gooien is fout — het moet in de glasbak.',
    },
  ],
  quizQuestions: [
    {
      id: 'living-q1',
      question: {
        en: 'Within how many days must you register at the municipality after moving to a new address?',
        nl: 'Binnen hoeveel dagen moet je je inschrijven bij de gemeente na verhuizing naar een nieuw adres?',
      },
      options: {
        en: ['5 days', '14 days', '30 days', '1 day'],
        nl: ['5 dagen', '14 dagen', '30 dagen', '1 dag'],
      },
      correctIndex: 0,
      explanation: {
        en: 'You are legally required to register at your local gemeente within 5 working days of moving to a new address in the Netherlands.',
        nl: 'Je bent wettelijk verplicht je binnen 5 werkdagen na verhuizing naar een nieuw adres in Nederland in te schrijven bij de gemeente.',
      },
    },
    {
      id: 'living-q2',
      question: {
        en: 'What is "huurtoeslag"?',
        nl: 'Wat is huurtoeslag?',
      },
      options: {
        en: [
          'A tax on rental income',
          'Financial support to help pay rent for lower-income households',
          'A fee for registering at the gemeente',
          'A deposit paid to the landlord',
        ],
        nl: [
          'Een belasting op huurinkomsten',
          'Financiële ondersteuning voor lagere inkomens om de huur te betalen',
          'Een vergoeding voor inschrijving bij de gemeente',
          'Een borg betaald aan de verhuurder',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'Huurtoeslag is a rent benefit from the Dutch government to help people with lower incomes afford their rent. You apply for it via the Belastingdienst.',
        nl: 'Huurtoeslag is een huursubsidie van de Nederlandse overheid om mensen met lagere inkomens te helpen de huur te betalen. Je vraagt het aan bij de Belastingdienst.',
      },
    },
    {
      id: 'living-q3',
      question: {
        en: 'Where do you put old newspapers and cardboard in the Netherlands?',
        nl: 'Waar gooi je oude kranten en karton in Nederland?',
      },
      options: {
        en: ['In the plastic container (PMD)', 'In the paper/cardboard bin', 'In the organic waste bin (GFT)', 'In the general waste bin'],
        nl: ['In de plasticcontainer (PMD)', 'In de papierbak', 'In de GFT-bak', 'In de restafvalbak'],
      },
      correctIndex: 1,
      explanation: {
        en: 'Paper and cardboard belong in the paper/cardboard bin. The Netherlands has a strict waste separation system: paper, glass, plastic (PMD), organic (GFT), and residual waste all go separately.',
        nl: 'Papier en karton horen in de papierbak. Nederland heeft een streng afvalscheidingssysteem: papier, glas, plastic (PMD), organisch (GFT) en restafval gaan apart.',
      },
    },
    {
      id: 'living-q4',
      question: {
        en: 'What is a "woningcorporatie"?',
        nl: 'Wat is een woningcorporatie?',
      },
      options: {
        en: [
          'A private real estate agency',
          'A non-profit organization that provides social housing',
          'A government department that sets rental prices',
          'A bank that provides mortgages',
        ],
        nl: [
          'Een particulier makelaarskantoor',
          'Een non-profitorganisatie die sociale huurwoningen aanbiedt',
          'Een overheidsinstantie die huurprijzen vaststelt',
          'Een bank die hypotheken verstrekt',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'A woningcorporatie is a housing association that manages social rental housing. They provide affordable homes, mainly to people with lower incomes. Waiting lists can be very long.',
        nl: 'Een woningcorporatie is een woningbouwvereniging die sociale huurwoningen beheert. Ze bieden betaalbare woningen, voornamelijk aan mensen met lagere inkomens. Wachtlijsten kunnen erg lang zijn.',
      },
    },
    {
      id: 'living-q5',
      question: {
        en: 'Your neighbour plays loud music at midnight. What should you do first?',
        nl: 'Je buur speelt midden in de nacht harde muziek. Wat doe je als eerste?',
      },
      options: {
        en: [
          'Call the police immediately',
          'Politely talk to your neighbour about it',
          'Write a complaint to the municipality',
          'Move to a different apartment',
        ],
        nl: [
          'Onmiddellijk de politie bellen',
          'Vriendelijk met je buur praten over het probleem',
          'Een klacht indienen bij de gemeente',
          'Verhuizen naar een ander appartement',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'In Dutch culture, the first step is always to talk directly and politely to your neighbour. If that does not work, you can contact the building manager or municipality. Calling the police is a last resort.',
        nl: 'In de Nederlandse cultuur is de eerste stap altijd om direct en vriendelijk met je buur te praten. Als dat niet werkt, kun je contact opnemen met de beheerder of de gemeente. De politie bellen is een laatste redmiddel.',
      },
    },
  ],
};

// ============================================================================
// TOPIC 2 — Work & Income (Werk en Inkomen)
// ============================================================================
const WORK: KNMTopic = {
  id: 'work',
  icon: 'briefcase-outline',
  title: { en: 'Work & Income', nl: 'Werk en Inkomen' },
  description: {
    en: 'Jobs, contracts, wages, taxes, and work culture.',
    nl: 'Werk, contracten, loon, belasting en werkcultuur.',
  },
  color: '#f59e0b',
  explanation: {
    en: `Finding a job in the Netherlands usually involves writing a CV (curriculum vitae) and a motivation letter, then going through a sollicitatiegesprek (job interview). Work culture values punctuality, directness, and independence.

Contracts can be full-time, part-time, or tijdelijk (temporary). All employees are entitled to at least the wettelijk minimumloon (statutory minimum wage), which changes every year. Salaries are paid monthly.

Taxes are handled by the Belastingdienst. Your employer deducts income tax (loonbelasting) from your salary. You may need to file a belastingaangifte (tax return). If you lose your job, you may be entitled to a WW-uitkering (unemployment benefit) through the UWV.`,
    nl: `Een baan vinden in Nederland gaat meestal via een cv en een motivatiebrief, gevolgd door een sollicitatiegesprek. De werkcultuur waardeert stiptheid, directheid en zelfstandigheid.

Contracten kunnen voltijd, deeltijd of tijdelijk zijn. Alle werknemers hebben recht op het wettelijk minimumloon, dat elk jaar verandert. Salarissen worden maandelijks betaald.

Belastingen worden afgehandeld door de Belastingdienst. Je werkgever houdt loonbelasting in op je salaris. Mogelijk moet je een belastingaangifte indienen. Als je je baan verliest, heb je mogelijk recht op een WW-uitkering via het UWV.`,
  },
  keyPoints: [
    {
      en: 'Dutch work culture values punctuality — being on time is very important.',
      nl: 'De Nederlandse werkcultuur waardeert stiptheid — op tijd zijn is erg belangrijk.',
    },
    {
      en: 'Every employee is entitled to the statutory minimum wage (wettelijk minimumloon).',
      nl: 'Elke werknemer heeft recht op het wettelijk minimumloon.',
    },
    {
      en: 'Income tax (loonbelasting) is automatically deducted from your salary.',
      nl: 'Loonbelasting wordt automatisch ingehouden op je salaris.',
    },
    {
      en: 'Unemployment benefit (WW-uitkering) is managed by UWV.',
      nl: 'De WW-uitkering wordt beheerd door het UWV.',
    },
    {
      en: 'Direct communication is normal — being straightforward is not considered rude.',
      nl: 'Directe communicatie is normaal — eerlijk zijn wordt niet als onbeleefd beschouwd.',
    },
    {
      en: 'A temporary contract (tijdelijk contract) must be renewed or converted to permanent after a certain period.',
      nl: 'Een tijdelijk contract moet na een bepaalde periode worden verlengd of omgezet naar een vast contract.',
    },
  ],
  examples: [
    {
      en: 'Fatima sent her CV and cover letter to three companies and got an interview.',
      nl: 'Fatima stuurde haar cv en motivatiebrief naar drie bedrijven en kreeg een sollicitatiegesprek.',
    },
    {
      en: 'Carlos works 32 hours a week — this is considered part-time in the Netherlands.',
      nl: 'Carlos werkt 32 uur per week — dit wordt in Nederland beschouwd als deeltijd.',
    },
    {
      en: 'After losing her job, Sara applied for a WW-uitkering at the UWV office.',
      nl: 'Na haar ontslag vroeg Sara een WW-uitkering aan bij het UWV.',
    },
  ],
  quizQuestions: [
    {
      id: 'work-q1',
      question: {
        en: 'Which organization manages unemployment benefits (WW-uitkering) in the Netherlands?',
        nl: 'Welke organisatie beheert de WW-uitkering in Nederland?',
      },
      options: {
        en: ['Belastingdienst', 'UWV', 'Gemeente', 'DUO'],
        nl: ['Belastingdienst', 'UWV', 'Gemeente', 'DUO'],
      },
      correctIndex: 1,
      explanation: {
        en: 'The UWV (Uitvoeringsinstituut Werknemersverzekeringen) manages unemployment benefits, disability benefits, and other employee insurances in the Netherlands.',
        nl: 'Het UWV (Uitvoeringsinstituut Werknemersverzekeringen) beheert de WW-uitkering, arbeidsongeschiktheidsuitkeringen en andere werknemersverzekeringen in Nederland.',
      },
    },
    {
      id: 'work-q2',
      question: {
        en: 'In Dutch work culture, being 10 minutes late to a meeting is generally considered:',
        nl: 'In de Nederlandse werkcultuur wordt 10 minuten te laat komen bij een vergadering over het algemeen beschouwd als:',
      },
      options: {
        en: [
          'Normal and acceptable',
          'Impolite and unprofessional',
          'A sign of being very busy',
          'Only a problem for very formal meetings',
        ],
        nl: [
          'Normaal en acceptabel',
          'Onbeleefd en onprofessioneel',
          'Een teken dat je het erg druk hebt',
          'Alleen een probleem bij formele vergaderingen',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'Punctuality is highly valued in Dutch work culture. Being on time (or even a few minutes early) shows respect. Arriving late without a good reason is considered impolite.',
        nl: 'Stiptheid wordt hoog gewaardeerd in de Nederlandse werkcultuur. Op tijd komen (of zelfs een paar minuten vroeger) toont respect. Te laat komen zonder goede reden wordt als onbeleefd beschouwd.',
      },
    },
    {
      id: 'work-q3',
      question: {
        en: 'What does the Belastingdienst do?',
        nl: 'Wat doet de Belastingdienst?',
      },
      options: {
        en: [
          'It registers new residents in the Netherlands',
          'It collects taxes and processes tax returns',
          'It pays unemployment benefits',
          'It issues work permits for immigrants',
        ],
        nl: [
          'Het schrijft nieuwe inwoners in in Nederland',
          'Het int belastingen en verwerkt belastingaangiften',
          'Het betaalt werkloosheidsuitkeringen',
          'Het geeft werkvergunningen af voor immigranten',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'The Belastingdienst is the Dutch Tax and Customs Administration. It handles income tax, VAT, and other taxes. It also processes tax returns and pays out toeslagen (allowances).',
        nl: 'De Belastingdienst is de Nederlandse Belasting- en Douanedienst. Het beheert inkomstenbelasting, btw en andere belastingen. Het verwerkt ook belastingaangiften en betaalt toeslagen uit.',
      },
    },
    {
      id: 'work-q4',
      question: {
        en: 'You have a tijdelijk (temporary) contract. What does this mean?',
        nl: 'Je hebt een tijdelijk contract. Wat betekent dit?',
      },
      options: {
        en: [
          'You work every day for a fixed number of hours',
          'Your employment ends at a specified date unless renewed',
          'You can only work on weekends',
          'You do not receive a minimum wage',
        ],
        nl: [
          'Je werkt elke dag een vast aantal uren',
          'Je dienstverband eindigt op een bepaalde datum, tenzij verlengd',
          'Je mag alleen in het weekend werken',
          'Je ontvangt geen minimumloon',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'A tijdelijk contract (temporary contract) has a fixed end date. After several temporary contracts, Dutch law may require the employer to offer a permanent contract.',
        nl: 'Een tijdelijk contract heeft een vaste einddatum. Na meerdere tijdelijke contracten kan de Nederlandse wet de werkgever verplichten een vast contract aan te bieden.',
      },
    },
    {
      id: 'work-q5',
      question: {
        en: 'What is the minimum wage in the Netherlands based on?',
        nl: 'Waarop is het minimumloon in Nederland gebaseerd?',
      },
      options: {
        en: [
          'It is fixed forever and never changes',
          'It is set by each employer individually',
          'It is set by the government and updated periodically',
          'It depends only on your level of education',
        ],
        nl: [
          'Het staat voor altijd vast en verandert nooit',
          'Het wordt door elke werkgever afzonderlijk vastgesteld',
          'Het wordt door de overheid vastgesteld en periodiek bijgewerkt',
          'Het hangt alleen af van je opleidingsniveau',
        ],
      },
      correctIndex: 2,
      explanation: {
        en: 'The wettelijk minimumloon (statutory minimum wage) is set by the Dutch government and is updated twice a year (January and July). All employees are entitled to at least this wage.',
        nl: 'Het wettelijk minimumloon wordt vastgesteld door de Nederlandse overheid en tweemaal per jaar bijgewerkt (januari en juli). Alle werknemers hebben recht op minimaal dit loon.',
      },
    },
  ],
};

// ============================================================================
// TOPIC 3 — Healthcare (Gezondheidszorg)
// ============================================================================
const HEALTHCARE: KNMTopic = {
  id: 'healthcare',
  icon: 'medkit-outline',
  title: { en: 'Healthcare', nl: 'Gezondheidszorg' },
  description: {
    en: 'Insurance, GP system, emergency care, and pharmacy.',
    nl: 'Verzekering, huisartsenstelsel, spoedeisende hulp en apotheek.',
  },
  color: '#10b981',
  explanation: {
    en: `In the Netherlands, health insurance (zorgverzekering) is mandatory for everyone who lives or works there. You must take out a basic insurance package (basisverzekering) from a private insurer. The government pays a healthcare allowance (zorgtoeslag) to people with lower incomes.

The Dutch system is GP-centred. For most medical issues, you first go to your huisarts (general practitioner). The GP decides whether you need to see a specialist. You cannot go directly to a hospital for non-emergency care — you need a referral (verwijzing).

In emergencies, call 112 for ambulance, fire, or police. The apotheek (pharmacy) fills your prescriptions and advises on medicines. Maternity care (kraamzorg) is a unique Dutch system where a maternity nurse (kraamverzorgster) visits your home after childbirth.`,
    nl: `In Nederland is een zorgverzekering verplicht voor iedereen die er woont of werkt. Je moet een basisverzekering afsluiten bij een particuliere verzekeraar. De overheid betaalt zorgtoeslag aan mensen met lagere inkomens.

Het Nederlandse systeem is huisartsgericht. Voor de meeste medische problemen ga je eerst naar je huisarts. De huisarts beslist of je naar een specialist moet. Je kunt niet zomaar naar een ziekenhuis voor niet-spoedeisende zorg — je hebt een verwijzing nodig.

Bij noodgevallen bel je 112 voor ambulance, brandweer of politie. De apotheek vult je recepten in en geeft advies over medicijnen. Kraamzorg is een uniek Nederlands systeem waarbij een kraamverzorgster na de bevalling bij je thuis langskomt.`,
  },
  keyPoints: [
    {
      en: 'Health insurance (zorgverzekering) is mandatory for everyone in the Netherlands.',
      nl: 'Zorgverzekering is verplicht voor iedereen in Nederland.',
    },
    {
      en: 'For most health issues, you must first visit your GP (huisarts) before seeing a specialist.',
      nl: 'Voor de meeste gezondheidsproblemen moet je eerst naar je huisarts voordat je een specialist ziet.',
    },
    {
      en: 'In an emergency, call 112. For non-urgent medical questions, call 0900-8844 (police non-emergency).',
      nl: 'Bij een noodgeval bel je 112. Voor niet-dringende vragen kun je 0900-8844 bellen.',
    },
    {
      en: 'Zorgtoeslag helps lower-income people afford health insurance premiums.',
      nl: 'Zorgtoeslag helpt mensen met lagere inkomens de zorgverzekeringspremie te betalen.',
    },
    {
      en: 'You need a referral (verwijzing) from your GP to see a specialist or go to hospital.',
      nl: 'Je hebt een verwijzing van je huisarts nodig om een specialist te zien of naar het ziekenhuis te gaan.',
    },
    {
      en: 'Kraamzorg provides professional maternity care at home after birth — unique to the Netherlands.',
      nl: 'Kraamzorg biedt professionele kraamzorg thuis na de geboorte — uniek voor Nederland.',
    },
  ],
  examples: [
    {
      en: 'When Lena had a sore throat, she called her huisarts to make an appointment.',
      nl: 'Toen Lena keelpijn had, belde ze haar huisarts voor een afspraak.',
    },
    {
      en: 'The doctor gave Jan a verwijzing so he could see an orthopaedic specialist.',
      nl: 'De dokter gaf Jan een verwijzing zodat hij een orthopedisch specialist kon bezoeken.',
    },
    {
      en: 'After the baby was born, a kraamverzorgster visited the family every day for a week.',
      nl: 'Na de geboorte van de baby bezocht een kraamverzorgster het gezin elke dag gedurende een week.',
    },
  ],
  quizQuestions: [
    {
      id: 'health-q1',
      question: {
        en: 'Health insurance in the Netherlands is:',
        nl: 'Zorgverzekering in Nederland is:',
      },
      options: {
        en: [
          'Optional — only needed if you are seriously ill',
          'Mandatory for everyone who lives or works in the Netherlands',
          'Only required for non-EU citizens',
          'Provided for free by the government to all residents',
        ],
        nl: [
          'Vrijwillig — alleen nodig als je ernstig ziek bent',
          'Verplicht voor iedereen die in Nederland woont of werkt',
          'Alleen vereist voor niet-EU-burgers',
          'Gratis aangeboden door de overheid aan alle inwoners',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'Zorgverzekering is legally mandatory in the Netherlands for all residents and workers. You must purchase a basisverzekering (basic insurance package) from a private insurer.',
        nl: 'Zorgverzekering is wettelijk verplicht in Nederland voor alle inwoners en werknemers. Je moet een basisverzekering afsluiten bij een particuliere verzekeraar.',
      },
    },
    {
      id: 'health-q2',
      question: {
        en: 'What is the correct emergency number in the Netherlands?',
        nl: 'Wat is het juiste noodnummer in Nederland?',
      },
      options: {
        en: ['999', '911', '112', '000'],
        nl: ['999', '911', '112', '000'],
      },
      correctIndex: 2,
      explanation: {
        en: '112 is the European emergency number and is used in the Netherlands for ambulance, fire brigade, and police in life-threatening situations.',
        nl: '112 is het Europese noodnummer en wordt in Nederland gebruikt voor ambulance, brandweer en politie in levensbedreigende situaties.',
      },
    },
    {
      id: 'health-q3',
      question: {
        en: 'You have a knee problem and want to see an orthopaedic specialist. What must you do first?',
        nl: 'Je hebt knieproblemen en wilt een orthopedisch specialist zien. Wat moet je eerst doen?',
      },
      options: {
        en: [
          'Go directly to the hospital',
          "Call the specialist's office directly",
          'Visit your huisarts (GP) to get a referral',
          'Go to the apotheek for medication',
        ],
        nl: [
          'Direct naar het ziekenhuis gaan',
          'Direct het kantoor van de specialist bellen',
          'Naar je huisarts gaan voor een verwijzing',
          'Naar de apotheek gaan voor medicatie',
        ],
      },
      correctIndex: 2,
      explanation: {
        en: 'The Dutch healthcare system is GP-centred. You must first consult your huisarts, who will decide whether you need to see a specialist and will give you a verwijzing (referral).',
        nl: 'Het Nederlandse zorgstelsel is huisartsgericht. Je moet eerst je huisarts raadplegen, die beslist of je een specialist nodig hebt en je een verwijzing geeft.',
      },
    },
    {
      id: 'health-q4',
      question: {
        en: 'What is "zorgtoeslag"?',
        nl: 'Wat is zorgtoeslag?',
      },
      options: {
        en: [
          'Extra coverage for dental care',
          'A government allowance to help pay health insurance premiums',
          'A fine for not having health insurance',
          'A special insurance for elderly people',
        ],
        nl: [
          'Extra dekking voor tandheelkundige zorg',
          'Een overheidstoeslag om de zorgverzekeringspremie te helpen betalen',
          'Een boete voor het niet hebben van een zorgverzekering',
          'Een speciale verzekering voor ouderen',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'Zorgtoeslag is a monthly government contribution to help people with lower incomes pay for their health insurance premiums. You apply for it via the Belastingdienst.',
        nl: 'Zorgtoeslag is een maandelijkse overheidsbijdrage om mensen met lagere inkomens te helpen hun zorgverzekeringspremie te betalen. Je vraagt het aan bij de Belastingdienst.',
      },
    },
    {
      id: 'health-q5',
      question: {
        en: 'What is "kraamzorg"?',
        nl: 'Wat is kraamzorg?',
      },
      options: {
        en: [
          'Care for elderly people at home',
          'Professional maternity nursing care at home after childbirth',
          'Emergency care at a hospital',
          'Childcare for babies under one year',
        ],
        nl: [
          'Thuiszorg voor ouderen',
          'Professionele kraamverzorging thuis na de bevalling',
          'Spoedeisende hulp in een ziekenhuis',
          'Kinderopvang voor baby\'s onder de één jaar',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'Kraamzorg is a uniquely Dutch system of professional maternity care at home. A kraamverzorgster (maternity nurse) visits the mother and newborn at home in the days following birth.',
        nl: 'Kraamzorg is een uniek Nederlands systeem van professionele kraamzorg thuis. Een kraamverzorgster bezoekt de moeder en de pasgeborene thuis in de dagen na de bevalling.',
      },
    },
  ],
};

// ============================================================================
// TOPIC 4 — Education (Onderwijs)
// ============================================================================
const EDUCATION: KNMTopic = {
  id: 'education',
  icon: 'book-outline',
  title: { en: 'Education', nl: 'Onderwijs' },
  description: {
    en: 'Schools, compulsory education, childcare, and costs.',
    nl: 'Scholen, leerplicht, kinderopvang en kosten.',
  },
  color: '#8b5cf6',
  explanation: {
    en: `The Dutch school system starts with basisschool (primary school) from age 4 to 12. After that, students go to middelbare school (secondary school). There are different levels: VMBO (vocational), HAVO (general secondary), and VWO (pre-university).

After secondary school, students can choose MBO (vocational college), HBO (higher professional education), or WO (university). Education is compulsory (leerplicht) from age 5 to 16. After that, students must participate in education or work until they are 18 (kwalificatieplicht).

Childcare (kinderopvang) is available for working parents and there is a government allowance (kinderopvangtoeslag). Parents are expected to be actively involved in their child's education.`,
    nl: `Het Nederlandse schoolsysteem begint met de basisschool vanaf 4 jaar tot 12 jaar. Daarna gaan leerlingen naar de middelbare school. Er zijn verschillende niveaus: VMBO (beroepsonderwijs), HAVO (algemeen voortgezet onderwijs) en VWO (voorbereidend wetenschappelijk onderwijs).

Na de middelbare school kunnen studenten kiezen voor MBO (middelbaar beroepsonderwijs), HBO (hoger beroepsonderwijs) of WO (wetenschappelijk onderwijs). Onderwijs is verplicht (leerplicht) van 5 tot 16 jaar. Daarna moeten jongeren tot 18 jaar deelnemen aan onderwijs of werken (kwalificatieplicht).

Kinderopvang is beschikbaar voor werkende ouders en er is een overheidstoeslag (kinderopvangtoeslag). Ouders worden geacht actief betrokken te zijn bij de opleiding van hun kind.`,
  },
  keyPoints: [
    {
      en: 'Education is compulsory (leerplicht) from age 5 to 16.',
      nl: 'Onderwijs is verplicht (leerplicht) van 5 tot 16 jaar.',
    },
    {
      en: 'The school levels after basisschool are VMBO, HAVO, and VWO.',
      nl: 'De schoolniveaus na de basisschool zijn VMBO, HAVO en VWO.',
    },
    {
      en: 'MBO = vocational college, HBO = higher professional education, WO = university.',
      nl: 'MBO = middelbaar beroepsonderwijs, HBO = hoger beroepsonderwijs, WO = wetenschappelijk onderwijs.',
    },
    {
      en: 'Kinderopvangtoeslag helps working parents pay for childcare.',
      nl: 'Kinderopvangtoeslag helpt werkende ouders de kinderopvang te betalen.',
    },
    {
      en: 'Children must attend school every day — unexplained absences can be reported to the leerplichtambtenaar.',
      nl: 'Kinderen moeten elke dag naar school — onverklaarde afwezigheid kan worden gemeld bij de leerplichtambtenaar.',
    },
  ],
  examples: [
    {
      en: 'Emma is 10 years old and attends basisschool in Utrecht.',
      nl: 'Emma is 10 jaar oud en gaat naar basisschool in Utrecht.',
    },
    {
      en: 'After getting his HAVO diploma, Yusuf chose to study at HBO to become a nurse.',
      nl: 'Na zijn HAVO-diploma koos Yusuf voor een HBO-opleiding om verpleegkundige te worden.',
    },
    {
      en: 'Working parents can apply for kinderopvangtoeslag to help pay for daycare.',
      nl: 'Werkende ouders kunnen kinderopvangtoeslag aanvragen om de kosten van de kinderopvang te helpen betalen.',
    },
  ],
  quizQuestions: [
    {
      id: 'edu-q1',
      question: {
        en: 'From what age is education compulsory (leerplicht) in the Netherlands?',
        nl: 'Vanaf welke leeftijd is onderwijs verplicht (leerplicht) in Nederland?',
      },
      options: {
        en: ['Age 4', 'Age 5', 'Age 6', 'Age 7'],
        nl: ['4 jaar', '5 jaar', '6 jaar', '7 jaar'],
      },
      correctIndex: 1,
      explanation: {
        en: 'Leerplicht (compulsory education) starts at age 5 in the Netherlands, although many children already attend basisschool from age 4. Education is compulsory until age 16.',
        nl: 'Leerplicht begint op 5-jarige leeftijd in Nederland, hoewel veel kinderen al vanaf 4 jaar naar de basisschool gaan. Onderwijs is verplicht tot 16 jaar.',
      },
    },
    {
      id: 'edu-q2',
      question: {
        en: 'Which school level in the Netherlands prepares students for university (WO)?',
        nl: 'Welk schoolniveau in Nederland bereidt leerlingen voor op de universiteit (WO)?',
      },
      options: {
        en: ['VMBO', 'HAVO', 'VWO', 'MBO'],
        nl: ['VMBO', 'HAVO', 'VWO', 'MBO'],
      },
      correctIndex: 2,
      explanation: {
        en: 'VWO (Voorbereidend Wetenschappelijk Onderwijs) is the highest secondary school level and prepares students directly for university (WO). HAVO prepares students for HBO, while VMBO prepares for MBO.',
        nl: 'VWO (Voorbereidend Wetenschappelijk Onderwijs) is het hoogste middelbare schoolniveau en bereidt leerlingen voor op de universiteit (WO). HAVO bereidt voor op HBO, terwijl VMBO voorbereidt op MBO.',
      },
    },
    {
      id: 'edu-q3',
      question: {
        en: 'What is "kinderopvangtoeslag"?',
        nl: 'Wat is kinderopvangtoeslag?',
      },
      options: {
        en: [
          'A government allowance helping working parents pay for childcare',
          'A monthly payment for stay-at-home parents',
          'Free childcare for all Dutch children',
          'A tax applied to private schools',
        ],
        nl: [
          'Een overheidstoeslag die werkende ouders helpt de kinderopvang te betalen',
          'Een maandelijkse betaling voor thuisblijvende ouders',
          'Gratis kinderopvang voor alle Nederlandse kinderen',
          'Een belasting op particuliere scholen',
        ],
      },
      correctIndex: 0,
      explanation: {
        en: 'Kinderopvangtoeslag is a government contribution to help working parents (or studying parents) afford the costs of childcare. It is administered by the Belastingdienst.',
        nl: 'Kinderopvangtoeslag is een overheidsbijdrage om werkende ouders (of studerende ouders) te helpen de kosten van kinderopvang te betalen. Het wordt beheerd door de Belastingdienst.',
      },
    },
    {
      id: 'edu-q4',
      question: {
        en: 'After completing VMBO, what is the most common next educational step?',
        nl: 'Na het afronden van VMBO, wat is de meest gebruikelijke volgende onderwijsstap?',
      },
      options: {
        en: ['WO (university)', 'HBO (higher professional education)', 'MBO (vocational college)', 'VWO'],
        nl: ['WO (universiteit)', 'HBO (hoger beroepsonderwijs)', 'MBO (middelbaar beroepsonderwijs)', 'VWO'],
      },
      correctIndex: 2,
      explanation: {
        en: 'After VMBO, the standard next step is MBO (Middelbaar Beroepsonderwijs), which provides vocational training in practical professions. Students can also progress to HBO after completing a higher MBO level.',
        nl: 'Na VMBO is de standaard volgende stap MBO (Middelbaar Beroepsonderwijs), dat beroepsopleidingen aanbiedt in praktische beroepen. Studenten kunnen ook doorstromen naar HBO na afronding van een hoger MBO-niveau.',
      },
    },
    {
      id: 'edu-q5',
      question: {
        en: 'What happens if a child frequently skips school without a valid reason?',
        nl: 'Wat gebeurt er als een kind vaak school verzuimt zonder geldige reden?',
      },
      options: {
        en: [
          'Nothing — attendance is the child\'s choice',
          'The school reports it to the leerplichtambtenaar (school attendance officer)',
          'The child is automatically moved to a lower school level',
          'The parents receive a warning letter from the hospital',
        ],
        nl: [
          'Niets — aanwezigheid is de keuze van het kind',
          'De school meldt het aan de leerplichtambtenaar',
          'Het kind wordt automatisch naar een lager schoolniveau verplaatst',
          'De ouders ontvangen een waarschuwingsbrief van het ziekenhuis',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'Schools are required to report unexplained absences to the leerplichtambtenaar (school attendance officer). This officer can take action to ensure the child attends school as required by leerplicht law.',
        nl: 'Scholen zijn verplicht onverklaard verzuim te melden bij de leerplichtambtenaar. Deze ambtenaar kan actie ondernemen om ervoor te zorgen dat het kind naar school gaat zoals vereist door de leerplicht.',
      },
    },
  ],
};

// ============================================================================
// TOPIC 5 — Family & Social Life
// ============================================================================
const FAMILY: KNMTopic = {
  id: 'family',
  icon: 'people-outline',
  title: { en: 'Family & Social Life', nl: 'Gezin en Sociaal Leven' },
  description: {
    en: 'Raising children, gender equality, and child benefits.',
    nl: 'Kinderen opvoeden, gelijkheid en kinderbijslag.',
  },
  color: '#ec4899',
  explanation: {
    en: `Dutch society strongly values individual freedom, gender equality, and work-life balance. Children are raised to be independent from a young age — it is normal for them to move out at 18 or when they start studying.

Both parents are expected to contribute to household duties and childcare. Paternity leave (vaderschapsverlof) exists alongside maternity leave. Gender equality means women and men have equal rights in work, education, and family life.

Child benefit (kinderbijslag) is paid by the SVB (Sociale Verzekeringsbank) to all parents with children. It is not income-dependent. Families can also receive childcare allowance (kinderopvangtoeslag) if both parents work.`,
    nl: `De Nederlandse samenleving hecht sterk aan individuele vrijheid, gendergelijkheid en een goede werk-privébalans. Kinderen worden van jongs af aan opgevoed om zelfstandig te zijn — het is normaal dat ze op hun 18e of als ze gaan studeren het huis verlaten.

Van beide ouders wordt verwacht dat ze bijdragen aan huishoudelijke taken en kinderopvang. Vaderschapsverlof bestaat naast zwangerschapsverlof. Gendergelijkheid betekent dat vrouwen en mannen gelijke rechten hebben op het gebied van werk, onderwijs en gezinsleven.

Kinderbijslag wordt uitbetaald door de SVB (Sociale Verzekeringsbank) aan alle ouders met kinderen. Het is niet inkomensafhankelijk. Gezinnen kunnen ook kinderopvangtoeslag ontvangen als beide ouders werken.`,
  },
  keyPoints: [
    {
      en: 'Dutch children are raised to be independent — moving out at 18 is normal.',
      nl: 'Nederlandse kinderen worden opgevoed om zelfstandig te zijn — uitwonen op 18 is normaal.',
    },
    {
      en: 'Gender equality: women and men have equal rights in all areas of life.',
      nl: 'Gendergelijkheid: vrouwen en mannen hebben gelijke rechten op alle terreinen.',
    },
    {
      en: 'Kinderbijslag is a universal child benefit paid by the SVB to all parents.',
      nl: 'Kinderbijslag is een universele kindertoeslag die door de SVB aan alle ouders wordt betaald.',
    },
    {
      en: 'Work-life balance is very important — long working hours are not glorified.',
      nl: 'Werk-privébalans is erg belangrijk — lange werkuren worden niet verheerlijkt.',
    },
    {
      en: 'Same-sex marriage and adoption rights are fully legal in the Netherlands.',
      nl: 'Huwelijk voor iedereen en adoptierechten zijn volledig legaal in Nederland.',
    },
  ],
  examples: [
    {
      en: 'When Liam turned 18 and started university, he moved into a student house.',
      nl: 'Toen Liam 18 werd en begon te studeren, trok hij in een studentenhuis.',
    },
    {
      en: 'Both Mia and her husband share the cooking and childcare equally.',
      nl: 'Zowel Mia als haar man delen het koken en de kinderopvang gelijkelijk.',
    },
    {
      en: 'The SVB automatically deposits kinderbijslag every quarter.',
      nl: 'De SVB betaalt elk kwartaal automatisch kinderbijslag uit.',
    },
  ],
  quizQuestions: [
    {
      id: 'family-q1',
      question: {
        en: 'Which organization pays kinderbijslag (child benefit) in the Netherlands?',
        nl: 'Welke organisatie betaalt kinderbijslag in Nederland?',
      },
      options: {
        en: ['Belastingdienst', 'UWV', 'SVB (Sociale Verzekeringsbank)', 'Gemeente'],
        nl: ['Belastingdienst', 'UWV', 'SVB (Sociale Verzekeringsbank)', 'Gemeente'],
      },
      correctIndex: 2,
      explanation: {
        en: 'The SVB (Sociale Verzekeringsbank) pays kinderbijslag. This is a quarterly payment for all parents with children under 18, regardless of income.',
        nl: 'De SVB (Sociale Verzekeringsbank) betaalt kinderbijslag. Dit is een kwartaalbetaling voor alle ouders met kinderen onder de 18, ongeacht het inkomen.',
      },
    },
    {
      id: 'family-q2',
      question: {
        en: 'In the Netherlands, at what age do most young people leave home?',
        nl: 'Op welke leeftijd verlaten de meeste jongeren in Nederland het ouderlijk huis?',
      },
      options: {
        en: ['Around 14-15', 'Around 18-23', 'Around 30', 'They typically stay until married'],
        nl: ['Rond 14-15 jaar', 'Rond 18-23 jaar', 'Rond 30 jaar', 'Ze blijven normaal tot ze trouwen'],
      },
      correctIndex: 1,
      explanation: {
        en: 'Dutch young people typically move out around age 18-23, often when they start studying or working. Independence is highly valued and children are raised with this expectation.',
        nl: 'Nederlandse jongeren verlaten het huis meestal rond hun 18e-23e, vaak als ze gaan studeren of werken. Zelfstandigheid wordt hoog gewaardeerd en kinderen worden met deze verwachting opgevoed.',
      },
    },
    {
      id: 'family-q3',
      question: {
        en: 'In the Netherlands, gender equality means:',
        nl: 'In Nederland betekent gendergelijkheid:',
      },
      options: {
        en: [
          'Women must stay home and men must work',
          'Women and men have equal rights in work, education, and family life',
          'Women are given more rights than men to compensate for history',
          'Gender equality only applies in the workplace',
        ],
        nl: [
          'Vrouwen moeten thuisblijven en mannen moeten werken',
          'Vrouwen en mannen hebben gelijke rechten in werk, onderwijs en gezinsleven',
          'Vrouwen krijgen meer rechten dan mannen ter compensatie van de geschiedenis',
          'Gendergelijkheid geldt alleen op de werkvloer',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'Gender equality in the Netherlands means women and men have equal rights and opportunities in all areas: work, education, politics, and family life. This is a core Dutch value.',
        nl: 'Gendergelijkheid in Nederland betekent dat vrouwen en mannen gelijke rechten en kansen hebben op alle gebieden: werk, onderwijs, politiek en gezinsleven. Dit is een kernwaarde in Nederland.',
      },
    },
    {
      id: 'family-q4',
      question: {
        en: 'How often is kinderbijslag paid?',
        nl: 'Hoe vaak wordt kinderbijslag uitbetaald?',
      },
      options: {
        en: ['Monthly', 'Every quarter (3 months)', 'Twice a year', 'Once a year'],
        nl: ['Maandelijks', 'Elk kwartaal (3 maanden)', 'Twee keer per jaar', 'Eén keer per jaar'],
      },
      correctIndex: 1,
      explanation: {
        en: 'Kinderbijslag is paid every quarter (January, April, July, October) by the SVB to all parents with children under 18.',
        nl: 'Kinderbijslag wordt elk kwartaal (januari, april, juli, oktober) betaald door de SVB aan alle ouders met kinderen onder de 18.',
      },
    },
    {
      id: 'family-q5',
      question: {
        en: 'Same-sex marriage in the Netherlands is:',
        nl: 'Huwelijk tussen mensen van hetzelfde geslacht in Nederland is:',
      },
      options: {
        en: [
          'Illegal and not recognized',
          'Recognized only as a civil partnership, not marriage',
          'Fully legal — the Netherlands was the first country to legalize it (2001)',
          'Legal only in certain municipalities',
        ],
        nl: [
          'Illegaal en niet erkend',
          'Alleen erkend als geregistreerd partnerschap, niet als huwelijk',
          'Volledig legaal — Nederland was het eerste land dat het legaliseerde (2001)',
          'Legaal in bepaalde gemeenten',
        ],
      },
      correctIndex: 2,
      explanation: {
        en: 'The Netherlands was the first country in the world to legalize same-sex marriage in 2001. It is fully equal to opposite-sex marriage under Dutch law.',
        nl: 'Nederland was het eerste land ter wereld dat het huwelijk voor personen van hetzelfde geslacht legaliseerde in 2001. Het is volledig gelijk aan een huwelijk tussen man en vrouw onder de Nederlandse wet.',
      },
    },
  ],
};

// ============================================================================
// TOPIC 6 — Rules, Rights & Responsibilities
// ============================================================================
const RIGHTS: KNMTopic = {
  id: 'rights',
  icon: 'shield-checkmark-outline',
  title: { en: 'Rules, Rights & Responsibilities', nl: 'Regels, Rechten en Plichten' },
  description: {
    en: 'Laws, police, ID requirements, freedom, and equality.',
    nl: 'Wetten, politie, ID-plicht, vrijheid en gelijkheid.',
  },
  color: '#ef4444',
  explanation: {
    en: `Everyone in the Netherlands has rights and duties. The Dutch constitution (Grondwet) guarantees fundamental rights: freedom of speech, freedom of religion, and equality before the law (Article 1).

You are required to carry identification (legitimatieplicht): anyone over 14 must be able to show a valid ID when asked by police or other authorities. Not having ID can result in a fine.

The police (politie) maintain public safety and enforce the law. Everyone must follow the same rules regardless of background. Discrimination based on religion, race, gender, or sexual orientation is illegal.`,
    nl: `Iedereen in Nederland heeft rechten en plichten. De Grondwet garandeert grondrechten: vrijheid van meningsuiting, vrijheid van godsdienst en gelijkheid voor de wet (Artikel 1).

Je bent verplicht je te kunnen legitimeren (legitimatieplicht): iedereen boven de 14 jaar moet een geldig identiteitsbewijs kunnen tonen als de politie of andere autoriteiten daarom vragen. Geen ID bij je hebben kan resulteren in een boete.

De politie handhaaft de openbare veiligheid en de wet. Iedereen moet dezelfde regels volgen, ongeacht achtergrond. Discriminatie op basis van religie, ras, geslacht of seksuele geaardheid is illegaal.`,
  },
  keyPoints: [
    {
      en: 'Article 1 of the Dutch constitution guarantees equality and prohibits discrimination.',
      nl: 'Artikel 1 van de Grondwet garandeert gelijkheid en verbiedt discriminatie.',
    },
    {
      en: 'Everyone over 14 must carry valid identification (legitimatieplicht).',
      nl: 'Iedereen boven de 14 jaar moet een geldig identiteitsbewijs bij zich dragen (legitimatieplicht).',
    },
    {
      en: 'Freedom of speech and freedom of religion are guaranteed constitutional rights.',
      nl: 'Vrijheid van meningsuiting en vrijheid van godsdienst zijn gegarandeerde grondrechten.',
    },
    {
      en: 'All residents — regardless of nationality — must follow Dutch law.',
      nl: 'Alle inwoners — ongeacht nationaliteit — moeten de Nederlandse wet naleven.',
    },
    {
      en: 'Discrimination is illegal — report it to the police or anti-discrimination bureau.',
      nl: 'Discriminatie is illegaal — meld het bij de politie of het antidiscriminatiebureau.',
    },
  ],
  examples: [
    {
      en: 'A police officer asked Karim for his ID on the street. He showed his residence permit.',
      nl: 'Een politieagent vroeg Karim om zijn ID op straat. Hij toonde zijn verblijfsvergunning.',
    },
    {
      en: 'Aisha complained about discrimination at work to the anti-discrimination bureau.',
      nl: 'Aisha klaagde over discriminatie op het werk bij het antidiscriminatiebureau.',
    },
    {
      en: 'Everyone is allowed to practise their religion freely in the Netherlands.',
      nl: 'Iedereen mag zijn religie vrij beoefenen in Nederland.',
    },
  ],
  quizQuestions: [
    {
      id: 'rights-q1',
      question: {
        en: 'What does Article 1 of the Dutch Constitution state?',
        nl: 'Wat bepaalt Artikel 1 van de Nederlandse Grondwet?',
      },
      options: {
        en: [
          'Everyone has the right to own property',
          'All people in the Netherlands shall be treated equally and discrimination is prohibited',
          'Only Dutch citizens have rights in the Netherlands',
          'The King is the highest authority in the Netherlands',
        ],
        nl: [
          'Iedereen heeft het recht eigendom te bezitten',
          'Allen die zich in Nederland bevinden, worden gelijk behandeld en discriminatie is verboden',
          'Alleen Nederlandse staatsburgers hebben rechten in Nederland',
          'De Koning is de hoogste autoriteit in Nederland',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'Article 1 of the Dutch Grondwet states that all people in the Netherlands shall be treated equally in equal circumstances. Discrimination on the grounds of religion, belief, political opinion, race, sex, or any other grounds is not permitted.',
        nl: 'Artikel 1 van de Grondwet bepaalt dat allen die zich in Nederland bevinden, in gelijke gevallen gelijk worden behandeld. Discriminatie wegens godsdienst, levensovertuiging, politieke gezindheid, ras, geslacht of op welke grond dan ook, is niet toegestaan.',
      },
    },
    {
      id: 'rights-q2',
      question: {
        en: 'From what age are people required to carry identification in the Netherlands?',
        nl: 'Vanaf welke leeftijd zijn mensen verplicht een identiteitsbewijs bij zich te dragen in Nederland?',
      },
      options: {
        en: ['12 years old', '14 years old', '16 years old', '18 years old'],
        nl: ['12 jaar', '14 jaar', '16 jaar', '18 jaar'],
      },
      correctIndex: 1,
      explanation: {
        en: 'In the Netherlands, everyone aged 14 and over must be able to show a valid ID when asked by authorities. Acceptable IDs include a passport, Dutch ID card, or residence permit.',
        nl: 'In Nederland moet iedereen van 14 jaar en ouder een geldig identiteitsbewijs kunnen tonen als de autoriteiten daarom vragen. Geldige ID-documenten zijn onder andere een paspoort, Nederlandse identiteitskaart of verblijfsvergunning.',
      },
    },
    {
      id: 'rights-q3',
      question: {
        en: 'Freedom of religion in the Netherlands means:',
        nl: 'Vrijheid van godsdienst in Nederland betekent:',
      },
      options: {
        en: [
          'Only Christianity is legally protected',
          'Religion is banned in public spaces',
          'Everyone is free to practise or not practise any religion',
          'Religious rules override national law',
        ],
        nl: [
          'Alleen het christendom is wettelijk beschermd',
          'Religie is verboden in openbare ruimten',
          'Iedereen is vrij om elke religie wel of niet te beoefenen',
          'Religieuze regels staan boven de nationale wet',
        ],
      },
      correctIndex: 2,
      explanation: {
        en: 'Freedom of religion is a constitutional right in the Netherlands. Everyone is free to follow any religion or no religion. However, religious practices must remain within the boundaries of Dutch law.',
        nl: 'Vrijheid van godsdienst is een grondwettelijk recht in Nederland. Iedereen is vrij om een religie te belijden of dat niet te doen. Religieuze praktijken moeten echter binnen de grenzen van de Nederlandse wet blijven.',
      },
    },
    {
      id: 'rights-q4',
      question: {
        en: 'If you experience discrimination in the Netherlands, you can:',
        nl: 'Als je discriminatie ervaart in Nederland, kun je:',
      },
      options: {
        en: [
          'Do nothing — discrimination is not illegal',
          'Only report it if you have witnesses',
          'Report it to the police or anti-discrimination bureau (antidiscriminatiebureau)',
          'Leave the country as there is no protection',
        ],
        nl: [
          'Niets doen — discriminatie is niet illegaal',
          'Het alleen melden als je getuigen hebt',
          'Het melden bij de politie of het antidiscriminatiebureau',
          'Het land verlaten want er is geen bescherming',
        ],
      },
      correctIndex: 2,
      explanation: {
        en: 'Discrimination is illegal in the Netherlands. You can report it to the police or to a local antidiscriminatiebureau (anti-discrimination bureau). There are also national organizations like College voor de Rechten van de Mens.',
        nl: 'Discriminatie is illegaal in Nederland. Je kunt het melden bij de politie of bij een lokaal antidiscriminatiebureau. Er zijn ook nationale organisaties zoals het College voor de Rechten van de Mens.',
      },
    },
    {
      id: 'rights-q5',
      question: {
        en: 'Which of the following is a duty (plicht) of everyone living in the Netherlands?',
        nl: 'Wat is een plicht van iedereen die in Nederland woont?',
      },
      options: {
        en: [
          'Voting in every election',
          'Speaking Dutch at all times in public',
          'Following Dutch law regardless of your cultural or religious background',
          'Joining a political party',
        ],
        nl: [
          'Stemmen bij elke verkiezing',
          'Altijd Nederlands spreken in het openbaar',
          'De Nederlandse wet naleven, ongeacht je culturele of religieuze achtergrond',
          'Lid worden van een politieke partij',
        ],
      },
      correctIndex: 2,
      explanation: {
        en: 'Everyone living in the Netherlands — regardless of nationality, religion, or culture — is obligated to follow Dutch law. Cultural or religious customs cannot override national law.',
        nl: 'Iedereen die in Nederland woont — ongeacht nationaliteit, religie of cultuur — is verplicht de Nederlandse wet na te leven. Culturele of religieuze gewoonten kunnen de nationale wet niet opzijzetten.',
      },
    },
  ],
};

// ============================================================================
// TOPIC 7 — Government & Society
// ============================================================================
const GOVERNMENT: KNMTopic = {
  id: 'government',
  icon: 'business-outline',
  title: { en: 'Government & Society', nl: 'Overheid en Samenleving' },
  description: {
    en: 'How government works, voting, DigiD, and public services.',
    nl: 'Hoe de overheid werkt, stemmen, DigiD en publieke diensten.',
  },
  color: '#6366f1',
  explanation: {
    en: `The Netherlands is a constitutional monarchy with a parliamentary democracy. The King (Koning Willem-Alexander) has a mainly ceremonial role. The government (kabinet) is led by the Prime Minister (Minister-President). The king and the ministers together form the regering (government). Every year on Prinsjesdag — the third Tuesday of September — the king reads the troonrede (speech from the throne) in the Ridderzaal in Den Haag and rides through the city in the gouden koets (golden carriage).

The parliament (parlement) is called the Staten-Generaal and has two chambers: the Tweede Kamer (150 seats, elected every 4 years by all Dutch citizens 18+) and the Eerste Kamer (75 seats). The Tweede Kamer debates and votes on new laws. After elections, parties form a coalition and write a regeerakkoord (coalition agreement). Parties not in government form the oppositie.

Separation of powers (scheiding van machten): (1) Uitvoerende macht — the king, minister-president and ministers execute decisions. (2) Wetgevende macht — the parlement makes laws. (3) Rechterlijke macht — rechters (judges) decide what the law means. These three powers work independently.

Major political parties: VVD (liberal, right), PvdA (social-democratic, left), SP (socialist), CDA (Christian-democratic), D66 (progressive-democratic), GroenLinks (environmental, left), PVV (far-right), ChristenUnie and SGP (Christian). Each party has a lijsttrekker — the leading candidate at elections.

Government is organised at three levels: national (Rijksoverheid), provincial (provincie — 12 provinces, each with Provinciale Staten), and local (gemeente — led by a burgemeester and gemeenteraad). DigiD is your digital identity to access government websites, tax returns, and healthcare services online.`,
    nl: `Nederland is een constitutionele monarchie met een parlementaire democratie. De Koning (Willem-Alexander) heeft voornamelijk een ceremoniële rol. Het kabinet wordt geleid door de Minister-President. De koning en de ministers samen zijn de regering. Elk jaar op Prinsjesdag — de derde dinsdag van september — leest de koning de troonrede voor in de Ridderzaal in Den Haag en rijdt hij door de stad in de gouden koets.

Het parlement heet de Staten-Generaal en heeft twee kamers: de Tweede Kamer (150 zetels, elke vier jaar gekozen door alle Nederlanders van 18+) en de Eerste Kamer (75 leden). De Tweede Kamer debatteert over nieuwe wetten en stemt erover. Na verkiezingen vormen partijen een coalitie en schrijven een regeerakkoord. Partijen die niet in de regering zitten, vormen de oppositie.

Scheiding van machten: (1) Uitvoerende macht — de koning, minister-president en ministers voeren besluiten uit. (2) Wetgevende macht — het parlement maakt wetten. (3) Rechterlijke macht — rechters beslissen wat de wet betekent. Deze drie machten werken onafhankelijk van elkaar.

Grote politieke partijen: VVD (liberaal, rechts), PvdA (sociaal-democratisch, links), SP (socialistisch), CDA (christendemocratisch), D66 (progressief-democratisch), GroenLinks (milieu, links), PVV (rechts), ChristenUnie en SGP (christelijk). Elke partij heeft een lijsttrekker — de belangrijkste kandidaat bij verkiezingen.

De overheid is georganiseerd op drie niveaus: nationaal (Rijksoverheid), provinciaal (provincie — 12 provincies, elk met Provinciale Staten) en lokaal (gemeente — geleid door een burgemeester en gemeenteraad). DigiD is je digitale identiteit voor overheidsdiensten online.`,
  },
  keyPoints: [
    {
      en: 'The Netherlands is a constitutional monarchy — the King has a ceremonial role.',
      nl: 'Nederland is een constitutionele monarchie — de Koning heeft een ceremoniële rol.',
    },
    {
      en: 'DigiD is the digital identity system used for government services online.',
      nl: 'DigiD is het digitale identiteitssysteem dat gebruikt wordt voor online overheidsdiensten.',
    },
    {
      en: 'The gemeente handles local government services: registration, permits, and more.',
      nl: 'De gemeente regelt lokale overheidsdiensten: inschrijving, vergunningen en meer.',
    },
    {
      en: 'Voting is not compulsory in the Netherlands but is an important civic responsibility.',
      nl: 'Stemmen is niet verplicht in Nederland, maar is een belangrijke burgerplicht.',
    },
    {
      en: 'The Tweede Kamer is the lower house of parliament with 150 elected members.',
      nl: 'De Tweede Kamer is de volksvertegenwoordiging met 150 gekozen leden.',
    },
  ],
  examples: [
    {
      en: 'Oma uses her DigiD to view her pension information on the SVB website.',
      nl: 'Oma gebruikt haar DigiD om haar pensioenoverzicht op de SVB-website te bekijken.',
    },
    {
      en: 'To get a new passport, you go to the gemeente and make an appointment.',
      nl: 'Voor een nieuw paspoort ga je naar de gemeente en maak je een afspraak.',
    },
    {
      en: 'After 5 years of legal residence, permanent residents can vote in local elections.',
      nl: 'Na 5 jaar legaal verblijf mogen permanente inwoners stemmen bij gemeenteraadsverkiezingen.',
    },
  ],
  quizQuestions: [
    {
      id: 'gov-q1',
      question: {
        en: 'What is DigiD?',
        nl: 'Wat is DigiD?',
      },
      options: {
        en: [
          'A digital Dutch language test',
          'The Netherlands\' digital identity system for accessing government services online',
          'A mobile payment app',
          'A government ID card replacement',
        ],
        nl: [
          'Een digitale Nederlandse taaltest',
          'Het digitale identiteitssysteem van Nederland voor toegang tot overheidsdiensten online',
          'Een mobiele betaalapp',
          'Een vervanging voor de identiteitskaart',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'DigiD (Digitale Identiteit) is the digital identity system that allows residents to access Dutch government websites, file tax returns, view health information, and more.',
        nl: 'DigiD (Digitale Identiteit) is het digitale identiteitssysteem waarmee inwoners toegang kunnen krijgen tot Nederlandse overheidswebsites, belastingaangiften kunnen indienen, gezondheidsinformatie kunnen bekijken en meer.',
      },
    },
    {
      id: 'gov-q2',
      question: {
        en: 'What is the role of the Dutch King (Koning)?',
        nl: 'Wat is de rol van de Nederlandse Koning?',
      },
      options: {
        en: [
          'He is the head of government and makes all major decisions',
          'He has a ceremonial and symbolic role — the elected government leads the country',
          'He leads the army and police forces',
          'He appoints all government ministers directly',
        ],
        nl: [
          'Hij is het hoofd van de regering en neemt alle belangrijke beslissingen',
          'Hij heeft een ceremoniële en symbolische rol — de gekozen regering leidt het land',
          'Hij leidt het leger en de politie',
          'Hij benoemt alle ministers rechtstreeks',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'The Netherlands is a constitutional monarchy. The King has a ceremonial, symbolic role. The actual governing power rests with the elected parliament (Tweede Kamer) and the cabinet led by the Prime Minister.',
        nl: 'Nederland is een constitutionele monarchie. De Koning heeft een ceremoniële, symbolische rol. De feitelijke regeringsmacht berust bij het gekozen parlement (Tweede Kamer) en het kabinet onder leiding van de Minister-President.',
      },
    },
    {
      id: 'gov-q3',
      question: {
        en: 'If you need to renew your Dutch residency registration, where do you go?',
        nl: 'Als je je Nederlandse verblijfsregistratie wilt vernieuwen, waar ga je dan naartoe?',
      },
      options: {
        en: ['The national government (Rijksoverheid)', 'The gemeente (municipality)', 'The UWV office', 'The nearest hospital'],
        nl: ['De nationale overheid (Rijksoverheid)', 'De gemeente', 'Het UWV-kantoor', 'Het dichtstbijzijnde ziekenhuis'],
      },
      correctIndex: 1,
      explanation: {
        en: 'The gemeente (municipality) handles local government services including residency registration, identity documents, permits, and social welfare. It is the first point of contact for most administrative matters.',
        nl: 'De gemeente regelt lokale overheidsdiensten, waaronder verblijfsregistratie, identiteitsdocumenten, vergunningen en sociale zaken. Het is het eerste aanspreekpunt voor de meeste administratieve zaken.',
      },
    },
    {
      id: 'gov-q4',
      question: {
        en: 'Is voting (stemmen) compulsory in the Netherlands?',
        nl: 'Is stemmen verplicht in Nederland?',
      },
      options: {
        en: [
          'Yes, everyone must vote or pay a fine',
          'No, voting is a right but not a duty',
          'Only Dutch citizens must vote; residents are exempt',
          'Yes, but only in national elections',
        ],
        nl: [
          'Ja, iedereen moet stemmen of een boete betalen',
          'Nee, stemmen is een recht maar geen plicht',
          'Alleen Nederlandse staatsburgers moeten stemmen; inwoners zijn vrijgesteld',
          'Ja, maar alleen bij nationale verkiezingen',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'Voting is not compulsory in the Netherlands. It is a democratic right, not a legal obligation. However, civic participation is encouraged. Compulsory voting was abolished in the Netherlands in 1970.',
        nl: 'Stemmen is niet verplicht in Nederland. Het is een democratisch recht, geen wettelijke verplichting. Deelname aan de samenleving wordt echter wel aangemoedigd. De stemplicht werd in 1970 afgeschaft.',
      },
    },
    {
      id: 'gov-q5',
      question: {
        en: 'How many levels of government are there in the Netherlands?',
        nl: 'Hoeveel niveaus van bestuur zijn er in Nederland?',
      },
      options: {
        en: ['1 (national only)', '2 (national and local)', '3 (national, provincial, and local/gemeente)', '4 (national, regional, provincial, and local)'],
        nl: ['1 (alleen nationaal)', '2 (nationaal en lokaal)', '3 (nationaal, provinciaal en lokaal/gemeente)', '4 (nationaal, regionaal, provinciaal en lokaal)'],
      },
      correctIndex: 2,
      explanation: {
        en: 'The Netherlands has three levels of government: Rijksoverheid (national), Provincie (provincial — 12 provinces), and Gemeente (local — 342 municipalities). Each level has its own responsibilities.',
        nl: 'Nederland kent drie bestuursniveaus: Rijksoverheid (nationaal), Provincie (provinciaal — 12 provincies) en Gemeente (lokaal — 342 gemeenten). Elk niveau heeft zijn eigen verantwoordelijkheden.',
      },
    },
  ],
};

// ============================================================================
// TOPIC 8 — Transport & Mobility
// ============================================================================
const TRANSPORT: KNMTopic = {
  id: 'transport',
  icon: 'bicycle-outline',
  title: { en: 'Transport & Mobility', nl: 'Vervoer en Mobiliteit' },
  description: {
    en: 'Public transport, cycling culture, and traffic rules.',
    nl: 'Openbaar vervoer, fietsencultuur en verkeersregels.',
  },
  color: '#0ea5e9',
  explanation: {
    en: `The Netherlands has an excellent public transport system including trains (NS), buses, trams, and metro. You pay using the OV-chipkaart — a smart card you check in and out with at every journey.

Cycling is central to Dutch culture. The Netherlands has over 35,000 km of dedicated bike lanes. Cyclists have priority in many situations. You must follow traffic rules on a bike: use lights at night, do not use your phone while cycling, and respect traffic lights.

For driving, a Dutch or EU driving licence is required. All traffic rules apply equally to cyclists, pedestrians, and drivers. Parking rules are strictly enforced.`,
    nl: `Nederland heeft een uitstekend openbaar vervoerssysteem, waaronder treinen (NS), bussen, trams en metro. Je betaalt met de OV-chipkaart — een smartcard waarmee je bij elke reis moet in- en uitchecken.

Fietsen is essentieel in de Nederlandse cultuur. Nederland heeft meer dan 35.000 km aan speciale fietspaden. Fietsers hebben in veel situaties voorrang. Je moet verkeersregels op de fiets naleven: gebruik verlichting 's nachts, gebruik je telefoon niet tijdens het fietsen en respecteer verkeerslichten.

Voor rijden is een Nederlands of EU-rijbewijs vereist. Alle verkeersregels gelden gelijkelijk voor fietsers, voetgangers en automobilisten. Parkeerregels worden strikt gehandhaafd.`,
  },
  keyPoints: [
    {
      en: 'The OV-chipkaart is the payment card for all public transport in the Netherlands.',
      nl: 'De OV-chipkaart is de betaalkaart voor al het openbaar vervoer in Nederland.',
    },
    {
      en: 'Always check in AND check out when using public transport — or you will be charged the maximum fare.',
      nl: 'Altijd in- én uitchecken bij openbaar vervoer — anders wordt de maximumtariefkosten in rekening gebracht.',
    },
    {
      en: 'Cycling is very important culturally — there are more bikes than people in the Netherlands.',
      nl: 'Fietsen is cultureel erg belangrijk — er zijn meer fietsen dan mensen in Nederland.',
    },
    {
      en: 'Cyclists must use lights at night and follow all traffic rules.',
      nl: 'Fietsers moeten \'s nachts verlichting gebruiken en alle verkeersregels naleven.',
    },
    {
      en: 'Using your phone while cycling is illegal and can result in a fine.',
      nl: 'Je telefoon gebruiken tijdens het fietsen is illegaal en kan resulteren in een boete.',
    },
  ],
  examples: [
    {
      en: 'Tomás always checks in with his OV-chipkaart at the train gate and checks out when he arrives.',
      nl: 'Tomás checkt altijd in met zijn OV-chipkaart bij de treindoorgang en checkt uit als hij aankomt.',
    },
    {
      en: 'Cycling to work is very common — even in rain and wind.',
      nl: 'Met de fiets naar het werk gaan is heel gewoon — ook in regen en wind.',
    },
    {
      en: 'Sophie got a fine because she forgot to check out at the end of her bus ride.',
      nl: 'Sophie kreeg een boete omdat ze vergat uit te checken aan het einde van haar busrit.',
    },
  ],
  quizQuestions: [
    {
      id: 'transport-q1',
      question: {
        en: 'What is the OV-chipkaart used for?',
        nl: 'Waarvoor wordt de OV-chipkaart gebruikt?',
      },
      options: {
        en: [
          'Only for trains in the Netherlands',
          'Paying for public transport including trains, buses, trams, and metro',
          'A loyalty card for Dutch supermarkets',
          'A digital identity card for foreigners',
        ],
        nl: [
          'Alleen voor treinen in Nederland',
          'Betalen voor openbaar vervoer, inclusief treinen, bussen, trams en metro',
          'Een loyaliteitskaart voor Nederlandse supermarkten',
          'Een digitale identiteitskaart voor buitenlanders',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'The OV-chipkaart is the national payment card for all public transport (Openbaar Vervoer) in the Netherlands including trains (NS), buses, trams, and metros. You must check in and check out on every journey.',
        nl: 'De OV-chipkaart is de nationale betaalkaart voor al het openbaar vervoer (OV) in Nederland, waaronder treinen (NS), bussen, trams en metro\'s. Je moet bij elke reis in- en uitchecken.',
      },
    },
    {
      id: 'transport-q2',
      question: {
        en: 'You are cycling at night. What must you have on your bike?',
        nl: 'Je fietst \'s nachts. Wat moet je op je fiets hebben?',
      },
      options: {
        en: [
          'Nothing extra is needed',
          'A reflective vest',
          'Front (white) and rear (red) lights',
          'A helmet',
        ],
        nl: [
          'Niets extra is nodig',
          'Een reflecterend vest',
          'Voerlicht (wit) en achterlicht (rood)',
          'Een helm',
        ],
      },
      correctIndex: 2,
      explanation: {
        en: 'Dutch law requires cyclists to have a white front light and red rear light when cycling at night or in poor visibility. Not having lights is illegal and can result in a fine.',
        nl: 'De Nederlandse wet verplicht fietsers een wit voorlicht en rood achterlicht te hebben bij nachtelijk fietsen of bij slecht zicht. Geen lichten hebben is illegaal en kan resulteren in een boete.',
      },
    },
    {
      id: 'transport-q3',
      question: {
        en: 'You forgot to check out after your train ride. What happens?',
        nl: 'Je bent vergeten uit te checken na je treinrit. Wat gebeurt er?',
      },
      options: {
        en: [
          'Nothing — checking out is optional',
          'You are charged the maximum possible fare for that journey',
          'Your OV-chipkaart is permanently blocked',
          'You are automatically refunded at the end of the month',
        ],
        nl: [
          'Niets — uitchecken is optioneel',
          'Je wordt het maximale tarief voor die reis in rekening gebracht',
          'Je OV-chipkaart wordt permanent geblokkeerd',
          'Je ontvangt aan het einde van de maand automatisch een terugbetaling',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'If you forget to check out, you are charged the maximum fare for that carrier. Always check out when leaving the vehicle or station.',
        nl: 'Als je vergeet uit te checken, wordt het maximumtarief voor die vervoerder in rekening gebracht. Altijd uitchecken als je het voertuig of station verlaat.',
      },
    },
    {
      id: 'transport-q4',
      question: {
        en: 'What is culturally special about cycling (fietsen) in the Netherlands?',
        nl: 'Wat is cultureel bijzonder aan fietsen in Nederland?',
      },
      options: {
        en: [
          'Only children cycle — adults use cars',
          'Cycling is just for sport, not daily transport',
          'Cycling is a core part of daily life for people of all ages and backgrounds',
          'Cycling is only popular in rural areas',
        ],
        nl: [
          'Alleen kinderen fietsen — volwassenen gebruiken auto\'s',
          'Fietsen is alleen voor sport, niet voor dagelijks vervoer',
          'Fietsen is een essentieel onderdeel van het dagelijks leven voor mensen van alle leeftijden',
          'Fietsen is alleen populair op het platteland',
        ],
      },
      correctIndex: 2,
      explanation: {
        en: 'Cycling is deeply embedded in Dutch culture. People of all ages, incomes, and backgrounds cycle daily for work, school, and shopping. The Netherlands has more bikes than people and an extensive network of bike lanes.',
        nl: 'Fietsen is diep geworteld in de Nederlandse cultuur. Mensen van alle leeftijden, inkomens en achtergronden fietsen dagelijks naar werk, school en winkels. Nederland heeft meer fietsen dan mensen en een uitgebreid netwerk van fietspaden.',
      },
    },
    {
      id: 'transport-q5',
      question: {
        en: 'Using your mobile phone while cycling in the Netherlands is:',
        nl: 'Je mobiele telefoon gebruiken tijdens het fietsen in Nederland is:',
      },
      options: {
        en: [
          'Legal as long as you use a hands-free device',
          'Only illegal on busy roads',
          'Illegal and can result in a fine',
          'Legal — there are no phone rules for cyclists',
        ],
        nl: [
          'Legaal zolang je een handsfree apparaat gebruikt',
          'Alleen illegaal op drukke wegen',
          'Illegaal en kan resulteren in een boete',
          'Legaal — er zijn geen telefoonregels voor fietsers',
        ],
      },
      correctIndex: 2,
      explanation: {
        en: 'Using a mobile phone while cycling is illegal in the Netherlands and can result in a fine. This applies even to briefly checking your phone. Use a bike phone holder or stop safely to use your phone.',
        nl: 'Je mobiele telefoon gebruiken tijdens het fietsen is illegaal in Nederland en kan resulteren in een boete. Dit geldt ook voor even je telefoon checken. Gebruik een fietstelefoonhouder of stop veilig om je telefoon te gebruiken.',
      },
    },
  ],
};

// ============================================================================
// TOPIC 9 — Daily Life & Practical Matters
// ============================================================================
const DAILY: KNMTopic = {
  id: 'daily',
  icon: 'basket-outline',
  title: { en: 'Daily Life & Practical Matters', nl: 'Dagelijks Leven en Praktische Zaken' },
  description: {
    en: 'Shopping, banking, insurance, and communication.',
    nl: 'Winkelen, bankieren, verzekering en communicatie.',
  },
  color: '#f97316',
  explanation: {
    en: `Dutch shops typically open between 9:00 and 18:00 on weekdays, with shorter hours on Sundays. Supermarkets often have longer hours. Many shops close on public holidays.

Banking is important: you need a Dutch bank account (bankrekening) to receive salary, pay rent, and manage finances. Most Dutch people use internet banking and the iDEAL payment system for online transactions.

Insurance (verzekering) beyond health insurance includes home contents insurance (inboedelverzekering), liability insurance (aansprakelijkheidsverzekering), and car insurance. Dutch post is handled by PostNL. Mobile phones and SIM cards are widely available.`,
    nl: `Nederlandse winkels zijn doorgaans open tussen 9:00 en 18:00 uur op werkdagen, met kortere openingstijden op zondag. Supermarkten hebben vaak langere openingstijden. Veel winkels zijn gesloten op feestdagen.

Bankieren is belangrijk: je hebt een Nederlandse bankrekening nodig om salaris te ontvangen, huur te betalen en financiën te beheren. De meeste Nederlanders gebruiken internetbankieren en het iDEAL-betaalsysteem voor online transacties.

Verzekeringen naast zorgverzekering zijn onder andere inboedelverzekering, aansprakelijkheidsverzekering en autoverzekering. Nederlandse post wordt verzorgd door PostNL. Mobiele telefoons en simkaarten zijn overal verkrijgbaar.`,
  },
  keyPoints: [
    {
      en: 'You need a Dutch bank account to receive salary and pay regular bills.',
      nl: 'Je hebt een Nederlandse bankrekening nodig om salaris te ontvangen en vaste rekeningen te betalen.',
    },
    {
      en: 'iDEAL is the main online payment method in the Netherlands.',
      nl: 'iDEAL is de voornaamste online betaalmethode in Nederland.',
    },
    {
      en: 'Shop opening hours are generally 09:00–18:00, with limited Sunday trading.',
      nl: 'Winkels zijn meestal open van 09:00 tot 18:00 uur, met beperkte zondaghandel.',
    },
    {
      en: 'Most Dutch people buy insurance for home contents and personal liability.',
      nl: 'De meeste Nederlanders kopen een inboedelverzekering en aansprakelijkheidsverzekering.',
    },
    {
      en: 'Public holidays (feestdagen) often affect shop opening hours.',
      nl: 'Feestdagen beïnvloeden vaak de openingstijden van winkels.',
    },
  ],
  examples: [
    {
      en: 'Priya opened a bank account at a Dutch bank to receive her first salary.',
      nl: 'Priya opende een bankrekening bij een Nederlandse bank om haar eerste salaris te ontvangen.',
    },
    {
      en: 'When the supermarket was closed on King\'s Day, David had to plan his shopping in advance.',
      nl: 'Toen de supermarkt gesloten was op Koningsdag, moest David zijn boodschappen van tevoren plannen.',
    },
    {
      en: 'Omar paid for his online order using iDEAL via his banking app.',
      nl: 'Omar betaalde voor zijn online bestelling via iDEAL in zijn bankier-app.',
    },
  ],
  quizQuestions: [
    {
      id: 'daily-q1',
      question: {
        en: 'What is iDEAL in the Netherlands?',
        nl: 'Wat is iDEAL in Nederland?',
      },
      options: {
        en: [
          'A Dutch loyalty rewards programme',
          'An online banking payment system used for online purchases',
          'A health insurance type',
          'A government digital identity system',
        ],
        nl: [
          'Een Nederlands loyaliteitsprogramma',
          'Een online betaalsysteem dat wordt gebruikt voor online aankopen',
          'Een type zorgverzekering',
          'Een digitaal identiteitssysteem van de overheid',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'iDEAL is the most widely used online payment method in the Netherlands. It connects directly to your Dutch bank account and is used for online shopping, bill payments, and more.',
        nl: 'iDEAL is de meest gebruikte online betaalmethode in Nederland. Het is rechtstreeks gekoppeld aan je Nederlandse bankrekening en wordt gebruikt voor online winkelen, rekeningen betalen en meer.',
      },
    },
    {
      id: 'daily-q2',
      question: {
        en: 'Why do you need a Dutch bank account?',
        nl: 'Waarom heb je een Nederlandse bankrekening nodig?',
      },
      options: {
        en: [
          'It is optional — cash payments are preferred',
          'To receive salary, pay rent, and access Dutch financial services',
          'Only required if you earn more than €30,000 per year',
          'Only for Dutch citizens, not residents',
        ],
        nl: [
          'Het is optioneel — contante betalingen worden de voorkeur gegeven',
          'Om salaris te ontvangen, huur te betalen en toegang te krijgen tot Nederlandse financiële diensten',
          'Alleen vereist als je meer dan €30.000 per jaar verdient',
          'Alleen voor Nederlandse staatsburgers, niet voor inwoners',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'A Dutch bank account is essential for daily life — salaries are paid by bank transfer, rent is paid monthly by direct debit, and most purchases are made electronically.',
        nl: 'Een Nederlandse bankrekening is essentieel voor het dagelijks leven — salarissen worden betaald via overboeking, huur wordt maandelijks automatisch afgeschreven, en de meeste aankopen worden elektronisch gedaan.',
      },
    },
    {
      id: 'daily-q3',
      question: {
        en: 'On which day are most Dutch shops typically CLOSED or have reduced hours?',
        nl: 'Op welke dag zijn de meeste Nederlandse winkels doorgaans GESLOTEN of hebben ze kortere openingstijden?',
      },
      options: {
        en: ['Monday', 'Saturday', 'Sunday', 'Wednesday afternoon'],
        nl: ['Maandag', 'Zaterdag', 'Zondag', 'Woensdagmiddag'],
      },
      correctIndex: 2,
      explanation: {
        en: 'Traditionally, many Dutch shops are closed or have shorter hours on Sunday. While this is changing in larger cities, Sunday trading hours are still more limited than weekdays.',
        nl: 'Traditioneel zijn veel Nederlandse winkels op zondag gesloten of hebben ze kortere openingstijden. Hoewel dit verandert in grotere steden, zijn de openingstijden op zondag nog steeds beperkter dan op werkdagen.',
      },
    },
    {
      id: 'daily-q4',
      question: {
        en: 'What is "aansprakelijkheidsverzekering"?',
        nl: 'Wat is aansprakelijkheidsverzekering?',
      },
      options: {
        en: [
          'Home contents insurance',
          'Car insurance',
          'Personal liability insurance covering damage you accidentally cause to others',
          'Life insurance',
        ],
        nl: [
          'Inboedelverzekering',
          'Autoverzekering',
          'Particuliere aansprakelijkheidsverzekering die schade dekt die je per ongeluk veroorzaakt',
          'Levensverzekering',
        ],
      },
      correctIndex: 2,
      explanation: {
        en: 'Aansprakelijkheidsverzekering (WA or AVP) is personal liability insurance. It covers damages you accidentally cause to other people or their property. Most Dutch people have this insurance.',
        nl: 'Aansprakelijkheidsverzekering (WA of AVP) is een particuliere aansprakelijkheidsverzekering. Het dekt schade die je per ongeluk veroorzaakt aan andere mensen of hun eigendommen. De meeste Nederlanders hebben deze verzekering.',
      },
    },
    {
      id: 'daily-q5',
      question: {
        en: 'Which company handles most postal deliveries in the Netherlands?',
        nl: 'Welk bedrijf verwerkt de meeste postbezorgingen in Nederland?',
      },
      options: {
        en: ['DHL', 'UPS', 'PostNL', 'FedEx'],
        nl: ['DHL', 'UPS', 'PostNL', 'FedEx'],
      },
      correctIndex: 2,
      explanation: {
        en: 'PostNL is the main postal service provider in the Netherlands, handling letters and packages. It was formerly known as PTT Post and is a national service.',
        nl: 'PostNL is de belangrijkste postdienstverlener in Nederland en verwerkt brieven en pakketten. Het was vroeger bekend als PTT Post en is een nationale dienst.',
      },
    },
  ],
};

// ============================================================================
// TOPIC 10 — Dutch Culture & Norms (VERY IMPORTANT)
// ============================================================================
const CULTURE: KNMTopic = {
  id: 'culture',
  icon: 'earth-outline',
  title: { en: 'Dutch Culture & Norms', nl: 'Nederlandse Cultuur en Normen' },
  description: {
    en: 'Communication style, planning, equality, and social norms.',
    nl: 'Communicatiestijl, planning, gelijkheid en sociale normen.',
  },
  color: '#f43f5e',
  explanation: {
    en: `Dutch culture is known for its directness (directheid) — people say what they mean and expect the same in return. This is not considered rude; it is a sign of respect and honesty. Giving indirect or vague answers can be confusing or even interpreted as dishonest.

Planning is central to Dutch life. You are expected to make appointments (afspraken) in advance — showing up unannounced, even at a friend's house, is generally not appreciated. Calendars are taken very seriously.

Equality (gelijkheid) is a core value: there is little tolerance for hierarchical behaviour. You are expected to treat everyone the same regardless of their status. Individual responsibility is highly valued — people are expected to manage their own affairs and not rely excessively on others.`,
    nl: `De Nederlandse cultuur staat bekend om directheid — mensen zeggen wat ze bedoelen en verwachten hetzelfde terug. Dit wordt niet als onbeleefd beschouwd; het is een teken van respect en eerlijkheid. Indirecte of vage antwoorden kunnen verwarrend zijn of zelfs als oneerlijk worden geïnterpreteerd.

Planning is centraal in het Nederlandse leven. Je wordt geacht van tevoren afspraken te maken — onaangekondigd langskomen, zelfs bij een vriend, wordt over het algemeen niet gewaardeerd. Agenda's worden heel serieus genomen.

Gelijkheid is een kernwaarde: er is weinig tolerantie voor hiërarchisch gedrag. Je wordt geacht iedereen gelijk te behandelen, ongeacht hun status. Individuele verantwoordelijkheid wordt hoog gewaardeerd — mensen worden geacht hun eigen zaken te regelen en niet overmatig op anderen te rekenen.`,
  },
  keyPoints: [
    {
      en: 'Dutch communication is direct — say what you mean, mean what you say.',
      nl: 'Nederlandse communicatie is direct — zeg wat je bedoelt, bedoel wat je zegt.',
    },
    {
      en: 'Always make an appointment (afspraak) before visiting someone — even friends.',
      nl: 'Maak altijd een afspraak voor je iemand bezoekt — ook vrienden.',
    },
    {
      en: 'Punctuality is very important — being late is seen as disrespectful.',
      nl: 'Stiptheid is erg belangrijk — te laat komen wordt gezien als respectloos.',
    },
    {
      en: 'Equality means you treat everyone the same — no special treatment based on status.',
      nl: 'Gelijkheid betekent dat je iedereen hetzelfde behandelt — geen speciale behandeling op basis van status.',
    },
    {
      en: 'Individual responsibility: manage your own affairs — do not wait for others to solve your problems.',
      nl: 'Individuele verantwoordelijkheid: regel je eigen zaken — wacht niet tot anderen je problemen oplossen.',
    },
    {
      en: '"Dutch treat" (ieder betaalt zijn eigen deel) — splitting bills equally is common.',
      nl: '"Ieder betaalt zijn eigen deel" — rekeningen gelijk splitsen is gebruikelijk.',
    },
  ],
  examples: [
    {
      en: 'When asked for her opinion, Nora said directly: "I think that plan has a problem with the budget."',
      nl: 'Toen haar om haar mening werd gevraagd, zei Nora direct: "Ik denk dat dat plan een budgetprobleem heeft."',
    },
    {
      en: 'David called ahead before visiting his Dutch colleague — dropping by unannounced felt rude.',
      nl: 'David belde van tevoren voordat hij zijn Nederlandse collega bezocht — onaangekondigd langskomen voelde onbeleefd.',
    },
    {
      en: 'At lunch, everyone at the table paid for their own meal — this is completely normal in the Netherlands.',
      nl: 'Bij de lunch betaalde iedereen aan tafel voor zijn eigen maaltijd — dit is volkomen normaal in Nederland.',
    },
  ],
  quizQuestions: [
    {
      id: 'culture-q1',
      question: {
        en: 'You want to visit a Dutch friend at their home. What is the correct approach?',
        nl: 'Je wilt een Nederlandse vriend thuis bezoeken. Wat is de juiste aanpak?',
      },
      options: {
        en: [
          'Just show up — friends do not need appointments',
          'Call just as you are approaching their house',
          'Plan the visit and make an appointment in advance',
          'Only visit if you bring a gift',
        ],
        nl: [
          'Gewoon langskomen — vrienden hoeven geen afspraken te maken',
          'Bel net als je hun huis nadert',
          'De visite plannen en van tevoren een afspraak maken',
          'Alleen bezoeken als je een cadeau meeneemt',
        ],
      },
      correctIndex: 2,
      explanation: {
        en: 'In Dutch culture, you always make an appointment before visiting someone — even close friends or family. Showing up unannounced (onaangekondigd) is generally considered impolite and inconsiderate.',
        nl: 'In de Nederlandse cultuur maak je altijd van tevoren een afspraak voordat je iemand bezoekt — ook goede vrienden of familie. Onaangekondigd langskomen wordt over het algemeen als onbeleefd en onattent beschouwd.',
      },
    },
    {
      id: 'culture-q2',
      question: {
        en: 'A Dutch colleague gives you very direct critical feedback about your work. How should you interpret this?',
        nl: 'Een Nederlandse collega geeft je zeer directe kritische feedback over je werk. Hoe moet je dit interpreteren?',
      },
      options: {
        en: [
          'They are being rude and aggressive',
          'They do not like you personally',
          'They are being honest and respectful — directness is normal in Dutch culture',
          'You should respond with equally harsh criticism',
        ],
        nl: [
          'Ze zijn onbeleefd en agressief',
          'Ze mogen je persoonlijk niet',
          'Ze zijn eerlijk en respectvol — directheid is normaal in de Nederlandse cultuur',
          'Je moet reageren met even harde kritiek',
        ],
      },
      correctIndex: 2,
      explanation: {
        en: 'Dutch communication style is known for directness. Giving honest, direct feedback is a sign of respect — it means they take you seriously. It is not intended to be rude. This is called "being direct" (direct zijn).',
        nl: 'De Nederlandse communicatiestijl staat bekend om directheid. Eerlijke, directe feedback geven is een teken van respect — het betekent dat ze je serieus nemen. Het is niet bedoeld als onbeleefd. Dit heet "direct zijn".',
      },
    },
    {
      id: 'culture-q3',
      question: {
        en: 'What does "going Dutch" (ieder betaalt zijn eigen deel) mean?',
        nl: 'Wat betekent "ieder betaalt zijn eigen deel"?',
      },
      options: {
        en: [
          'The most senior person always pays the bill',
          'Everyone in the group pays an equal share of the bill',
          'The host always pays for all guests',
          'Men always pay for women',
        ],
        nl: [
          'De meest senior persoon betaalt altijd de rekening',
          'Iedereen in de groep betaalt een gelijk deel van de rekening',
          'De gastheer/gastvrouw betaalt altijd voor alle gasten',
          'Mannen betalen altijd voor vrouwen',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: '"Going Dutch" (ieder betaalt zijn eigen deel) means everyone pays their own share. This is very common in the Netherlands and reflects Dutch values of independence and equality. It applies to restaurants, outings, and other shared expenses.',
        nl: '"Ieder betaalt zijn eigen deel" betekent dat iedereen zijn eigen aandeel betaalt. Dit is heel gebruikelijk in Nederland en weerspiegelt Nederlandse waarden van zelfstandigheid en gelijkheid. Het geldt voor restaurants, uitjes en andere gedeelde uitgaven.',
      },
    },
    {
      id: 'culture-q4',
      question: {
        en: 'In Dutch work culture, how is hierarchy typically treated?',
        nl: 'Hoe wordt hiërarchie doorgaans behandeld in de Nederlandse werkcultuur?',
      },
      options: {
        en: [
          'Hierarchy is strictly followed — always address managers formally',
          'Hierarchy is relatively flat — everyone is treated with equal respect regardless of title',
          'Only the CEO deserves direct communication',
          'Junior employees should not speak unless spoken to',
        ],
        nl: [
          'Hiërarchie wordt strikt gevolgd — spreek managers altijd formeel aan',
          'Hiërarchie is relatief vlak — iedereen wordt met gelijk respect behandeld, ongeacht titel',
          'Alleen de directeur verdient directe communicatie',
          'Junior medewerkers mogen niet praten tenzij ze worden aangesproken',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'Dutch work culture has a flat hierarchy. Employees at all levels are expected to speak up, share opinions, and are addressed by their first name (even managers and directors). This reflects core Dutch values of equality.',
        nl: 'De Nederlandse werkcultuur heeft een vlakke hiërarchie. Van medewerkers op alle niveaus wordt verwacht dat ze hun mening geven en ze worden bij hun voornaam aangesproken (ook managers en directeuren). Dit weerspiegelt kernwaarden van gelijkheid.',
      },
    },
    {
      id: 'culture-q5',
      question: {
        en: 'What does individual responsibility (eigen verantwoordelijkheid) mean in Dutch society?',
        nl: 'Wat betekent eigen verantwoordelijkheid in de Nederlandse samenleving?',
      },
      options: {
        en: [
          'The government takes care of all your personal problems',
          'Your family is responsible for your financial situation',
          'You are expected to manage your own affairs, find solutions, and not rely excessively on others',
          'Individual responsibility only applies to work, not personal life',
        ],
        nl: [
          'De overheid zorgt voor al je persoonlijke problemen',
          'Je familie is verantwoordelijk voor je financiële situatie',
          'Er wordt van je verwacht dat je je eigen zaken regelt, oplossingen vindt en niet overmatig op anderen rekent',
          'Eigen verantwoordelijkheid geldt alleen voor werk, niet voor het persoonlijk leven',
        ],
      },
      correctIndex: 2,
      explanation: {
        en: 'Eigen verantwoordelijkheid (individual responsibility) is a core Dutch value. People are expected to take care of their own finances, health, and situation. Asking for help is fine, but you are first expected to try to solve problems yourself.',
        nl: 'Eigen verantwoordelijkheid is een kernwaarde in Nederland. Van mensen wordt verwacht dat ze voor hun eigen financiën, gezondheid en situatie zorgen. Om hulp vragen is oké, maar van je wordt eerst verwacht dat je zelf probeert problemen op te lossen.',
      },
    },
  ],
};

// ============================================================================
// TOPIC 11 — Integration & Participation (Inburgering)
// ============================================================================
const INTEGRATION: KNMTopic = {
  id: 'integration',
  icon: 'document-text-outline',
  title: { en: 'Integration & Participation', nl: 'Inburgering en Participatie' },
  description: {
    en: 'The inburgering process, language learning, and civic participation.',
    nl: 'Het inburgeringsproces, taal leren en maatschappelijke participatie.',
  },
  color: '#14b8a6',
  explanation: {
    en: `Inburgering (civic integration) is the official process for newcomers to the Netherlands to learn the Dutch language and understand Dutch society. Most people with a non-EU residence permit are required to inburgeren within a set time period.

The inburgeringsexamen (civic integration exam) consists of several components including KNM (Kennis van de Nederlandse Maatschappij — knowledge of Dutch society), language tests (reading, writing, speaking, listening), and Oriëntatie op de Nederlandse Arbeidsmarkt (ONA — orientation on the Dutch labour market).

The DUO (Dienst Uitvoering Onderwijs) manages the inburgering process. The gemeente and other organisations (like Vluchtelingenwerk) offer support. Active participation in society — working, volunteering, learning Dutch — is expected and encouraged.`,
    nl: `Inburgering is het officiële proces voor nieuwkomers in Nederland om de Nederlandse taal te leren en de Nederlandse samenleving te begrijpen. De meeste mensen met een niet-EU-verblijfsvergunning zijn verplicht om binnen een vastgestelde periode in te burgeren.

Het inburgeringsexamen bestaat uit meerdere onderdelen, waaronder KNM (Kennis van de Nederlandse Maatschappij), taaltoetsen (lezen, schrijven, spreken, luisteren) en Oriëntatie op de Nederlandse Arbeidsmarkt (ONA).

DUO (Dienst Uitvoering Onderwijs) beheert het inburgeringsproces. De gemeente en andere organisaties (zoals Vluchtelingenwerk) bieden ondersteuning. Actieve deelname aan de samenleving — werken, vrijwilligerswerk, Nederlands leren — wordt verwacht en aangemoedigd.`,
  },
  keyPoints: [
    {
      en: 'The KNM exam tests your knowledge of Dutch society — this is part of the inburgeringsexamen.',
      nl: 'Het KNM-examen toetst je kennis van de Nederlandse samenleving — dit is onderdeel van het inburgeringsexamen.',
    },
    {
      en: 'DUO (Dienst Uitvoering Onderwijs) manages inburgering and education in the Netherlands.',
      nl: 'DUO (Dienst Uitvoering Onderwijs) beheert inburgering en onderwijs in Nederland.',
    },
    {
      en: 'Most non-EU permit holders must complete inburgering within a set timeframe.',
      nl: 'De meeste niet-EU-vergunninghouders moeten inburgering afronden binnen een vastgestelde termijn.',
    },
    {
      en: 'Learning Dutch (NT2 — Nederlands als Tweede Taal) is central to integration.',
      nl: 'Nederlands leren (NT2 — Nederlands als Tweede Taal) staat centraal bij inburgering.',
    },
    {
      en: 'Active participation in work, education, or volunteering is encouraged and shows integration.',
      nl: 'Actieve deelname aan werk, onderwijs of vrijwilligerswerk wordt aangemoedigd en toont integratie.',
    },
    {
      en: 'The UWV and gemeente can help with finding work and guidance during integration.',
      nl: 'Het UWV en de gemeente kunnen helpen bij het vinden van werk en begeleiding tijdens de inburgering.',
    },
  ],
  examples: [
    {
      en: 'Amina is studying for her KNM exam while also taking Dutch language classes three times a week.',
      nl: 'Amina studeert voor haar KNM-examen terwijl ze ook drie keer per week Nederlandse taallessen volgt.',
    },
    {
      en: 'The gemeente referred Omar to a free language course as part of his inburgering plan.',
      nl: 'De gemeente verwees Omar naar een gratis taalcursus als onderdeel van zijn inburgeringsplan.',
    },
    {
      en: 'After completing inburgering, Rosa applied for permanent residency at the IND.',
      nl: 'Na het afronden van de inburgering diende Rosa een aanvraag in voor een permanente verblijfsvergunning bij de IND.',
    },
  ],
  quizQuestions: [
    {
      id: 'integration-q1',
      question: {
        en: 'What does "inburgering" mean?',
        nl: 'Wat betekent "inburgering"?',
      },
      options: {
        en: [
          'Applying for Dutch citizenship',
          'The civic integration process for newcomers to learn Dutch and Dutch society',
          'A government programme for unemployed Dutch people',
          'A language test only for EU citizens',
        ],
        nl: [
          'Het aanvragen van het Nederlandse staatsburgerschap',
          'Het inburgeringsproces voor nieuwkomers om Nederlands en de Nederlandse samenleving te leren',
          'Een overheidsprogramma voor werkloze Nederlanders',
          'Een taaltest alleen voor EU-burgers',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'Inburgering is the civic integration process in the Netherlands. Newcomers must learn Dutch and demonstrate knowledge of Dutch society. It includes language tests, the KNM exam, and ONA (orientation on the labour market).',
        nl: 'Inburgering is het inburgeringsproces in Nederland. Nieuwkomers moeten Nederlands leren en kennis van de Nederlandse samenleving aantonen. Het omvat taaltoetsen, het KNM-examen en ONA (oriëntatie op de arbeidsmarkt).',
      },
    },
    {
      id: 'integration-q2',
      question: {
        en: 'Which organisation is responsible for managing the inburgering process?',
        nl: 'Welke organisatie is verantwoordelijk voor het beheren van het inburgeringsproces?',
      },
      options: {
        en: ['IND (Immigration Service)', 'DUO (Dienst Uitvoering Onderwijs)', 'UWV', 'Belastingdienst'],
        nl: ['IND (Immigratie- en Naturalisatiedienst)', 'DUO (Dienst Uitvoering Onderwijs)', 'UWV', 'Belastingdienst'],
      },
      correctIndex: 1,
      explanation: {
        en: 'DUO (Dienst Uitvoering Onderwijs) is the government organisation that manages inburgering, including registering exams, processing results, and managing loans for integration courses.',
        nl: 'DUO (Dienst Uitvoering Onderwijs) is de overheidsorganisatie die inburgering beheert, inclusief het registreren van examens, het verwerken van resultaten en het beheren van leningen voor inburgeringscursussen.',
      },
    },
    {
      id: 'integration-q3',
      question: {
        en: 'What is "NT2" in the context of Dutch integration?',
        nl: 'Wat is "NT2" in de context van Nederlandse inburgering?',
      },
      options: {
        en: [
          'A level of Dutch driving licence',
          'Nederlands als Tweede Taal — Dutch as a Second Language',
          'A type of work permit',
          'A health insurance category',
        ],
        nl: [
          'Een niveau van het Nederlandse rijbewijs',
          'Nederlands als Tweede Taal — Dutch as a Second Language',
          'Een type werkvergunning',
          'Een zorgverzekeringscategorie',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'NT2 stands for Nederlands als Tweede Taal (Dutch as a Second Language). NT2 courses and exams are designed for people who did not grow up speaking Dutch. They are central to the inburgering process.',
        nl: 'NT2 staat voor Nederlands als Tweede Taal. NT2-cursussen en -examens zijn bedoeld voor mensen die niet zijn opgegroeid met Nederlands spreken. Ze zijn centraal in het inburgeringsproces.',
      },
    },
    {
      id: 'integration-q4',
      question: {
        en: 'What does "ONA" stand for in the inburgeringsexamen?',
        nl: 'Waar staat "ONA" voor in het inburgeringsexamen?',
      },
      options: {
        en: [
          'Organisatie voor Nieuwkomers en Asielzoekers',
          'Oriëntatie op de Nederlandse Arbeidsmarkt (Orientation on the Dutch Labour Market)',
          'Online Naturalisatie Aanvraag',
          'Onderwijs voor Nieuwkomers en Asielzoekers',
        ],
        nl: [
          'Organisatie voor Nieuwkomers en Asielzoekers',
          'Oriëntatie op de Nederlandse Arbeidsmarkt',
          'Online Naturalisatie Aanvraag',
          'Onderwijs voor Nieuwkomers en Asielzoekers',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'ONA stands for Oriëntatie op de Nederlandse Arbeidsmarkt (Orientation on the Dutch Labour Market). It is a component of the inburgeringsexamen that tests knowledge of working in the Netherlands.',
        nl: 'ONA staat voor Oriëntatie op de Nederlandse Arbeidsmarkt. Het is een onderdeel van het inburgeringsexamen dat kennis van werken in Nederland toetst.',
      },
    },
    {
      id: 'integration-q5',
      question: {
        en: 'Why is active participation in Dutch society important during integration?',
        nl: 'Waarom is actieve deelname aan de Nederlandse samenleving belangrijk tijdens de inburgering?',
      },
      options: {
        en: [
          'It is not important — just passing the exam is enough',
          'It helps build language skills, social connections, and a sense of belonging in Dutch society',
          'It is required by law to work 40 hours per week during integration',
          'It reduces your tax obligations',
        ],
        nl: [
          'Het is niet belangrijk — alleen het examen halen is genoeg',
          'Het helpt taalvaardigheden, sociale contacten en een gevoel van verbondenheid in de Nederlandse samenleving op te bouwen',
          'Het is wettelijk vereist om 40 uur per week te werken tijdens de inburgering',
          'Het verlaagt je belastingverplichtingen',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'Active participation — through work, volunteering, language courses, or community activities — is encouraged because it accelerates language learning, builds social networks, and creates a sense of belonging. It is more than just passing an exam.',
        nl: 'Actieve deelname — door werk, vrijwilligerswerk, taalcursussen of gemeenschapsactiviteiten — wordt aangemoedigd omdat het het leren van de taal versnelt, sociale netwerken opbouwt en een gevoel van verbondenheid creëert. Het gaat verder dan alleen het halen van een examen.',
      },
    },
  ],
};

// ============================================================================
// TOPIC 12 — Dutch History (De Geschiedenis van Nederland)
// ============================================================================
const HISTORY: KNMTopic = {
  id: 'history',
  icon: 'time-outline',
  title: { en: 'Dutch History', nl: 'De Geschiedenis van Nederland' },
  description: {
    en: 'Key moments from the Eighty Years War to modern times.',
    nl: 'Belangrijke momenten van de Tachtigjarige Oorlog tot de moderne tijd.',
  },
  color: '#92400e',
  explanation: {
    en: `The Netherlands has a rich history shaped by trade, religion, war, and water.

The Eighty Years War (Tachtigjarige Oorlog, 1568–1648): The Dutch fought against Spanish rule. Willem van Oranje led the revolt. He became Protestant and defended freedom of religion. He was shot dead in Delft in 1584. In 1588 the Dutch became an independent republic: the Republic of the Seven United Netherlands (Republiek der Zeven Verenigde Nederlanden).

The Golden Age (Gouden Eeuw, 17th century): The Dutch traded with the whole world through the VOC (Vereenigde Oost-Indische Compagnie — trading with Asia) and WIC (West-Indische Compagnie — trading with Africa and the Americas). The Netherlands had colonies including Indonesia, Suriname, and parts of South Africa. Art flourished — Rembrandt painted De Nachtwacht, still on display in the Rijksmuseum. Rich merchants built the famous canal houses (grachtenhuizen) in Amsterdam and Utrecht.

After 1800: In 1814 the Netherlands became a kingdom (koninkrijk) with King Willem I. The Grondwet (constitution) was written in 1815. Belgium separated from the Netherlands in 1830. In 1848 the Grondwet was changed — the king had less power and democracy grew stronger.

Social progress: After 1850 factories arrived. In 1874 children under 12 were no longer allowed to work. In 1900 leerplicht (compulsory education) began. In 1917 all men got the right to vote; in 1919 women got the vote too.

World War II (Tweede Wereldoorlog, 1940–1945): Germany occupied the Netherlands from May 1940. Jewish people were persecuted — they had to wear a yellow Star of David (Jodenster). Anne Frank, a 13-year-old Jewish girl, hid with her family in the Achterhuis in Amsterdam for two years. She wrote a famous diary. She was discovered, deported, and died in Bergen-Belsen camp. Her diary became world-famous. The Achterhuis is now a museum. Six million Jews were killed across Europe. On 5 May 1945 the Netherlands was liberated. Every year on 4 May (Dodenherdenking) the whole country observes 2 minutes of silence at 20:00 to remember the dead. On 5 May (Bevrijdingsdag) freedom is celebrated.

After the war: The Netherlands prospered (welvaart). Minister-President Willem Drees introduced the AOW — state pension for everyone from age 65. In 1949 Indonesia became independent. In 1953 a great flood struck Zeeland; the Deltaplan was created to build dikes and dams. Around 1970 guest workers (gastarbeiders) arrived from Turkey and Morocco. In 1975 Suriname became independent and many Surinamese came to the Netherlands. The Netherlands joined the European Union and adopted the euro in 2002. The Inburgeringswet (integration law) came into force in 2007.`,
    nl: `Nederland heeft een rijke geschiedenis gevormd door handel, religie, oorlog en water.

De Tachtigjarige Oorlog (1568–1648): De Nederlanders vochten tegen de Spaanse overheersing. Willem van Oranje leidde de opstand. Hij werd protestant en verdedigde de vrijheid van godsdienst. Hij werd in 1584 in Delft doodgeschoten. In 1588 werden de Nederlanden een onafhankelijke republiek: de Republiek der Zeven Verenigde Nederlanden.

De Gouden Eeuw (17e eeuw): De Nederlanders handelden met de hele wereld via de VOC (Vereenigde Oost-Indische Compagnie — handel met Azië) en de WIC (West-Indische Compagnie — handel met Afrika en Amerika). Nederland had koloniën, waaronder Indonesië, Suriname en delen van Zuid-Afrika. De kunst bloeide — Rembrandt schilderde De Nachtwacht, nog steeds te zien in het Rijksmuseum. Rijke kooplieden bouwden de beroemde grachtenhuizen in Amsterdam en Utrecht.

Na 1800: In 1814 werd Nederland een koninkrijk met koning Willem I. De Grondwet werd in 1815 geschreven. België scheidde zich in 1830 af. In 1848 werd de Grondwet veranderd — de koning had minder macht en de democratie groeide sterker.

Sociale vooruitgang: Na 1850 kwamen er fabrieken. In 1874 mochten kinderen onder de 12 jaar niet meer werken. In 1900 werd de leerplicht ingevoerd. In 1917 kregen alle mannen kiesrecht; in 1919 kregen vrouwen ook het kiesrecht.

Tweede Wereldoorlog (1940–1945): Duitsland bezette Nederland vanaf mei 1940. Joodse mensen werden vervolgd — ze moesten een gele Jodenster dragen. Anne Frank, een 13-jarig Joods meisje, dook met haar familie twee jaar onder in het Achterhuis in Amsterdam. Ze schreef een beroemd dagboek. Ze werd ontdekt, gedeporteerd en stierf in kamp Bergen-Belsen. Haar dagboek werd wereldberoemd. Het Achterhuis is nu een museum. Zes miljoen Joden werden in heel Europa vermoord. Op 5 mei 1945 werd Nederland bevrijd. Elk jaar op 4 mei (Dodenherdenking) houdt het hele land om 20:00 uur 2 minuten stilte ter nagedachtenis aan de doden. Op 5 mei (Bevrijdingsdag) wordt de vrijheid gevierd.

Na de oorlog: Nederland werd welvarend. Minister-President Willem Drees voerde de AOW in — staatspensioen voor iedereen vanaf 65 jaar. In 1949 werd Indonesië onafhankelijk. In 1953 trof een grote overstroming Zeeland; het Deltaplan werd gemaakt. Rond 1970 kwamen gastarbeiders uit Turkije en Marokko. In 1975 werd Suriname onafhankelijk. Nederland voerde de euro in in 2002. De Inburgeringswet trad in 2007 in werking.`,
  },
  keyPoints: [
    {
      en: 'Tachtigjarige Oorlog (1568–1648): Dutch fought Spain for independence under Willem van Oranje.',
      nl: 'Tachtigjarige Oorlog (1568–1648): Nederlanders vochten tegen Spanje voor onafhankelijkheid onder Willem van Oranje.',
    },
    {
      en: 'Gouden Eeuw (17th century): VOC traded with Asia; WIC with Africa and Americas. Rembrandt painted De Nachtwacht.',
      nl: 'Gouden Eeuw (17e eeuw): VOC handelde met Azië; WIC met Afrika en Amerika. Rembrandt schilderde De Nachtwacht.',
    },
    {
      en: 'WWII (1940–1945): Germany occupied Netherlands. Anne Frank hid in the Achterhuis. Liberation on 5 May 1945.',
      nl: 'WOII (1940–1945): Duitsland bezette Nederland. Anne Frank dook onder in het Achterhuis. Bevrijding op 5 mei 1945.',
    },
    {
      en: '4 May = Dodenherdenking: 2 minutes silence at 20:00. 5 May = Bevrijdingsdag.',
      nl: '4 mei = Dodenherdenking: 2 minuten stilte om 20:00. 5 mei = Bevrijdingsdag.',
    },
    {
      en: 'Women got the right to vote in 1919. Willem Drees introduced the AOW state pension.',
      nl: 'Vrouwen kregen in 1919 het kiesrecht. Willem Drees voerde de AOW-staatspensioen in.',
    },
    {
      en: '1953 Zeeland flood → Deltaplan. ~1970: gastarbeiders from Turkey and Morocco arrived.',
      nl: '1953 overstroming Zeeland → Deltaplan. ~1970: gastarbeiders uit Turkije en Marokko kwamen.',
    },
  ],
  examples: [
    {
      en: 'Willem van Oranje was shot dead in Delft in 1584 — the Prinsenhof museum marks the spot today.',
      nl: 'Willem van Oranje werd in 1584 in Delft doodgeschoten — het Prinsenhof-museum markeert de plek vandaag.',
    },
    {
      en: "Anne Frank's diary was written in the Achterhuis in Amsterdam — now a museum visited by millions.",
      nl: 'Het dagboek van Anne Frank werd geschreven in het Achterhuis in Amsterdam — nu een museum dat door miljoenen wordt bezocht.',
    },
    {
      en: 'On 4 May at 20:00 the whole street falls silent for 2 minutes — Dodenherdenking.',
      nl: 'Op 4 mei om 20:00 wordt de hele straat 2 minuten lang stil — Dodenherdenking.',
    },
  ],
  quizQuestions: [
    {
      id: 'history-q1',
      question: {
        en: 'The Tachtigjarige Oorlog (1568–1648) was fought against which country?',
        nl: 'De Tachtigjarige Oorlog (1568–1648) werd gevoerd tegen welk land?',
      },
      options: {
        en: ['France', 'Spain', 'Germany', 'England'],
        nl: ['Frankrijk', 'Spanje', 'Duitsland', 'Engeland'],
      },
      correctIndex: 1,
      explanation: {
        en: 'The Tachtigjarige Oorlog (1568–1648) was fought against Spain. Led by Willem van Oranje, the Dutch fought for independence and religious freedom. In 1588 the Dutch Republic was founded.',
        nl: 'De Tachtigjarige Oorlog (1568–1648) werd gevoerd tegen Spanje. Onder leiding van Willem van Oranje vochten de Nederlanders voor onafhankelijkheid en godsdienstvrijheid. In 1588 werd de Republiek der Nederlanden gesticht.',
      },
    },
    {
      id: 'history-q2',
      question: {
        en: 'What happened to Willem van Oranje in 1584?',
        nl: 'Wat gebeurde er met Willem van Oranje in 1584?',
      },
      options: {
        en: ['He became King of the Netherlands', 'He was shot dead in Delft', 'He signed a peace treaty with Spain', 'He founded the VOC trading company'],
        nl: ['Hij werd koning van Nederland', 'Hij werd doodgeschoten in Delft', 'Hij tekende een vredesverdrag met Spanje', 'Hij stichtte de VOC handelscompagnie'],
      },
      correctIndex: 1,
      explanation: {
        en: 'Willem van Oranje was assassinated (doodgeschoten) in Delft in 1584. He is considered the "Father of the Fatherland" (Vader des Vaderlands). King Willem-Alexander is his descendant — that is why the royal family is called "Van Oranje-Nassau" and why orange is the Dutch national colour.',
        nl: 'Willem van Oranje werd in 1584 in Delft doodgeschoten. Hij wordt beschouwd als de "Vader des Vaderlands". Koning Willem-Alexander is zijn nakomeling — daarom heet de koninklijke familie "Van Oranje-Nassau" en is oranje de Nederlandse nationale kleur.',
      },
    },
    {
      id: 'history-q3',
      question: {
        en: 'What was the VOC during the Golden Age (Gouden Eeuw)?',
        nl: 'Wat was de VOC tijdens de Gouden Eeuw?',
      },
      options: {
        en: [
          'A Dutch government ministry',
          'A Dutch trading company that traded with Asia',
          'A military organisation fighting against Spain',
          'A Dutch art museum',
        ],
        nl: [
          'Een Nederlands overheidsministerie',
          'Een Nederlandse handelscompagnie die handelde met Azië',
          'Een militaire organisatie die tegen Spanje vocht',
          'Een Nederlands kunstmuseum',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'The VOC (Vereenigde Oost-Indische Compagnie) was the world\'s first multinational trading company, founded in 1602. It traded with Asia — especially Indonesia. The WIC (West-Indische Compagnie) traded with Africa and the Americas. The Netherlands had colonies including Indonesia and Suriname.',
        nl: 'De VOC (Vereenigde Oost-Indische Compagnie) was \'s werelds eerste multinationale handelscompagnie, opgericht in 1602. Ze handelde met Azië — met name met Indonesië. De WIC (West-Indische Compagnie) handelde met Afrika en Amerika. Nederland had koloniën, waaronder Indonesië en Suriname.',
      },
    },
    {
      id: 'history-q4',
      question: {
        en: 'What is Dodenherdenking and when does it take place?',
        nl: 'Wat is de Dodenherdenking en wanneer vindt die plaats?',
      },
      options: {
        en: [
          'A day to celebrate Dutch independence — 27 April',
          'A national remembrance for WWII victims — 4 May, 2 minutes silence at 20:00',
          'The day Germany invaded the Netherlands — 10 May 1940',
          'Liberation Day — 5 May 1945',
        ],
        nl: [
          'Een dag om de Nederlandse onafhankelijkheid te vieren — 27 april',
          'Een nationale herdenking voor WOII-slachtoffers — 4 mei, 2 minuten stilte om 20:00',
          'De dag dat Duitsland Nederland binnenviel — 10 mei 1940',
          'Bevrijdingsdag — 5 mei 1945',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'Dodenherdenking is on 4 May. At exactly 20:00, the whole country observes 2 minutes of silence for all who died in wars, especially WWII. The following day, 5 May, is Bevrijdingsdag — celebrating the liberation from German occupation in 1945.',
        nl: 'Dodenherdenking is op 4 mei. Precies om 20:00 uur houdt het hele land 2 minuten stilte voor allen die in oorlogen zijn gevallen, met name in de WOII. De volgende dag, 5 mei, is Bevrijdingsdag — ter viering van de bevrijding van de Duitse bezetting in 1945.',
      },
    },
    {
      id: 'history-q5',
      question: {
        en: 'Where did Anne Frank and her family hide during WWII?',
        nl: 'Waar doken Anne Frank en haar familie onder tijdens de WOII?',
      },
      options: {
        en: ['In the Rijksmuseum in Amsterdam', 'In het Achterhuis on the Prinsengracht in Amsterdam', 'In the Binnenhof in Den Haag', 'In a farm in Zeeland'],
        nl: ['In het Rijksmuseum in Amsterdam', 'In het Achterhuis aan de Prinsengracht in Amsterdam', 'In het Binnenhof in Den Haag', 'Op een boerderij in Zeeland'],
      },
      correctIndex: 1,
      explanation: {
        en: 'Anne Frank and her family hid in the Achterhuis (Secret Annex) on the Prinsengracht in Amsterdam for two years. Anne wrote her famous diary there. She was discovered and died in Bergen-Belsen camp. The Achterhuis is now a museum visited by over one million people each year.',
        nl: 'Anne Frank en haar familie doken twee jaar onder in het Achterhuis aan de Prinsengracht in Amsterdam. Anne schreef er haar beroemde dagboek. Ze werd ontdekt en stierf in kamp Bergen-Belsen. Het Achterhuis is nu een museum dat jaarlijks door meer dan een miljoen mensen wordt bezocht.',
      },
    },
    {
      id: 'history-q6',
      question: {
        en: 'In what year did women in the Netherlands get the right to vote?',
        nl: 'In welk jaar kregen vrouwen in Nederland het kiesrecht?',
      },
      options: {
        en: ['1848', '1900', '1917', '1919'],
        nl: ['1848', '1900', '1917', '1919'],
      },
      correctIndex: 3,
      explanation: {
        en: 'Women in the Netherlands received the right to vote in 1919. All men had already received voting rights in 1917. The first woman to study medicine in the Netherlands was Aletta Jacobs in 1871.',
        nl: 'Vrouwen in Nederland kregen in 1919 het kiesrecht. Alle mannen hadden al in 1917 kiesrecht gekregen. De eerste vrouw die in Nederland medicijnen studeerde was Aletta Jacobs in 1871.',
      },
    },
  ],
};

// ============================================================================
// TOPIC 13 — Holidays & Social Customs (Feestdagen en Gewoonten)
// ============================================================================
const FEESTDAGEN: KNMTopic = {
  id: 'feestdagen',
  icon: 'calendar-outline',
  title: { en: 'Holidays & Social Customs', nl: 'Feestdagen en Gewoonten' },
  description: {
    en: 'Dutch public holidays, celebrations, and social etiquette.',
    nl: 'Nederlandse feestdagen, vieringen en sociale omgangsvormen.',
  },
  color: '#d946ef',
  explanation: {
    en: `The Netherlands has many special days and social traditions throughout the year.

Key Dutch holidays (feestdagen):
- Valentijnsdag: 14 February. Lovers send cards or give gifts.
- Carnaval: Four days (Saturday to Tuesday before Ash Wednesday). People wear fancy dress, mainly in the south of the Netherlands.
- Pasen (Easter): Sunday + Monday in March/April. Christian spring festival — Jesus rose from the dead. People eat eggs.
- Koningsdag: 27 April — King Willem-Alexander's birthday. The whole country turns orange (de kleur van Nederland). Vrijmarkten (flea markets) everywhere. People sell their old things on the street.
- Dodenherdenking: 4 May — at 20:00, 2 minutes of silence (stilte) for all war victims.
- Bevrijdingsdag: 5 May — Liberation Day, end of WWII occupation 1945.
- Moederdag: Second Sunday in May. Mothers receive flowers or gifts.
- Hemelvaartsdag: Thursday 40 days after Easter. Ascension Day — Jesus went to heaven. Christians go to church.
- Pinksteren: Sunday + Monday, 10 days after Hemelvaartsdag. Pentecost.
- Vaderdag: Third Sunday in June. Fathers receive gifts.
- Sinterklaas: 5 December. Sinterklaas arrives from Spain with Zwarte Pieten. Children put their shoe out (schoen zetten) in the evenings and get snoep (candy) or small gifts. Adults also give each other presents. Very important Dutch tradition.
- Kerstmis: 25 + 26 December. Jesus' birth. Family celebration, kerstboom (Christmas tree) in the house.
- Oud en Nieuw: 31 December / 1 January. Fireworks (vuurwerk) at midnight to welcome the new year.

Family event customs:
- Verjaardag (birthday): cake with candles, sing "Lang zal ze/hij leven", give gifts. Children trakteren (treat classmates at school).
- Bruiloft (wedding): white dress (witte jurk) for the bride, ceremony at gemeentehuis (civil) and sometimes church, reception (receptie) afterwards.
- Baby born: parents send cards; visitors get beschuit met muisjes (rusk with pink/blue anise seeds). Don't stay too long — mother needs rest.
- Geslaagd (passed exams): hang the school bag on the flag (vlag) outside!
- Doodgegaan (death): begrafenis (burial) or crematie. Wear dark clothes. Say "Gecondoleerd" or "Veel sterkte".

Key phrases:
- "Gefeliciteerd!" = Congratulations (birthday, new baby, passing exams, wedding)
- "Gecondoleerd" = Condolences (when someone has died)
- "Beterschap!" = Get well soon (when someone is sick)`,
    nl: `Nederland heeft veel speciale dagen en sociale tradities door het jaar heen.

Belangrijke feestdagen:
- Valentijnsdag: 14 februari. Geliefden sturen kaarten of geven cadeaus.
- Carnaval: Vier dagen (zaterdag t/m dinsdag voor Aswoensdag). Mensen dragen gekke kleren, vooral in het zuiden.
- Pasen: Zondag + maandag in maart/april. Christelijk lentefeest. Mensen eten eieren.
- Koningsdag: 27 april — verjaardag van koning Willem-Alexander. Het hele land kleurt oranje. Vrijmarkten overal.
- Dodenherdenking: 4 mei — om 20:00 uur 2 minuten stilte voor alle oorlogsslachtoffers.
- Bevrijdingsdag: 5 mei — einde van de bezetting in 1945.
- Moederdag: Tweede zondag in mei. Moeders krijgen bloemen of cadeaus.
- Hemelvaartsdag: Donderdag 40 dagen na Pasen.
- Pinksteren: Zondag + maandag, 10 dagen na Hemelvaartsdag.
- Vaderdag: Derde zondag in juni.
- Sinterklaas: 5 december. Kinderen zetten hun schoen en krijgen snoep of cadeautjes. Zwarte Pieten helpen Sinterklaas.
- Kerstmis: 25 + 26 december. Kerstboom in huis. Familiefeest.
- Oud en Nieuw: 31 december / 1 januari. Vuurwerk om middernacht.

Gewoonten bij familiegebeurtenissen:
- Verjaardag: taart met kaarsjes, "Lang zal ze/hij leven" zingen, cadeaus geven. Kinderen trakteren op school.
- Bruiloft: witte jurk voor de bruid, huwelijk op het gemeentehuis en soms in de kerk, daarna receptie.
- Baby geboren: beschuit met muisjes voor bezoekers. Niet te lang blijven — moeder moet rusten.
- Geslaagd: schooltas aan de vlag buiten hangen!
- Iemand gestorven: begrafenis of crematie, donkere kleren, "Gecondoleerd" of "Veel sterkte" zeggen.`,
  },
  keyPoints: [
    {
      en: 'Koningsdag is 27 April — King\'s birthday. Everyone wears orange; vrijmarkten (flea markets) are held everywhere.',
      nl: 'Koningsdag is 27 april — verjaardag van de koning. Iedereen draagt oranje; overal zijn er vrijmarkten.',
    },
    {
      en: 'Sinterklaas is 5 December — children put their shoe out and get snoep or gifts from Sinterklaas and Zwarte Piet.',
      nl: 'Sinterklaas is 5 december — kinderen zetten hun schoen en krijgen snoep of cadeaus van Sinterklaas en Zwarte Piet.',
    },
    {
      en: '4 May = Dodenherdenking (2 minutes silence at 20:00). 5 May = Bevrijdingsdag (Liberation Day).',
      nl: '4 mei = Dodenherdenking (2 minuten stilte om 20:00). 5 mei = Bevrijdingsdag.',
    },
    {
      en: 'When a baby is born, visitors eat beschuit met muisjes (rusk with pink or blue anise seeds).',
      nl: 'Als er een baby is geboren, eten bezoekers beschuit met muisjes (roze of blauwe).',
    },
    {
      en: 'When someone passes exams (geslaagd), they hang their school bag on the flag outside.',
      nl: 'Als iemand geslaagd is, hangt de schooltas aan de vlag buiten.',
    },
    {
      en: '"Gefeliciteerd" for happy events. "Gecondoleerd" when someone has died. "Beterschap" when someone is sick.',
      nl: '"Gefeliciteerd" bij blijde gebeurtenissen. "Gecondoleerd" als iemand is gestorven. "Beterschap" als iemand ziek is.',
    },
  ],
  examples: [
    {
      en: 'On Koningsdag, Galo and Mirjam went to the vrijmarkt wearing orange and sold their old books.',
      nl: 'Op Koningsdag gingen Galo en Mirjam naar de vrijmarkt in oranje kleren en verkochten hun oude boeken.',
    },
    {
      en: "When Mirjam's neighbour had a baby, she brought a gift and ate beschuit met muisjes.",
      nl: "Toen de buurvrouw van Mirjam een baby kreeg, bracht ze een cadeautje en at ze beschuit met muisjes.",
    },
    {
      en: 'After passing his Dutch language exam, Ahmed hung his school bag on the flag outside his house.',
      nl: 'Na het halen van zijn Nederlandse taalexamen hing Ahmed zijn tas aan de vlag buiten zijn huis.',
    },
  ],
  quizQuestions: [
    {
      id: 'feest-q1',
      question: {
        en: 'When is Koningsdag celebrated and what colour do people wear?',
        nl: 'Wanneer wordt Koningsdag gevierd en welke kleur dragen mensen?',
      },
      options: {
        en: ['25 December — red', '27 April — orange', '5 May — blue', '5 December — yellow'],
        nl: ['25 december — rood', '27 april — oranje', '5 mei — blauw', '5 december — geel'],
      },
      correctIndex: 1,
      explanation: {
        en: 'Koningsdag is on 27 April, King Willem-Alexander\'s birthday. The whole country turns orange — the national colour and the colour of the royal family "Van Oranje-Nassau". There are vrijmarkten (flea markets) where anyone can sell anything on the street.',
        nl: 'Koningsdag is op 27 april, de verjaardag van koning Willem-Alexander. Het hele land kleurt oranje — de nationale kleur en de kleur van de koninklijke familie "Van Oranje-Nassau". Er zijn vrijmarkten waar iedereen van alles op straat mag verkopen.',
      },
    },
    {
      id: 'feest-q2',
      question: {
        en: 'What do Dutch visitors eat when a new baby is born?',
        nl: 'Wat eten Nederlandse bezoekers als er een baby is geboren?',
      },
      options: {
        en: [
          'Oliebollen (doughnuts)',
          'Beschuit met muisjes (rusk with anise seeds)',
          'Taart (cake)',
          'Boterkoek (butter cake)',
        ],
        nl: [
          'Oliebollen',
          'Beschuit met muisjes',
          'Taart',
          'Boterkoek',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'Beschuit met muisjes is a uniquely Dutch birth tradition. Pink muisjes (anise seeds) are for a girl; blue are for a boy. Visitors eat this when they come to congratulate the new parents.',
        nl: 'Beschuit met muisjes is een typisch Nederlandse geboortetraditie. Roze muisjes zijn voor een meisje; blauwe voor een jongetje. Bezoekers eten dit als ze de nieuwe ouders komen feliciteren.',
      },
    },
    {
      id: 'feest-q3',
      question: {
        en: 'What happens in the Netherlands on 4 May at 20:00?',
        nl: 'Wat gebeurt er in Nederland op 4 mei om 20:00 uur?',
      },
      options: {
        en: [
          'Fireworks celebrate the end of World War II',
          'The whole country observes 2 minutes of silence (Dodenherdenking)',
          'The King gives a speech on television',
          'Sinterklaas arrives by boat',
        ],
        nl: [
          'Vuurwerk viert het einde van de WOII',
          'Het hele land houdt 2 minuten stilte (Dodenherdenking)',
          'De Koning geeft een toespraak op televisie',
          'Sinterklaas komt per boot aan',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'On 4 May at exactly 20:00, the Netherlands observes Dodenherdenking — 2 minutes of complete silence to honour all victims of WWII and other wars. The next day, 5 May, is Bevrijdingsdag (Liberation Day), when the liberation from German occupation in 1945 is celebrated.',
        nl: 'Op 4 mei om precies 20:00 uur houdt Nederland de Dodenherdenking — 2 minuten volledige stilte ter ere van alle slachtoffers van de WOII en andere oorlogen. De volgende dag, 5 mei, is Bevrijdingsdag, waarop de bevrijding van de Duitse bezetting in 1945 wordt gevierd.',
      },
    },
    {
      id: 'feest-q4',
      question: {
        en: 'Your friend\'s son has just passed his school exams (geslaagd). What is the Dutch tradition?',
        nl: 'De zoon van je vriend is net geslaagd voor zijn school-examen. Wat is de Nederlandse traditie?',
      },
      options: {
        en: [
          'Throw a big party for all the neighbours',
          'Hang the school bag on the flag (vlag) outside the house',
          'Give the school a special thank-you gift',
          'Plant a tree in the garden',
        ],
        nl: [
          'Een groot feest geven voor alle buren',
          'De schooltas aan de vlag buiten het huis hangen',
          'De school een speciaal bedankje geven',
          'Een boom in de tuin planten',
        ],
      },
      correctIndex: 1,
      explanation: {
        en: 'In the Netherlands, when someone passes their exams (geslaagd), the tradition is to hang their school bag on the flag (vlag) outside the house. This is how everyone in the neighbourhood knows the good news.',
        nl: 'In Nederland is de traditie als iemand geslaagd is om de schooltas aan de vlag buiten het huis te hangen. Zo weet iedereen in de buurt het goede nieuws.',
      },
    },
    {
      id: 'feest-q5',
      question: {
        en: 'When someone you know has just died, what do you say in Dutch?',
        nl: 'Als iemand die je kent net is gestorven, wat zeg je dan in het Nederlands?',
      },
      options: {
        en: ['"Gefeliciteerd!"', '"Gecondoleerd" or "Veel sterkte"', '"Lang zal ze/hij leven!"', '"Beterschap!"'],
        nl: ['"Gefeliciteerd!"', '"Gecondoleerd" of "Veel sterkte"', '"Lang zal ze/hij leven!"', '"Beterschap!"'],
      },
      correctIndex: 1,
      explanation: {
        en: '"Gecondoleerd" means condolences. You say this when someone has died. "Veel sterkte" (much strength) is also appropriate. "Gefeliciteerd" is for happy events like birthdays. "Beterschap" means "get well soon" — for when someone is ill.',
        nl: '"Gecondoleerd" betekent condoleances. Je zegt dit als iemand is gestorven. "Veel sterkte" is ook gepast. "Gefeliciteerd" is voor blijde gebeurtenissen zoals verjaardagen. "Beterschap" betekent "word snel beter" — voor als iemand ziek is.',
      },
    },
    {
      id: 'feest-q6',
      question: {
        en: 'Which of the following statements about Sinterklaas is correct?',
        nl: 'Welke van de volgende uitspraken over Sinterklaas klopt?',
      },
      options: {
        en: [
          'Sinterklaas is celebrated on 25 December',
          'Sinterklaas is only for adults',
          'Children put their shoe out and receive snoep or gifts on 5 December',
          'Sinterklaas comes from Germany',
        ],
        nl: [
          'Sinterklaas wordt gevierd op 25 december',
          'Sinterklaas is alleen voor volwassenen',
          'Kinderen zetten hun schoen en krijgen snoep of cadeaus op 5 december',
          'Sinterklaas komt uit Duitsland',
        ],
      },
      correctIndex: 2,
      explanation: {
        en: 'Sinterklaas is celebrated on 5 December (and the evenings before). Children put their shoe out and receive snoep (candy) or presents from Sinterklaas and Zwarte Piet. Sinterklaas is said to come from Spain (not Germany). It is a very important Dutch tradition.',
        nl: 'Sinterklaas wordt gevierd op 5 december (en de avonden daarvoor). Kinderen zetten hun schoen en krijgen snoep of cadeaus van Sinterklaas en Zwarte Piet. Sinterklaas komt uit Spanje (niet uit Duitsland). Het is een heel belangrijke Nederlandse traditie.',
      },
    },
  ],
};

// ============================================================================
// Exported arrays
// ============================================================================

export const KNM_TOPICS: KNMTopic[] = [
  LIVING,
  WORK,
  HEALTHCARE,
  EDUCATION,
  FAMILY,
  RIGHTS,
  GOVERNMENT,
  TRANSPORT,
  DAILY,
  CULTURE,
  HISTORY,
  FEESTDAGEN,
  INTEGRATION,
];

export default KNM_TOPICS;
