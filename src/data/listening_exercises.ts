export interface ListeningQuestion {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  answer: 'A' | 'B' | 'C' | 'D';
}

export interface ListeningExercise {
  id: string;
  title: string;
  dialogue: string;
  questions: ListeningQuestion[];
}

export const LISTENING_EXERCISES: ListeningExercise[] = [
  {
    id: '1',
    title: 'Weekend Activities',
    dialogue: 'A: Wat zijn je plannen voor dit weekend? Het wordt eindelijk weer eens mooi weer.\nB: Ik ga zaterdagochtend eerst naar de markt voor verse groenten en daarna naar de sportschool. En jij?\nA: Ik denk dat ik naar het strand ga in Scheveningen. Misschien neem ik ook een boek mee om lekker in de zon te lezen.\nB: Klinkt heerlijk! Ga je met de auto of neem je de trein?\nA: Ik neem de trein, want parkeren bij het strand is in het weekend bijna onmogelijk en erg duur.\nB: Dat is waar. Zullen we zondag ergens samen koffie drinken in de stad?\nA: Ja, gezellig! Zullen we afspreken om elf uur bij dat nieuwe tentje bij het park?\nB: Perfect, dat is een goed idee. We kunnen daarna ook een kleine wandeling maken als het droog blijft.\nA: Goed plan. Dan spreken we dat af. Ik heb er nu al zin in!\nB: Ik ook, tot zondag!',
    questions: [
      { question: 'Wat is het plan van persoon A voor zaterdag?', options: { A: 'Naar de markt gaan', B: 'Naar het strand in Scheveningen', C: 'Sporten in de sportschool', D: 'Een taart bakken' }, answer: 'B' },
      { question: 'Waarom gaat persoon A met de trein naar het strand?', options: { A: 'Omdat de auto kapot is', B: 'Omdat het sneller is dan de auto', C: 'Omdat parkeren lastig en duur is', D: 'Omdat er geen parkeerplaatsen zijn' }, answer: 'C' },
      { question: 'Hoe laat spreken ze zondag af?', options: { A: 'Om tien uur', B: 'Om elf uur', C: 'Om twaalf uur', D: 'Om één uur' }, answer: 'B' },
      { question: 'Wat gaan ze zondag doen naast koffie drinken?', options: { A: 'Winkelen in de stad', B: 'Naar het museum gaan', C: 'Een wandeling maken', D: 'Naar de film gaan' }, answer: 'C' },
    ],
  },
  {
    id: '2',
    title: 'Traffic & Travel',
    dialogue: 'A: Pardon, meneer, weet u misschien of de Intercity naar Amsterdam op tijd rijdt?\nB: Nee, helaas niet. Ik hoorde net een omroepbericht dat er een storing is op het traject bij Leiden.\nA: Oh nee, dat meent u niet. Dat is al de tweede keer deze week. Heeft de trein veel vertraging?\nB: Volgens de app is de vertraging nu ongeveer dertig minuten, maar het kan ook langer duren.\nA: Dat is erg vervelend. Dan kom ik veel te laat voor mijn belangrijke afspraak op kantoor.\nB: Je kunt eventueel ook de bus nemen bij het busstation hiernaast. Lijn 400 gaat ook die kant op.\nA: Goede tip, bedankt! Weet u toevallig waar de bushalte precies is?\nB: Als je het station uitloopt naar links, zie je de blauwe bussen vanzelf staan bij perron B.\nA: Hartelijk dank voor de hulp! Ik ren er snel naartoe, hopelijk haal ik het nog.\nB: Geen dank en succes met je afspraak. Een goede reis verder!',
    questions: [
      { question: 'Waarom rijdt de trein naar Amsterdam niet op tijd?', options: { A: 'Vanwege het slechte weer', B: 'Vanwege een storing bij Leiden', C: 'Vanwege een staking', D: 'Vanwege een ongeluk' }, answer: 'B' },
      { question: 'Hoe lang is de vertraging volgens de app?', options: { A: 'Tien minuten', B: 'Vijftien minuten', C: 'Twintig minuten', D: 'Dertig minuten' }, answer: 'D' },
      { question: 'Welk alternatief vervoermiddel wordt aangeraden?', options: { A: 'De taxi', B: 'De bus (Lijn 400)', C: 'De tram', D: 'Een andere trein via Utrecht' }, answer: 'B' },
      { question: 'Waar bevindt de bushalte zich?', options: { A: 'Aan de rechterkant van het station', B: 'Bij perron A', C: 'Bij perron B, links van het station', D: 'Tegenover de hoofdingang' }, answer: 'C' },
    ],
  },
  {
    id: '3',
    title: 'Work & Life',
    dialogue: 'A: Goedemorgen! Hoe gaat het met je? Je ziet er een beetje moe uit.\nB: Goedemorgen. Ja, het is momenteel erg druk op de afdeling. Ik heb gisteren tot laat doorgewerkt aan het nieuwe project.\nA: Dat is niet best. Ik vind de balans tussen werk en privé de laatste tijd ook erg lastig te vinden.\nB: Precies. Ik werk morgen een dagje vanuit huis, hopelijk kan ik me daar beter concentreren zonder alle telefoontjes.\nA: Dat helpt vaak wel. Vergeet je niet om ook even pauze te nemen en een frisse neus te halen?\nB: Zeker weten. Ik ben van plan om tussen de middag een half uurtje te gaan wandelen in het bos.\nA: Goed idee. Ik ga vanavond direct na het werk naar de sportschool om mijn hoofd even helemaal leeg te maken.\nB: Dat zou ik eigenlijk ook moeten doen. Misschien ga ik morgenavond wel even hardlopen.\nA: Moet je doen! Werk ze nog vandaag en probeer niet te laat te stoppen.\nB: Bedankt, jij ook een fijne werkdag gewenst!',
    questions: [
      { question: 'Waarom werkt persoon B morgen vanuit huis?', options: { A: 'Om op de kinderen te passen', B: 'Om zich beter te kunnen concentreren voor een deadline', C: 'Omdat het kantoor gesloten is', D: 'Omdat hij ziek is' }, answer: 'B' },
      { question: 'Wat gaat persoon B tussen de middag doen?', options: { A: 'Een dutje doen', B: 'Een uitgebreide lunch koken', C: 'Een half uurtje wandelen in het bos', D: 'Boodschappen doen' }, answer: 'C' },
      { question: 'Wat doet persoon A na het werk om te ontspannen?', options: { A: 'Een film kijken', B: 'Naar de sportschool gaan', C: 'Een boek lezen', D: 'Gaan hardlopen' }, answer: 'B' },
      { question: 'Wanneer is persoon B van plan om te gaan hardlopen?', options: { A: 'Vanavond', B: 'Morgenochtend', C: 'Morgenavond', D: 'In het weekend' }, answer: 'C' },
    ],
  },
  {
    id: '4',
    title: 'Introductions',
    dialogue: 'A: Hallo! Volgens mij ben je hier net komen wonen, toch? Ik zag gisteren de verhuiswagen voor de deur staan.\nB: Dat klopt inderdaad! Ik ben Thomas, ik ben dit weekend officieel verhuisd naar nummer veertien.\nA: Welkom in de buurt, Thomas! Ik ben Sophie en ik woon hier al vijf jaar op nummer twaalf, direct naast je.\nB: Aangenaam kennis te maken, Sophie. Het lijkt me een erg gezellige en rustige straat.\nA: Dat is het zeker. Kom je uit de buurt of ben je van ver gekomen voor je werk?\nB: Ik kom uit Utrecht. Ik heb een nieuwe baan gekregen als softwareontwikkelaar hier in de stad, vandaar de verhuizing.\nA: Wat leuk! Utrecht is ook een mooie stad, maar ik hoop dat je het hier snel naar je zin zult hebben.\nB: Dank je wel. Ik moet nog wel even wennen aan de nieuwe omgeving en alle winkels zoeken.\nA: Als je vragen hebt over de beste bakker of supermarkt in de buurt, laat het me dan gerust weten!\nB: Dat waardeer ik zeer, bedankt voor het warme welkom!',
    questions: [
      { question: 'Waar is Thomas naartoe verhuisd?', options: { A: 'Nummer twaalf', B: 'Nummer veertien', C: 'Utrecht', D: 'Amsterdam' }, answer: 'B' },
      { question: 'Hoe lang woont Sophie al in de straat?', options: { A: 'Eén jaar', B: 'Drie jaar', C: 'Vijf jaar', D: 'Tien jaar' }, answer: 'C' },
      { question: 'Wat is het beroep van Thomas?', options: { A: 'Bakker', B: 'Softwareontwikkelaar', C: 'Leraar', D: 'Verkoper' }, answer: 'B' },
      { question: 'Wat biedt Sophie aan Thomas aan?', options: { A: 'Hulp bij het uitpakken', B: 'Informatie over winkels in de buurt', C: 'Een kopje koffie', D: 'Een rondleiding door de stad' }, answer: 'B' },
    ],
  },
  {
    id: '5',
    title: 'Courtesy & Etiquette',
    dialogue: 'A: Pardon, meneer? Neemt u mij niet kwalijk, maar volgens mij laat u zojuist uw sjaal vallen.\nB: Oh! U heeft gelijk, die was ik bijna vergeten. Dank u wel, wat ontzettend aardig dat u het zegt.\nA: Geen dank hoor, het is een mooie sjaal en het is buiten veel te koud om zonder te lopen.\nB: Dat is waar, het vriest bijna. Zeg, mag ik u nog iets vragen? Mag ik er hier misschien even langs?\nA: Natuurlijk, gaat uw gang. Ik zal mijn tas even opzij schuiven voor u. Is dit uw halte?\nB: Ja, ik moet er hier bij het centraal station uit. Nogmaals hartelijk bedankt voor uw hulp.\nA: Graag gedaan hoor, kleine moeite. Heeft u verder alles? Uw paraplu ligt ook nog op de bank.\nB: O jee, wat ben ik vandaag onhandig! Heel erg bedankt dat u zo goed oplet.\nA: Geen probleem, we moeten een beetje op elkaar letten, toch? Een fijne dag nog!\nB: Insgelijks, nogmaals dank en tot ziens!',
    questions: [
      { question: 'Wat liet de meneer vallen?', options: { A: 'Zijn portemonnee', B: 'Zijn sjaal', C: 'Zijn paraplu', D: 'Zijn tas' }, answer: 'B' },
      { question: 'Waar moet de meneer uitstappen?', options: { A: 'Bij het strand', B: 'Bij de markt', C: 'Bij het centraal station', D: 'Bij de bibliotheek' }, answer: 'C' },
      { question: 'Wat lag er nog meer op de bank van de meneer?', options: { A: 'Zijn handschoenen', B: 'Zijn krant', C: 'Zijn paraplu', D: 'Zijn telefoon' }, answer: 'C' },
      { question: 'Wat is de reden dat de sjaal nodig is volgens de vrouw?', options: { A: 'Het regent hard', B: 'Het waait erg hard', C: 'Het vriest bijna', D: 'Het is mode' }, answer: 'C' },
    ],
  },
  {
    id: '6',
    title: 'Dining & Shopping',
    dialogue: 'A: Goedemiddag, welkom! Heeft u gereserveerd of zoekt u een tafeltje voor twee personen?\nB: Goedemiddag. Nee, we hebben niet gereserveerd. Is er nog een plekje vrij bij het raam?\nA: Zeker, loopt u maar mee. Hier is de menukaart. Wilt u alvast iets drinken terwijl u kijkt?\nB: Ja, graag. Voor mij een cappuccino en voor mijn vriendin een glas verse jus d\'orange.\nA: Komt eraan. We hebben vandaag ook een speciale dagschotel met verse vis en asperges.\nB: Dat klinkt heerlijk, maar ik ben vegetariër. Heeft u ook gerechten zonder vlees of vis?\nA: Absoluut. We hebben een erg lekkere risotto met bospaddenstoelen en truffelolie.\nB: O, dat klinkt perfect. Die wil ik graag bestellen. Kan ik na het eten ook met pin betalen?\nA: Natuurlijk, we accepteren alle gangbare pinpassen en creditcards. Zal ik de drankjes vast brengen?\nB: Graag, dank u wel! We kijken nog heel even verder op de kaart voor een voorgerecht.',
    questions: [
      { question: 'Hadden de klanten gereserveerd?', options: { A: 'Ja, voor twee personen', B: 'Ja, bij het raam', C: 'Nee, ze zochten een tafeltje', D: 'Nee, ze kwamen alleen voor een drankje' }, answer: 'C' },
      { question: 'Wat bestelden ze als eerste om te drinken?', options: { A: 'Twee glazen water', B: 'Een cappuccino en verse jus d\'orange', C: 'Twee biertjes', D: 'Thee en koffie' }, answer: 'B' },
      { question: 'Welk vegetarisch hoofdgerecht werd er aangeraden?', options: { A: 'Een salade met geitenkaas', B: 'Groentelasagne', C: 'Risotto met bospaddenstoelen en truffelolie', D: 'Een vegetarische burger' }, answer: 'C' },
      { question: 'Hoe willen de klanten betalen?', options: { A: 'Met contant geld', B: 'Met een cadeaubon', C: 'Met pin (pas of creditcard)', D: 'Ze willen de rekening later betalen' }, answer: 'C' },
    ],
  },
  {
    id: '7',
    title: 'Getting Information',
    dialogue: 'A: Neem me niet kwalijk, kunt u mij misschien vertellen waar de dichtstbijzijnde apotheek is?\nB: Ja hoor, die is hier vlakbij in de winkelstraat. Je gaat aan het einde van deze weg naar links bij het stoplicht.\nA: Is het vanaf daar nog ver lopen? Ik ben namelijk niet zo goed ter been vandaag.\nB: Nee hoor, het is ongeveer twee minuten lopen. De apotheek zit direct naast de grote supermarkt.\nA: Dank u wel voor de duidelijke uitleg. Weet u toevallig ook tot hoe laat ze vanavond open zijn?\nB: Ik geloof dat ze doordeweeks tot zes uur \'s avonds open zijn, maar op zaterdag sluiten ze eerder.\nA: Oh, dan moet ik wel een beetje opschieten. Is er ook een bus die die kant op gaat?\nB: Ja, lijn 5 stopt voor de deur, maar met de bus ben je waarschijnlijk langer onderweg vanwege het wachten.\nA: Dat is een goed punt. Dan ga ik toch maar gewoon lopen. Heel erg bedankt voor uw tijd!\nB: Graag gedaan en ik hoop dat u vindt wat u zoekt. Succes!',
    questions: [
      { question: 'Waar is de apotheek gevestigd?', options: { A: 'Naast de kerk', B: 'In de buurt van het station', C: 'Naast de grote supermarkt', D: 'Tegenover het park' }, answer: 'C' },
      { question: 'Hoe lang is het lopen naar de apotheek?', options: { A: 'Vijf minuten', B: 'Ongeveer twee minuten', C: 'Tien minuten', D: 'Een kwartier' }, answer: 'B' },
      { question: 'Tot hoe laat is de apotheek doordeweeks open?', options: { A: 'Tot vijf uur', B: 'Tot zes uur', C: 'Tot acht uur', D: 'Tot negen uur' }, answer: 'B' },
      { question: 'Waarom besluit de persoon toch te gaan lopen?', options: { A: 'Omdat er geen bussen rijden', B: 'Omdat de bushalte te ver weg is', C: 'Omdat wachten op de bus langer duurt', D: 'Omdat de persoon van wandelen houdt' }, answer: 'C' },
    ],
  },
  {
    id: '8',
    title: 'Daily Life: Bakery',
    dialogue: 'A: Goedemorgen! Wat een heerlijke geur hier binnen. Wat mag het voor u zijn vandaag?\nB: Goedemorgen! Ja, vers brood ruikt altijd zo lekker. Mag ik een half volkorenbrood en vier krentenbollen?\nA: Natuurlijk. Wilt u het brood in dunne of dikke sneetjes gesneden hebben?\nB: Doe maar gewoon normale sneetjes, dat is prima. Heeft u ook nog van die lekkere kaasstengels?\nA: Jazeker, ze komen net vers uit de oven, dus ze zijn nog een beetje warm. Wilt u er een paar?\nB: Doe er daar ook maar twee van. Mijn kinderen zijn er dol op als ze uit school komen.\nA: Dat begrijp ik, ze zijn erg populair. Wilt u verder nog iets? Misschien een klein taartje voor bij de koffie?\nB: Nee, dank u, dat is voor nu wel genoeg. Wat ben ik in totaal aan u schuldig?\nA: Dat wordt dan negen euro en tachtig cent. Wilt u contant betalen of liever pinnen?\nB: Ik betaal liever met de pin, alstublieft. Hier is mijn pas.\nA: Dank u wel. Alstublieft, uw brood en de rest van de bestelling. Een fijne dag nog!\nB: Dank u wel, hetzelfde! Tot de volgende keer.',
    questions: [
      { question: 'Wat voor soort brood koopt de klant?', options: { A: 'Wit brood', B: 'Half volkorenbrood', C: 'Speltbrood', D: 'Maisbrood' }, answer: 'B' },
      { question: 'Hoeveel krentenbollen bestelt de klant?', options: { A: 'Twee', B: 'Vier', C: 'Zes', D: 'Acht' }, answer: 'B' },
      { question: 'Waarom koopt de klant kaasstengels?', options: { A: 'Voor een feestje', B: 'Als lunch voor zichzelf', C: 'Voor de kinderen als ze uit school komen', D: 'Omdat ze in de aanbieding zijn' }, answer: 'C' },
      { question: 'Hoeveel moet de klant in totaal betalen?', options: { A: 'Zeven euro vijftig', B: 'Negen euro tachtig', C: 'Tien euro twintig', D: 'Twaalf euro vijftig' }, answer: 'B' },
    ],
  },
  {
    id: '9',
    title: 'Station Announcement',
    dialogue: '(Omroepstem):\n"Dames en heren, een belangrijke mededeling voor de reizigers richting Utrecht Centraal en \'s-Hertogenbosch.\nDe Intercity van twaalf uur dertien naar Utrecht Centraal vertrekt vandaag niet van perron vier, maar van perron negen. \nIk herhaal: de trein naar Utrecht vertrekt vandaag van spoor negen aan de andere kant van het station. \nDeze wijziging is het gevolg van onverwachte werkzaamheden aan de bovenleiding. \nHoudt u ook rekening met een extra reistijd van ongeveer vijftien tot twintig minuten door een snelheidsbeperking op het traject. \nReizigers voor de tussengelegen stations wordt geadviseerd de stoptrein op spoor zes te nemen.\nOnze excuses voor het ongemak en de vertraging. Kijk voor de meest actuele informatie op de borden in de hal of in de NS-app."',
    questions: [
      { question: 'Naar welke steden gaat de Intercity van 12:13?', options: { A: 'Rotterdam en Den Haag', B: 'Utrecht Centraal en \'s-Hertogenbosch', C: 'Amsterdam en Haarlem', D: 'Eindhoven en Maastricht' }, answer: 'B' },
      { question: 'Van welk perron vertrekt de trein vandaag?', options: { A: 'Perron vier', B: 'Perron zes', C: 'Perron negen', D: 'Perron tien' }, answer: 'C' },
      { question: 'Wat is de oorzaak van de wijziging?', options: { A: 'Een defecte trein', B: 'Werkzaamheden aan de bovenleiding', C: 'Personeelstekort', D: 'Een vorig ongeval' }, answer: 'B' },
      { question: 'Welk advies krijgen reizigers voor tussengelegen stations?', options: { A: 'De bus nemen', B: 'De stoptrein op spoor zes nemen', C: 'Wachten op de volgende Intercity', D: 'Een taxi bestellen' }, answer: 'B' },
    ],
  },
  {
    id: '10',
    title: 'Job Interview',
    dialogue: 'A: Welkom, Thomas. Neem plaats. We hebben je cv bekeken en we vonden je ervaring erg interessant. \nB: Dank u wel. Ik was erg enthousiast toen ik de vacature zag, omdat de taken precies passen bij wat ik zoek.\nA: Goed om te horen. Kun je ons iets meer vertellen over je vorige baan bij het marketingbureau?\nB: Zeker. Ik was daar verantwoordelijk voor de klantenservice en ik hielp bij het organiseren van evenementen.\nA: Dat klinkt als een veelzijdige rol. Wat vind je zelf je sterkste punten in het werk?\nB: Ik ben erg geduldig en ik vind het leuk om oplossingen te zoeken voor moeilijke problemen van klanten.\nA: Dat is een belangrijke eigenschap voor dit team. En hoe ga je om met werken onder tijdsdruk?\nB: Ik blijf meestal vrij rustig en ik maak altijd een duidelijke planning om het overzicht te bewaren.\nA: Helder. We hebben nog een paar andere kandidaten, maar je hoort uiterlijk vrijdag meer van ons.\nB: Hartelijk dank voor het gesprek en ik kijk uit naar uw reactie!',
    questions: [
      { question: 'Waarom heeft Thomas gesolliciteerd?', options: { A: 'Omdat hij een hoger salaris wil', B: 'Omdat de taken passen bij wat hij zoekt', C: 'Omdat zijn vorige bedrijf failliet ging', D: 'Omdat het dicht bij zijn huis is' }, answer: 'B' },
      { question: 'Wat was de vorige rol van Thomas?', options: { A: 'Manager in een kledingwinkel', B: 'Verantwoordelijk voor klantenservice en evenementen', C: 'Softwareontwikkelaar', D: 'Administratief medewerker' }, answer: 'B' },
      { question: 'Wat noemt Thomas als zijn sterkste punt?', options: { A: 'Snelheid van werken', B: 'Geduld en het zoeken naar oplossingen', C: 'Creativiteit', D: 'Leidinggevende capaciteiten' }, answer: 'B' },
      { question: 'Wanneer hoort Thomas uiterlijk iets over de uitslag?', options: { A: 'Morgen', B: 'Woensdag', C: 'Vrijdag', D: 'Volgende week maandag' }, answer: 'C' },
    ],
  },
  {
    id: '11',
    title: 'At the Doctor',
    dialogue: 'A: Goedemorgen, komt u verder en ga maar zitten. Waarmee kan ik u vandaag helpen?\nB: Goedemorgen dokter. Ik voel me de laatste paar dagen echt niet lekker. Ik heb veel hoofdpijn en ook koorts.\nA: Dat klinkt vervelend. Heeft u naast de hoofdpijn ook nog last van andere klachten, zoals hoesten of keelpijn?\nB: Ja, mijn keel doet ook behoorlijk pijn, vooral als ik iets moet eten of drinken.\nA: Begreep ik. Sinds wanneer heeft u deze klachten precies? Is het gisteren begonnen of al eerder?\nB: Het begon eigenlijk afgelopen dinsdagavond met een lichte verkoudheid, maar gisteren werd het veel erger.\nA: Ik zal even uw temperatuur meten en in uw keel kijken. Kunt u uw mond ver openen en \'aa\' zeggen?\nB: Aa... Is het een gewone griep of denkt u dat het iets anders is?\nA: Uw keel ziet er inderdaad erg rood en ontstoken uit. Ik adviseer u om veel rust te nemen en genoeg water te drinken.\nB: Moet ik ook medicijnen nemen of gaat het vanzelf over?\nA: Ik zal u een recept voorschrijven voor een kuur en u mag paracetamol gebruiken tegen de pijn en de koorts.\nB: Dank u wel dokter. Ik hoop dat ik me snel weer wat beter voel.',
    questions: [
      { question: 'Wat zijn de belangrijkste klachten van de patiënt?', options: { A: 'Buikpijn en misselijkheid', B: 'Hoofdpijn, koorts en keelpijn', C: 'Een gebroken arm', D: 'Rugpijn en vermoeidheid' }, answer: 'B' },
      { question: 'Sinds wanneer heeft de patiënt klachten?', options: { A: 'Sinds vanmorgen', B: 'Sinds gisteren', C: 'Sinds afgelopen dinsdagavond', D: 'Sinds een week' }, answer: 'C' },
      { question: 'Wat is het advies van de dokter?', options: { A: 'Direct naar het ziekenhuis gaan', B: 'Veel rust nemen en genoeg water drinken', C: 'Gaan sporten om fitter te worden', D: 'Minder slapen' }, answer: 'B' },
      { question: 'Wat schrijft de dokter voor?', options: { A: 'Alleen een hoestdrank', B: 'Een recept voor een kuur en paracetamol', C: 'Een doorverwijzing naar de fysiotherapeut', D: 'Niets, het gaat vanzelf over' }, answer: 'B' },
    ],
  },
  {
    id: '12',
    title: 'Neighbours',
    dialogue: 'A: Hoi buurvrouw! Wat leuk dat ik je tref. Ik wilde je even bedanken voor het aannemen van mijn pakketje gisteren.\nB: Hoi! Geen probleem hoor, het is een kleine moeite. Ik was toch de hele middag thuis aan het werk.\nA: Ik zag het briefje van de bezorger in de bus liggen. Was het een groot pakket of viel het mee?\nB: Het is een vrij grote doos, dus ik heb hem maar even in de gang gezet zodat hij niet in de weg staat.\nA: Super, bedankt! Ik was even snel naar de supermarkt en ik had de bezorger net gemist, geloof ik.\nB: Ja, hij was er rond drie uur. Zeg, heb je trouwens al gehoord van de buurtborrel die volgende week georganiseerd wordt?\nA: Nee, daar wist ik niets van! Wat een leuk initiatief. Waar wordt het gehouden?\nB: Gewoon hier op het pleintje aan het einde van de straat. Iedereen neemt zelf wat te drinken en wat hapjes mee.\nA: Wat gezellig, ik zal kijken of we tijd hebben om ook even langs te komen.\nB: Leuk, ik hoop jullie daar te zien! Kom je je pakketje nu even ophalen of zal ik het later brengen?\nA: Ik kom nu wel even mee, dan hebben we dat ook weer geregeld. Tot zo!',
    questions: [
      { question: 'Waarom bedankt de buurman de buurvrouw?', options: { A: 'Voor het lenen van gereedschap', B: 'Voor het aannemen van een pakketje', C: 'Voor het oppassen op de hond', D: 'Voor de uitnodiging voor een feestje' }, answer: 'B' },
      { question: 'Hoe laat kwam de bezorger ongeveer?', options: { A: 'Om twaalf uur', B: 'Om drie uur', C: 'Om vijf uur', D: 'Om acht uur \'s avonds' }, answer: 'B' },
      { question: 'Wat is de \'buurtborrel\'?', options: { A: 'Een vergadering over de veiligheid', B: 'Een gezellige bijeenkomst op het pleintje', C: 'Een schoonmaakactie in de straat', D: 'Een verjaardagsfeestje van de buren' }, answer: 'B' },
      { question: 'Wat moeten mensen zelf meenemen naar de buurtborrel?', options: { A: 'Alleen stoelen', B: 'Een goed humeur', C: 'Drinken en hapjes', D: 'Niets, alles wordt geregeld' }, answer: 'C' },
    ],
  },
  {
    id: '13',
    title: 'Leisure: Football',
    dialogue: 'A: Hey Mark! Heb je zin om aanstaande zaterdagmiddag mee te gaan naar de voetbalwedstrijd in het stadion?\nB: Ja, hartstikke leuk! Ik heb al een tijdje geen live wedstrijd meer gezien. Wie spelen er eigenlijk tegen elkaar?\nA: Het is de kraker tussen Ajax en Feyenoord, de klassieker! Ik heb via mijn werk twee kaartjes kunnen regelen.\nB: Wauw, dat zijn meestal de spannendste wedstrijden van het jaar. Hoe laat begint de aftrap precies?\nA: De wedstrijd begint om half drie, maar ik wilde er eigenlijk al wat eerder zijn voor de sfeer rond het stadion.\nB: Goed idee. Zullen we rond twee uur afspreken bij de hoofdingang onder het grote scherm?\nA: Ja, dat is een prima plek. Zullen we daarna ook nog ergens een biertje gaan drinken om de uitslag te vieren?\nB: Absoluut, hopelijk winnen we dit keer! Hebben ze daar ook een plek waar we wat kunnen eten?\nA: Ja, er zitten genoeg cafeetjes en snackbars in de buurt, dus dat komt helemaal goed.\nB: Top, ik zet het direct in mijn agenda. Ik heb er nu al onwijs veel zin in!\nA: Ik ook! Dan zie ik je zaterdag bij het stadion. Tot dan!',
    questions: [
      { question: 'Naar welke voetbalwedstrijd gaan ze?', options: { A: 'PSV tegen AZ', B: 'Ajax tegen Feyenoord', C: 'Nederland tegen Duitsland', D: 'Real Madrid tegen Barcelona' }, answer: 'B' },
      { question: 'Hoe laat begint de aftrap van de wedstrijd?', options: { A: 'Om één uur', B: 'Om twee uur', C: 'Om half drie', D: 'Om vier uur' }, answer: 'C' },
      { question: 'Waar spreken ze af?', options: { A: 'Bij het station', B: 'In een café in de buurt', C: 'Onder het grote scherm bij de hoofdingang', D: 'Op de parkeerplaats' }, answer: 'C' },
      { question: 'Wat is het plan voor na de wedstrijd?', options: { A: 'Direct naar huis gaan', B: 'Een biertje drinken en wat eten in de buurt', C: 'Gaan sporten', D: 'Naar de bioscoop gaan' }, answer: 'B' },
    ],
  },
  {
    id: '14',
    title: "KNM: King's Day",
    dialogue: 'A: Zeg, ga jij dit jaar nog iets speciaals doen met Koningsdag of blijf je lekker rustig thuis?\nB: Ik ga waarschijnlijk al heel vroeg naar de vrijmarkt in het centrum. Ik hoop daar wat leuke oude boeken en vinylplaten te vinden.\nA: Leuk! De vrijmarkt is altijd zo gezellig, maar je moet er inderdaad vroeg bij zijn voor de beste spullen.\nB: Precies, ik sta om zeven uur naast mijn bed. En jij? Ga je ook nog de stad in of heb je andere plannen?\nA: Ik ga met een groep vrienden op een bootje door de grachten varen. We hebben al oranje versiering en wat drankjes gekocht.\nB: Dat klinkt ook geweldig, zolang het maar droog blijft natuurlijk. Heb je al iets oranjes om aan te trekken?\nA: Zeker, ik heb mijn oude vertrouwde oranje trui en een gekke hoed uit de kast gehaald. Het hoort erbij, hè?\nB: Absoluut, zonder oranje is het geen echte Koningsdag. Vergeet je ook niet om een oranje tompouce te eten?\nA: Goede herinnering! Die ga ik morgen vast bestellen bij de bakker, anders zijn ze overal uitverkocht.\nB: Slim plan. Nou, ik wens je alvast een hele fijne en gezellige dag toe op het water!\nA: Dank je wel, jij ook veel succes met schatzoeken op de markt!',
    questions: [
      { question: 'Wat gaat persoon B doen op Koningsdag?', options: { A: 'Varen op een bootje', B: 'Naar de vrijmarkt in het centrum', C: 'Werken', D: 'De hele dag slapen' }, answer: 'B' },
      { question: 'Hoe laat wil persoon B opstaan?', options: { A: 'Om zes uur', B: 'Om zeven uur', C: 'Om acht uur', D: 'Om negen uur' }, answer: 'B' },
      { question: 'Wat gaat persoon A doen op Koningsdag?', options: { A: 'Ook naar de vrijmarkt', B: 'Met vrienden varen door de grachten', C: 'Een taart bakken', D: 'Een voetbalwedstrijd kijken' }, answer: 'B' },
      { question: 'Waarom gaat persoon A morgen al naar de bakker?', options: { A: 'Voor gewoon brood', B: 'Om oranje tompoucen te bestellen', C: 'Voor appelflappen', D: 'Om de krant te halen' }, answer: 'B' },
    ],
  },
];
