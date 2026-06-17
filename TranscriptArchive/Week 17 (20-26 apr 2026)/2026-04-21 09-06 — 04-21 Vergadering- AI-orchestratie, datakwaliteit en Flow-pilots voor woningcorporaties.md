---
title: "2026-04-21 09:06 — 04-21 Vergadering: AI-orchestratie, datakwaliteit en Flow-pilots voor woningcorporaties"
date: 2026-04-21
time: "09:06"
duration_min: 45
plaud_id: e80c347fb42569af19a0258186729b8f
source: plaud
---

# 2026-04-21 09:06 — 04-21 Vergadering: AI-orchestratie, datakwaliteit en Flow-pilots voor woningcorporaties

- **Datum:** 2026-04-21 09:06
- **Duur:** 45 min

---

## Vergaderinformatie
> Datum: 2026-04-21 11:06:15
> Locatie: [Voeg locatie in]
> Deelnemers: [Gerrit Jan van Tilburg] [Marco Valk] [Gerbert Kooij]
## Samenvatting
- Onderwerp: Druk op corporaties en rol van AI
  - Corporaties hebben te maken met stijgende verwachtingen en complexere wet- en regelgeving. Medewerkers missen vaak overzicht en werken met Excel-lijsten, veel doorklikken en post-its.
  - Doel is werkdruk verminderen en tijd vrijmaken voor goed huurderscontact.
  - AI automatiseert routinetaken, versnelt processen en biedt betere inzichten; combinatie van assistentie (Co-Pilot) en processturing (Flow) verlaagt complexiteit en ondersteunt medewerkers.
- Onderwerp: Datakwaliteit als basis voor AI-waarde
  - AI vereist gestructureerde, consistente data; betere processen leveren betere data en versterken een vliegwieleffect.
  - Relevante domeinen: Customer (huurder), Property (vastgoed), Operations (bedrijfsvoering), Insights (sturing/verantwoording).
  - Investeren in datakwaliteit en procesverbetering vergroot de effectiviteit van AI.
- Onderwerp: Orchestratie van verhuurmutaties met Flow en AI
  - Huurderopzegging als voorbeeldproces: voorkant (opzegging) en achterkant (nieuwe verhuring) zijn duidelijk, complexiteit zit in afstemming ertussen.
  - Flow prioriteert acties per team/gebruiker, bewaakt SLA’s en brengt werk naar de medewerker; veel controles/acties zijn te automatiseren.
  - Ideaalproces: bij 60%-80% standaardcases resteert akkoord op bevestigingsbrief en eindafrekening, terwijl Flow interne stappen triggert; medewerkers krijgen tijd voor waardevol klantcontact.
- Onderwerp: Co-Pilot en Flow in daily operations
  - Co-Pilot als digitale assistent beantwoordt vragen, geeft werkinstructies, ontsluit kennisbanken en biedt context in CRM (rechterzijbalk): tijdlijnsamenvatting, open taken, sentimentanalyse; voorbeeld “extra sleutel”-vraag.
  - Flow organiseert end-to-end processen met zicht op status, verantwoordelijkheden, persoonlijke werkvoorraad en SLA-sturing.
  - Demonstratie: werkvoorraad toont urgente taken (bijv. aandachtspunten in verhuurmutaties); acties omvatten afstemming met woonconsulent, plannen tweede inspecteur, dossier informeren; inzicht in huurder, woning (locatie, energielabel, bouwjaar) en procesvoortgang direct beschikbaar.
  - Koppelingen naar Property-applicaties (o.a. Brider), woningkaart en 3D digital twin als verdiepingsopties.
- Onderwerp: Best practice procesmodel en integratie
  - Nieuw best practice procesmodel (winterrelease) dient als standaard; voorbeeld: afhandeling huuropzegging met gedefinieerde stappen.
  - Werk wordt naar de medewerker gebracht; volledig overzicht per proces, medewerker of team.
  - Gestandaardiseerde processen versnellen adoptie en optimalisatie met AI.
- Onderwerp: Transparantie, uitlegbaarheid en compliance
  - Voor effectieve AI is inzicht nodig in stappen/controles en besluiten; timeline toont checks (openstaande betalingen, regelingen, leefbaarheidsdossier, beleid, inspecties).
  - Traceerbaarheid en uitlegbaarheid zijn cruciaal; medewerker blijft in control (human-in-the-loop).
  - AVG-vereisten, AI-beleid en kwaliteitsbewaking zijn randvoorwaardelijk om van experiment naar productie te gaan.
- Onderwerp: Microsoft-ecosysteem, agents en MCP-contextlaag
  - Microsoft-ecosysteem borgt machtigingen en rechten op data en documenten; Copilot (Zig/Zicht 365) respecteert toegangsrechten.
  - Kwaliteitsbewaking is essentieel voor productierijpe AI-flows.
  - Data via API’s is kale data; MCP-services voegen context toe (wat kan het systeem vragen/doen, interpretatie). Agents voeren acties uit op basis van deze context in Copilot Flow en andere apps; herbruikbare samenvattingen over klanten beschikbaar in meerdere systemen.
  - Combinatie van standaardagents (o.a. Business Central) en maatwerk via Copilot Studio vergroot toepasbaarheid; Copilot biedt vragen, inzichten en op termijn actie-aansturing.
- Onderwerp: Voorbeeldautomatiseringen
  - Bevestigingsbrief bij huuropzegging: proces triggert “brief nodig”; agent interpreteert natuurlijke taal, bepaalt context, selecteert sjabloon in Business Central en vult data in; brief wordt automatisch gegenereerd.
  - Financiële processtap: eindafrekening controleren, akkoord geven en doorzetten vanuit de processtap, met duidelijke navigatie en verantwoordelijkheden.
- Onderwerp: Stand van zaken AI-initiatieven (Microsoft Red Carpet)
  - Twee jaar deelname met ~15 partners; focus startte op onderhoudsverzoeken (foto/tekst). Lessen: grootste winst zit in end-to-end afhandeling.
  - Pilot bij Lijstromen/Livestream/Livestrom (naam nog te bevestigen) toont tijdswinst; van 20 startende partners zijn er nu 5 met werkende oplossing; onderhoudsverzoek teruggebracht van 20 naar 3 stappen.
  - AI-assistenten in Business Central (kennis- en schrijfassistent) in test; uitbreiding naar datagedreven Q&A (Insights) later dit jaar.
  - Agents in Business Central: standaard en eigen agents (bijv. “opvoeren van eenheden”, “onderhoudsintake”); human-in-the-loop-principe; rechten via machtigingssets; instructies in gewone taal; aanroep via app, API of mailbox (pilots via mailintake).
  - Demo “opvoeren van eenheden”: agent maakt eenheid aan op basis van prompt/context, genereert controlepunten en kan vervolgacties uitvoeren afhankelijk van rechten.
  - Demo “onderhoudsintake” via e-mail: agent registreert verzoek, stelt type/sjabloon/ruimte in, maakt bij volledige info direct onderhoudsorder (DICO-koppeling), controleert huurdersmatch en ondersteunt meertalige intake.
- Onderwerp: Roadmap en uitrol
  - Zomer: eerste Flow-pilots op verhuurmutatieproces; tweede pilot op overlastproces.
  - Samenwerking met klanten (o.a. Domivio) voor prioritering; tweede helft van het jaar: pilots succesvol maken en nieuwe processen oppakken.
  - Langere termijn: meten om bottlenecks te identificeren; AI voor continue verbetering en procestransformatie.
  - Co-Pilot-chat in CRM gepland in voorjaarsrelease; best practice procesmodel in winterrelease.
## Vervolgafspraken
- [ ] Start zomerpilots voor Flow op verhuurmutatieproces
- [ ] Start tweede pilot op overlastproces
- [ ] Verzamelen klantinput voor prioritering volgende processen (samen met klanten, incl. Domivio)
- [ ] Uitbreiden AI-assistent met Insights/data later dit jaar
- [ ] Voortzetten/opschalen pilot bij Lijstromen/Livestream/Livestrom en resultaten delen
- [ ] [Voeg meer in]
## AI-suggesties
> 1. Start en plan datakwaliteitsverbeteringen (domeinen, governance) om het AI-vliegwiel te activeren.
> 2. Definieer kwaliteitsbewakingscriteria/-procedures om AI-flows veilig naar productie te brengen.
> 3. Stel expliciet AI-beleid en AVG-richtlijnen vast voor gebruik van Copilot, Flow en agents in processen.
> 4. Bepaal welke processtappen in de huuropzegging standaardiseerbaar zijn (60%-80%) en welke uitzonderingen handmatig blijven.
> 5. Ontwerp gebruikersdashboard/timeline voor traceerbaarheid van AI-besluiten en controle door medewerkers.
> 6. Plan uitrol van Co-Pilot en Flow (pilotteams, tijdlijn, scope) inclusief trainingsaanpak op best practice procesmodel.
> 7. Bepaal eerste externe applicaties voor integratie via MCP’s en andere koppelingen; leg rechtenbeheer en logging vast.
> 8. Definieer acceptatiecriteria en KPI’s voor pilots (doorlooptijdreductie, foutreductie, werkdruk, HIL-controles, huurderstevredenheid).
> 9. Bevestig correcte naam/contactpersoon van pilotklant (Lijstromen/Livestream/Livestrom).
> 10. Werk scope voor Insights-datakoppeling uit (datadomeinen, privacy-/AVG-implicaties).
> 11. Leg governance vast voor aanmaken/wijzigen van agents en beheer van machtigingssets.
> 12. Maak plan voor training en omzetting van werkinstructies naar agentinstructies en beheer daarvan.

---

## Transcript

[0:03] Gerrit Jan van Tilburg: Dus ook die verwachtingen gaan steeds omhoog. De wet- en regelgeving, nou ja, er zijn natuurlijk echt wel een heel aantal uitdagingen waar we met elkaar wat mee moeten.

[0:18] Gerrit Jan van Tilburg: En waarom kan AI daar dan de oplossing zijn? Uiteindelijk helpt AI met een stukje automatisering. En dat gaan we ook laten zien. En het voordeel daarvan is, uiteindelijk met een stukje automatisering en betere inzichten, Dat we uiteindelijk... Dus met deze uitdaging uiteindelijk toch nog de tijd overhouden en misschien wel meer tijd overhouden om die huurder echt goed te kunnen helpen.

[0:43] Gerrit Jan van Tilburg: Een ander perspectief is even het perspectief van de medewerker. De realiteit van vandaag bij veel corporaties, wij zijn echt de afgelopen twee, drie jaar bij veel corporaties meegesprekken gevoerd. Ook echt naast de medewerker gezeten en wat je ziet. Is dat het toch bij veel mensen een zoekplaatje is. En dat klinkt een beetje negatief. Maar het is gewoon zoeken naar wat is nou het totale overzicht over bijvoorbeeld de verhuurmutaties allemaal.

[1:16] Gerrit Jan van Tilburg: En als je dan een stapje verder gaat. Exceletjes. Hoeveel hebben er niet een Exceletje naast om te kijken van waar staan we nou eigenlijk met alles. Dan belt er iemand met een vraag van een huurder. En dan moet je toch even doorklikken om daar achter te komen waar staat het nou, wie is Er mee bezig. Als je die dan ook nog moet bellen, dan wordt het wel weer een stukje interessanter en dan Zie je in de loop van de dag, zie je het aantal post-its op dat scherm groeien, gewoon met, Dingen die toch nog even moeten. En dat is eigenlijk toch wel de situatie waar veel gebruikers mee te maken hebben en die.

[1:51] Gerrit Jan van Tilburg: Ook, uiteindelijk wil je echt het probleem gaan oplossen van die complexiteit, maar Ook de werkdruk, dan zal je daar wat mee moeten. Dus dat is waar we vandaan komen.

[2:03] Gerrit Jan van Tilburg: Vanuit zich denken wij dat we op deze manier uiteindelijk jullie organisatie echt wel in de versnelling kunnen krijgen. En AI heeft goede data nodig. Daar staat het mee. En met die data kan AI uiteindelijk ook helpen om die processen te verbeteren. Dus je krijgt meer inzicht, je ziet wat werkt, wat niet werkt en van daaruit kan je je processen weer verbeteren. Die processen zorgen weer voor betere data. Meer data, consistentere data en daarmee uiteindelijk gaat die datakwaliteit ook weg op hand.

[2:34] Gerrit Jan van Tilburg: En het mooie daarvan is, en dan zie je ook wel waar het vliegwiel natuurlijk gaat werken, Met die betere data kan AI ook weer beter zijn werk doen. En zo zie je dat je uiteindelijk dus de processen echt gaat in eerste instantie alleen maar verbeteren, Versnellen, maar uiteindelijk ook echt wel transformeren.

[2:53] Gerrit Jan van Tilburg: Hoe vertaalt zich dat dan naar ons landschap? Die gestructureerde data die is gewoon heel essentieel, dus goede gestructureerde data Waar AI zijn werk mee kan doen en dat zit uiteindelijk heel duidelijk voor die klant, in customer, Voor het vastgoed, het pand zit dat in property, de bedrijfsvoering zit in operations en we Hebben insights voor het sturen en verantwoorden. Dat zie je hier dan ook en wat we daaraan toevoegen is dan co-pilot en co-pilot.

[3:25] Gerrit Jan van Tilburg: Ik zeg altijd een beetje flauw is de smierolie tussen al die producten, maar het doet eigenlijk Veel meer. Wat we daar doen is met een stuk AI, met een stuk organisatie uiteindelijk die end-to-end, Processen beter aan te sturen en ook de medewerker in staat te stellen om altijd ook goed te Zien van waar staat iets, wat moet er gebeuren en hoe kunnen we hiermee verder. Co-pilot. Het is daarmee eigenlijk twee dingen. Het is een assistent en dat is ook eigenlijk wat we zometeen zullen gaan laten zien.

[4:04] Gerrit Jan van Tilburg: Een assistent die het mogelijk maakt om ten alle tijde vragen te stellen en uiteindelijk dus die gebruiker te helpen bij de dagelijkse praktijk, de processen, de activiteiten en zo uiteindelijk of het nou kennis is of dat het informatie is uit de systemen. Dat komt daar bij elkaar. Maar dat is niet alles, want uiteindelijk zit je in een proces. Wat je ook wil, is dat dat proces gewoon goed loopt. En daar hebben we Flow voor. Wat Flow doet, is in plaats van losse stappen,

[4:36] Gerrit Jan van Tilburg: Uiteindelijk naar echt een georganiseerd proces, Waarbij Flow gaat helpen om die stappen ook goed door die organisatie heen te halen. Dus gestuurde processen. En zeker zo belangrijk is, in plaats van dat de gebruiker moet gaan kijken waar moet ik wezen, wat heb ik nodig, wie is hiermee bezig, Komt er ook een overzicht van al die processen, waarbij je altijd ziet, waar zit nou de woning in het geval van een verre humanitatie en wie is er nu mee bezig.

[5:13] Gerrit Jan van Tilburg: En zeker zo belangrijk is ook de persoonlijke werkvoorraad en dat gaat Marco nu ook even laten zien. Waarbij je dus uiteindelijk als gebruiker gaat zien van dit is wat er nu nodig is om de SLA uiteindelijk voor die huurder op te brengen. Dus goed te bedienen.

[5:33] Gerrit Jan van Tilburg: Yes. Moet je hem goed horen? Ja.

[5:40] Marco Valk: Dat Was de 1 en 2.

[5:42] Marco Valk: 1 en 3.

[5:52] Marco Valk: Waar had Gerrit Jan het nou net over? Misschien voor sommigen is het al enigszins bekend. Maar, Zicht 365 Co-Pilot. Goedemorgen Marco. Dit is zowel de Co-Pilot, dus de ondersteuner voor de medewerker, als zijn de Flow. Dus het procesgericht ondersteunen van de medewerker in de processen die vooral over de applicaties heen gaan. Het is natuurlijk heel mooi om net gezien te hebben dat wij al die onderdelen van de corporatiemarkt afdekken. Dat gebeurt in verschillende applicaties, want jullie weten zelf ook binnen StixxinProperty.

[6:24] Marco Valk: Hebben wij natuurlijk breider die we aanbieden, we hebben een opname app, het customer gedeelte Is ook niet één applicatie, dus hoe zorgen we nou dat het voor een medewerker heel eenvoudig, Wordt om die processen over die applicaties heen uit te gaan voeren, op een uniforme manier En dat het werk naar de medewerker toegebracht wordt. Enerzijds zorgen wij hiervoor dat de assistent de medewerker ten alle tijde kan ondersteunen, In.

[6:51] Marco Valk: Werkondersteuning als het gaat om, werkinstructies, werkprocessen. Jullie kennen ons best practice procesmodel uiteraard. En die assistent die hier staat, die kunnen we vanuit deze centrale pagina aanroepen. Maar die zullen we ook in de onderliggende pakketten terug zien komen. Dus zo direct in het CRM zullen we zien, een medewerker kan daar in alle tijden even snel een vraag stellen. Over de interne kennisbank, zaken die bij ons op de website staan. En dan bij ons is het bij jullie op de corporatie website bijvoorbeeld. Dus nou, ehm... Ik heb hier wat quick prompts die ik aankoop op hoe plan ik een reparatie inspectie in.

[7:26] Marco Valk: Ik kan mijn chat starten met de assistent. Maak die gebruik van onze werkinstructies, ons best practice procesmodel, eventueel additionele Informatie die jullie op de corporatiewebsite hebben staan, de kennisbank die jullie zelf, Opgesteld hebben. Eerst uit is hoe plan ik een reparatie inspectie in. Staat volledig uitgeschreven.

[7:48] Marco Valk: Het ging niet om een reparatie-inspectie, maar hoe noem ik dit, een reclutatie, en ik Moet blijkbaar heel kort in bewoording zijn, want dat is heel duurzaam, dus ik probeer nog Halve zinnen te schrijven.

[8:05] Marco Valk: Hier word je dus heel erg ondersteund, je kan ook meteen vragen, kan je mij helpen met Specifieke stappen, maar hij linkt ook meteen door naar de procesmodellen of de onderliggende. Dat zullen we zo direct ook even zien als wij in het CRM zitten. Als ik even terug ga naar de assistent, dus de chats die worden gewoon opgeslagen, dus Ik kan altijd terug van wat heb ik gevraagd, wat waren antwoorden die mij ondersteund hebben. Maar hieronder zien wij mijn meest urgente taken.

[8:35] Marco Valk: Dus we zien hier links al mijn werkvoorraad, mijn fair mutaties, dat is het proces waar We nu mee bezig zijn, maar er komen additionele procesplots die we ook gaan ondersteunen. Vanuit die werkvoorraad krijg ik hier direct de meest belangrijke zaken die voor mij belangrijk zijn. Dus vanuit Flow krijg ik hier beoordelen aandachtspunten. Mij wordt gevraagd om binnen het verimutatieproces in een specifieke stap een aandachtspunt te beoordelen. Dat kan van alles zijn natuurlijk. Ik druk erop. En ik krijg hier mijn volledige procesgerichte actie die ik uit moet voeren.

[9:13] Marco Valk: Dus hier gaat het specifiek om. Het beoordelen van een aandachtspunt. De huurder is de veroorzaker in een leefbaarheidsdossier. Stem af met de woonconsulent en beoordeel de noodzaak van het inplannen van een tweede woninginspecteur. Dit kan natuurlijk van alle handen zijn. Hij heeft informatie over alle systemen die jullie hebben. Vooralsnog alle zichtsystemen, maar we hebben Tim natuurlijk net ook al gehoord over de mogelijkheid van MCP's. Het uitlezen van additionele applicaties. Dus dat kunnen we gaan uitkrijgen. Mij wordt gewoon gevraagd om hier additionele actie uit te voeren.

[9:47] Marco Valk: Wat wil ik gaan doen?

[9:50] Marco Valk: Afstemming gehad. Marco kan wel alleen. Kan bijvoorbeeld een actie zijn. En wat wil ik gaan doen? Ik wil hier het lopende dossier informeren. Ik wil toch wel die tweede inspecteur plannen. Of een briefing aan mijn opzegger plannen. Want ik wil het even één op één aan Marco overdragen.

[10:15] Marco Valk: Ik vervolg mijn actie, maar we hadden het natuurlijk al meteen over, ik wil inzicht over de applicaties Heen. Wat is er met deze huurder, waar woont die, wat huurt die, wat is zijn voortgang in dit Hele proces, wanneer heeft die opgezegd, waar sta ik binnen het hele proces. Alles over de verschillende applicaties is direct beschikbaar voor de medewerker hier. Dus direct inzicht in het pand. Waar ligt het, hoe ziet het eruit, vooraanzicht, energielabel, bouwjaar, maar ook direct hebben.

[10:46] Marco Valk: Wij de property oplossing, dus hebben wij Brider. Ik kan ook even direct doorklikken naar de Brider applicatie. Waar ik de woning zie, waar ik de volledige woningkartenthee kan zien, waar ik de ruimtesvoorzieningen, Kan zien, ik kan zelfs even direct, we hebben het natuurlijk vaker gezien, even de 3D digital Twin inzien van de woning. Dit zijn natuurlijk allemaal optionele stappen. Hoe verder je je applicatielandschap uitgebreid hebt, Hoe meer informatie je kan bieden aan je medewerkers. Daarnaast spring ik terug naar.

[11:17] Marco Valk: Co-pilot. Ik zie hier alles over de vertrekkende huurder. Ik zie hier waar staan we in het proces.

[11:25] Marco Valk: De volgende stap is het plannen van de afspraken, het bevestigen van de huuropzegging, Enzovoort enzovoort. Daaronder zien we direct het procesdiagraam. Als het goed is, hebben jullie met de winterrelease gezien dat wij de nieuwe best practice procesmodel gereleased hebben. Ik pak hem er even bij. En dit is natuurlijk wel ons handvat als het gaat om hoe ontwikkelen we deze applicatie. Hoe lopen de processen over onze applicatielandschap heen? Hier is een heel mooi voorbeeld natuurlijk dat we direct zien.

[11:58] Marco Valk: Het afvallen van de huuropzegging. Welke stappen vinden er plaats? Als ik even inzoom.

[12:06] Marco Valk: We gaan zo direct nog heel even zien dat als we de vervolgens stap maken naar bijvoorbeeld Zelf een agent bouwen, zelf een proces optimaliseren, hoe handig is het dat ik het volledig uitgeschreven Proces heb van zich, ook een volledig uitgeschreven werkproces, welke knop moet ik indrukken. Dus daar kan je echt wel zien dat al die jaren dat wij op die best practice hebben gehamerd, Altijd al die jaren dat wij op het standaardiseren van die software gehamerd hebben, dat dat Volledig... Combinatie met AI juist echt een versneller is en dat wij, nou jullie, daarin mee kunnen gaan nemen.

[12:39] Marco Valk: Ik kijk ook heel even met een schuin oog naar de tijd. Ik had ook nog een andere, bijvoorbeeld het Controleren van de eindafrekening. Ik pak mijn actie op, ik kom direct op de processtap waar Ik moet zijn. Dus hier gaat het om het bekijken van de eindafrekening. Die kan ik akkoord geven, Die kan ik doorzetten en mijn processtap is klaar. Dit is de ene manier dat het werk naar ons toegebracht wordt. Anderzijds hebben we natuurlijk mijn volledige werkoverzicht. Als ik hier klik op Ferrumutaties, dan zien wij hier de volledige status van Ferrumutatie.

[13:14] Marco Valk: Overal onze applicaties heen. Dus dat gaat van de huuropzegging, het adverteren tot het aanbieden van die nieuwe verhuring. Ik kan heel eenvoudig zeggen, ik ga naar de 10 huuropzeggingen die op mijn naam staan bijvoorbeeld, Of op het naam van mijn team staan. En hier heb ik bijvoorbeeld weer het controleren van de eindafrekening. Ik kan zien wie er mee bezig was, wie er mee door moet gaan. Ik kan hier eenvoudig filteren op naar medewerkers die hiermee bezig zijn. Dus als ik hier zeg controleren eindafrekening heb ik direct mijn stappen.

[13:46] Marco Valk: Maar dat kan dus ook op medewerker of op teamniveau.

[13:51] Marco Valk: Als we dan heel even het sprongetje maken van we willen natuurlijk niet dat... Een additionele applicatie gaat worden waar iedereen continu in moet navigeren. Ik heb heel even mijn co-pilot chat nodig, want ik wil even over de Zich applicaties weten wat ik uit moet gaan voeren. Deze chat, zoals we die hier hebben, op het moment dat ik bijvoorbeeld naar het CRM navigeer, Ik heb hier alle applicaties die ik als corporatie afneem van zich hier inzichtelijk. Druk op het CRM.

[14:21] Marco Valk: Ik kom op mijn werkvoorraad, maar als ik even doorklik naar mevrouw P. Roelofs.

[14:28] Marco Valk: In de rechterbar, en dat is nu in het voorjaarsrelease, is die ook beschikbaar gekomen. Dan zien wij ook, ik zie al heel even een signalering die hier betrekking heeft. Dan zien wij direct dat diezelfde kopale chat ook voor de medewerker direct in het CRM beschikbaar is. En die kan echt wel gaan helpen als assistent in het ondersteunen van... Het afhandelen van taken die ik hier bij deze persoon heb. Maar als ik hier bijvoorbeeld zeg, huurder wil een extra sleutel.

[15:08] Marco Valk: Altijd even om de lach eens op de hand te krijgen.

[15:22] Marco Valk: Nou jongens, 10 minuten geleden deed ik het nog, dat zal je altijd zien, ik zal hem erover Bijmaken. Een vervolg wat wel heel erg leuk is, daarboven hebben we de assistent die de medewerker direct, Ondersteunt. Daarnaast heb je direct de samenvatting van de tijdlijn, we hebben natuurlijk binnen, Het CRM, we krijgen heel veel taken binnen, acties die uitgevoerd worden, acties die huurders, Uitvoeren binnen het huurdersportaal. De medewerker heeft direct even een overzicht van de meest belangrijke zaken die uitgevoerd zijn, of actief openstaan, waar hij misschien op moet handelen.

[15:57] Marco Valk: Hij kan direct zien van wat is het sentiment van die huurder. Het is natuurlijk heel fijn om te weten, ik open een zaak, hebben we veel geschillen gehad met die huurder, is hij vaak negatief aan de telefoon. Hier zien we direct, op zich neutraal, prima. Ik ga zo wel even kijken als Gerrit Jan verder gaat, of ik mijn chat nog aan de praat krijg, Want ik wil natuurlijk nog wel even laten zien dat het werkt, hoe het werkt binnen de verschillende, Applicaties.

[16:22] Marco Valk: Ik neem jullie zo ook nog heel even bij Business Central in, hoe we een agent bouwen, hoe het Daar werkt. Maar ik ga Gerrit Jan even een.

[16:36] Gerrit Jan van Tilburg: Stuk Laten zien.

[16:39] Gerrit Jan van Tilburg: Ja, dankjewel Marco.

[16:47] Gerrit Jan van Tilburg: Ja, dus inderdaad, dit is wat Marco nu net heeft laten zien. Even kijken hoor, de klikker ook nog.

[17:03] Gerrit Jan van Tilburg: Yes.

[17:06] Gerrit Jan van Tilburg: Dus, even, wat hebben jullie gezien? Misschien toch even een stukje duiding. De verhuurmutatie, we hebben nu met name wat Marco heeft laten zien, is de huuroopzegging. En wat je dan ziet, het is een mooi proces voor de huurder en uiteindelijk als je gaat kijken waar zit de complexiteit natuurlijk uiteindelijk binnen jullie organisatie, dat is aan de ene kant natuurlijk die huuropzegging netjes afvangen. Daar zit ook een SLA op, daar heb je gewoon uiteindelijk te zorgen dat je netjes het proces afhandelt. Dat heb je ook weer voor de nieuwe vereniging, waarbij je uiteindelijk weer met die nieuwe huurder te maken hebt.

[17:39] Gerrit Jan van Tilburg: Maar daar zit heel veel tussen. En hoe stem je dus dat goed op elkaar af? Daar zit vaak de uitdaging. Het zit niet zozeer in die voorkant en die achterkant, maar wel hoe zorg je nou dat je precies doorhebt dat je de juiste dingen in de organisatie goed aanzwengelt en dat ook iedereen daar netjes op acteert. Dat is wat je dus eigenlijk ziet in wat dan Flow uiteindelijk doet in de orchestratie. Die pakt dus al die processen, gaat die meepakken en uiteindelijk gaat die zorgen dat de gebruikers of de teams uiteindelijk ook allemaal de juiste acties netjes geprioritiseerd in hun werkvoorraad krijgen.

[18:12] Gerrit Jan van Tilburg: Waardoor je eigenlijk altijd weet dat je met de juiste dingen bezig bent en dus ook die SLA kan maken. Dat is een hele belangrijke. Dus die werkvoorraad en dat overzicht die daarbij komt kijken. En dan die hele afhandeling van die processen. Hij stuurt je gewoon eigenlijk door dat hele proces heen. Die gaan zorgen dat het voor de medewerker echt significant en aardiger wordt. Een ander ding... Wat we ook gezien hebben, is door wat Marco liet zien, is dat in zo'n proces zitten er gewoon heel veel controles, checks, acties om uiteindelijk dat proces verder te brengen.

[18:47] Gerrit Jan van Tilburg: En als je ook gaat kijken in je eigen organisatie, van wat gebeurt er daar zo al, en gewoon eens een keertje zo'n hele proces mee gaat lopen, dan zie je ook hoeveel acties daarin zitten. Dus wat we ook zien hierin, is dat er heel veel potentie zit om dat dus te automatiseren. En dat is precies wat je hier uiteindelijk ziet. Als je dus AI goed inzet, als je dus die processen die je consistent uiteindelijk hebt, Dan kan je gaan zorgen dat met de juiste checks aan de voorkant je precies weet welke acties er in het proces moeten plaatsvinden.

[19:19] Gerrit Jan van Tilburg: En die processen dus ook gewoon keurig netjes op die manier uitvoegen. Eigenlijk komt het erop neer als je de huurder even in het ideale geval in de app zijn huuropzegging laat doen. En het is gewoon een standaard huurder waarvan er toch zo'n 60% of 80% van de opzeggingen wel Op die manier gaan. Dan zal je zien, dan hoef je eigenlijk alleen die bevestigingsbrief nog even akkoord op Te geven. Is alles goed gegaan? Heeft de AI dat ook goed gedaan? En vervolgens heb je nog een afrekening, heb je in wezen je huuropzegging verwerkt. Nou, als op de achtergrond dan flow al die interne processen aanzwengelt en ook zorgt.

[19:54] Gerrit Jan van Tilburg: Dat die dus goed opgepakt worden, dan zie je dat je uiteindelijk een enorm stuk... Werk uiteindelijk weg kan houden. En dat is dan wel weer het mooie, dan krijgt die Medewerker tijd dan met die huurder. Dus te zorgen dat dat allemaal goed komt.

[20:13] Gerrit Jan van Tilburg: Tim heeft hier denk ik al heel goed geprobeerd te duiden dat natuurlijk om AI zijn werk te laten doen, moet je hem ook wel vertrouwen. En dan gaat het niet, Helemaal vanzelf. Dus wat je dan ook ziet en dat is ook... Dus eigenlijk in aanvulling op wat Tim ook al zei, het is dus heel erg belangrijk dat Je dus ook weet wat die AI doet. Nou, Marco die heeft net ook laten zien dat hij die stappen doet, daar zit ook gewoon In die timeline de mogelijkheid dat je precies ziet bijvoorbeeld bij die huuropzegging, op.

[20:44] Gerrit Jan van Tilburg: Het moment dat hij ermee aan de gang gaat, checkt die, zijn er nog openstaande betalingen, Zijn er betalingsregelingen, is er een leefbaarheidsdossier, noem maar op, al die checks die jullie gewoon Standaard doen om te kijken van wat moeten wij met deze eenheid. Als die vrijkomt, wat is het beleid, wat zijn de vervolgstappen, welke inspecties zijn nodig. Al die checks kan die eigenlijk dus voor je gaan doen. Maar je wil wel weten als gebruiker wat die gedaan heeft en welke besluiten die dan heeft. En dat is dus heel cruciaal dat we dat ook doen.

[21:16] Gerrit Jan van Tilburg: Dus de traceerbaarheid, de uitlegbaarheid en uiteindelijk als gebruiker in controle zijn over wat er daadwerkelijk aan die huurder dan gaat. En dan zijn er onder de motorkap natuurlijk nog een heleboel zaken. Het moet natuurlijk ook wel gewoon AVG-technisch op orde zijn. Je hebt ook gewoon een AI-beleid die daarbij komt kijken wat mag er wel en niet. Hier hebben we echt wel een heel groot voordeel dat we op het Microsoft-ecosysteem zitten. Microsoft zorgt toch dat alle machtigingen, alle rechten en dergelijke op zowel de inhoud,

[21:50] Gerrit Jan van Tilburg: Dus de data, maar ook op de documenten en alles gewoon netjes gerespecteerd wordt. Dus als je dan aan de AI vraagt... In dit geval aan Zicht 365 Co-pilot van geef me even wat informatie over de huurder. En je mag niet bij die informatie, dan zie je ook die informatie niet. Dat is dan wel even prettig in dat hele ecosysteem. En kwaliteitsbewaking, dat is ook wel, het is ook leuk om te zien. Jullie gaven het ook wel aan. Heel veel mensen zijn aan het experimenteren, zijn aan het kijken wat kan je ermee. Maar om het dan echt in productie te krijgen en het ook in het proces echt werken te krijgen.

[22:23] Gerrit Jan van Tilburg: Ja, dan gaat kwaliteitsbewaking ook echt wel een ding zijn. En dat is ook waar wij volop mee bezig zijn om dat uiteindelijk mogelijk te maken en te zorgen dat we dit dus ook in productie kunnen gaan gebruiken. Daar kom ik zo nog even op terug.

[22:39] Gerrit Jan van Tilburg: Toch even een heel klein stukje, en ik ga het zeker niet technisch maken, maar toch even een stukje duiding in lijn met wat Tim ook wel deed. Als je dan gaat kijken, Tim noemde het MCP services al, uiteindelijk wat je doet is je hebt al die databronnen. Dus onze applicaties kunnen ook andere applicaties zijn. Met een API kan je eigenlijk al die data eruit halen, maar het is net als met een gebruiker. Als je gaat kijken wat die API uit z'n brugt, dat is gewoon kale data. Wat is nou precies wat? Hoe moet je dat duiden?

[23:09] Gerrit Jan van Tilburg: Daar, in die context, heeft ook de AI nodig. Dat is precies wat die MCP-services doen. Dus die geven gewoon context op die informatie. In die service geef je ook aan wat kan die eigenlijk aan het systeem vragen en hoe moet, Die daar dan mee omgaan. En dat is eigenlijk de eerste. Dan kunnen agents daarmee aan het werk. Die kunnen dus ook acties gaan laten uitvoeren en dergelijke. En als je dat dan vervolgens in Co-Pilot Flow, de assistent of in de andere applicaties weer beschikbaar maakt.

[23:40] Gerrit Jan van Tilburg: Het voorbeeld van Marco ook wel leuk. Als je nou in CRM uiteindelijk ziet dat er dus een samenvatting komt. Diezelfde samenvatting kan je ook gebruiken als je ergens anders in het hele landschap informatie over die klant opvraagt. En dat is dus ook wel de kracht, dat je dus over dat hele landschap heen al die informatie dan kan gaan gebruiken. Nou, gaan we dan nog één tandje preciezer en dieper in dit verhaal. Dan zie je hier aan de onderkant al onze producten.

[24:11] Gerrit Jan van Tilburg: Operations, wat Marco zometeen nog even gaat laten zien, is ook hoe in Business Central agents uiteindelijk kunnen werken. Dat is iets wat Microsoft samen met een aantal partners... Helemaal opgezet heeft, daar waren wij gelukkig onderdeel van, dus daar kunnen we wat van laten Zien hoe dat werkt. Dus je hebt die business central agent, die werkt ook op de business central data. Dan heb je de zig agent, alles waar wij mee bezig zijn, die dus op zowel operations, maar, Ook op alle andere producten werkt en dat moet je uiteindelijk gaan met elkaar gaan.

[24:43] Gerrit Jan van Tilburg: Laten werken. En wat daar in het midden staat, Microsoft Copilot Studio, dat geeft je ook zelf de mogelijkheid. Jullie kunnen dit ook zelf. Uiteindelijk. Dus ook jullie kunnen specifiek voor jullie situatie ook dus zorgen dat je Van die AI gebruik kunt maken, van die data gebruik kunt maken en eventuele acties ook kunt doen. En wat wij Dan uiteindelijk doen is daar overheen zetten we dan die co-pilot, zodat je dus inderdaad die Vragen kan stellen. Maar ook, kijk nu is het nog vooral kennis en inzichten en dergelijke.

[25:15] Gerrit Jan van Tilburg: Maar op termijn ga je daar ook gewoon acties kunnen gaan vragen aan de assistent. Dat je gewoon zegt, ik zit hier nu en ik wil een huuropzegging doen. En dat je aan die assistent vraagt, kan je voor deze huurder de huuropzegging aanwegen. Ook dat soort dingen gaan mogelijk worden. Dus dan zie je hoe krachtig dan op een gegeven moment dat allemaal bij elkaar gaat komen. Nou, een specifiek voorbeeldje van wat Marco net ook liet zien. Ook nog een stukje duiding. Hij liet zien dat je een bevestigingsbrief kan gaan sturen. Hoe werkt dat dan? Dan krijg je uiteindelijk vanuit het proces komt er een trigger van ik heb nu die brief.

[25:48] Gerrit Jan van Tilburg: Uiteindelijk nodig. Dan gaat dus die agent gaat uiteindelijk kijken van waar gaat het Over, wat wordt hier nu gevraagd eigenlijk. Die gaat ook in natuurlijke taal kan die dan, Gaan nadenken over van wat is daarvoor nodig. Die pakt dan vervolgens de actie op om aan, Business Central te vragen van in dit geval voor de opzeggingsbrieven. Welk schabloon past er bij deze vraag, bij deze huurder, bij deze context? En met die schabloon kan hij ook kijken welke data geeft hij dan mee.

[26:20] Gerrit Jan van Tilburg: En dan kan die hele brief keurig netjes uitgespuugd worden.

[26:25] Gerrit Jan van Tilburg: Helemaal specifiek voor die huurder en klaar om te verzenden. Natuurlijk geeft hij de medewerker eerst nog even de kans om er naar te kijken. Maar dat is hoe het uiteindelijk onder de motorkap dan werkt.

[26:37] Gerrit Jan van Tilburg: Met Microsoft zijn we er al een tijdje mee bezig. Twee jaar geleden is het Red Carpet programma begonnen. Dat met 15 partners wereldwijd, business central partners, zijn we daaraan begonnen. Het mooie is, er zijn er in de loop der tijd nog een paar bijgekomen. Wij zijn begonnen met dat onderhoudsverzoek. En vorig jaar, in dezezelfde setting, hebben we de demo gehad van het onderhoudsverzoek. We zijn er initieel eigenlijk vrij klein begonnen, met co-pilot. Die uiteindelijk alleen maar helpt op basis van een foto of een tekst te zorgen dat het onderhoudsverzoek te komen.

[27:12] Gerrit Jan van Tilburg: Dan hebben we dat bij klanten ook getest. En dan zie je uiteindelijk ook dat er meer nodig is. Want waar zit de echte tijd? Dat zit vaak niet op het verzoek. Zeker niet voor de mensen die echt precies weten hoe die hele structuren in elkaar zitten. Hoe die hele bomen in elkaar zitten. Welke aannemers wat doen. Die kunnen dat vrij snel zelf ook wel. Op het moment dat je dus ineens een mail gaat krijgen, een pagina groot, waarbij de huurder ineens denkt van nou ga ik eens even al mijn dingen bij elkaar harken in een brief.

[27:42] Gerrit Jan van Tilburg: Daar kan AI enorm helpen om gewoon veel sneller te zorgen dat er een onderhoudsverzoek komt, dat onderhoudsverzoek vervolgens ook weer doorzetten. Welke opdrachten komen daar dan uit en hoe moet die huurder daar dan wel of niet ook misschien in meegenomen worden. Dan ga je ineens een agent krijgen die dus dan het hele proces ook moet gaan oppakken. We zijn met een eerste versie daarvan bij Lijstromen nu in pilot bezig om dat ook te testen. De eerste resultaten zijn erg leuk. Dus wat dat betreft gaan we vooral ook, ze zijn hier in de zaal trouwens,

[28:14] Gerrit Jan van Tilburg: Dus mocht je nou interesse hebben, ga vooral even checken hoe gaat dat nou. Wat je uiteindelijk ziet is dat we dus daarmee van die 20 partners die hiermee begonnen zijn, Hebben we dat wel mooi als één van de vijf nu werkt. Dat is toch wel weer een hele mooie stap. Het is de maintenance request die je hier links op het scherm ziet. Voor 20 stappen kan je uiteindelijk naar 3 stappen en dat zie je dus eigenlijk op Een heleboel vlakken zie je dat gebeuren. Net zagen we dat ook al met dat.

[28:45] Gerrit Jan van Tilburg: Verhormatatieproces. Wat we nu aan het doen zijn is met die AI assistent, die is daar, die is ook beschikbaar, die zijn we ook aan het testen. Er loopt ook een co-creatie groep daar mee, maar heb je vragen, heb je ideeën, laat het Van ook weten. Dus die kennisassistent, writing assistant, die kan uiteindelijk helpen documenten of teksten te helpen verbeteren of op te stellen. En uiteindelijk, en dat is nog een hele belangrijke om even te noemen, uiteindelijk gaan we later dit jaar ook insights en de hele data daar aan koppelen.

[29:17] Gerrit Jan van Tilburg: Dus dan kan je eigenlijk gewoon ook vragen gaan stellen aan die assistent en dan gaat die dus insight gebruiken om dan ook die informatie op te leveren over of het nou de huurder is.

[29:34] Gerrit Jan van Tilburg: De laatste en dat is Flow. Die hebben we net ook gezien. Van de zomer gaan we de eerste pilots opdraaien. Eerst op het verhubing mutatie proces, tweede proces wat we oppakken is de overlast en we zijn Met de klanten bezig, gewoon ook met Domivio met name bezig, om te kijken van wat zijn dan ook, Processen die we daarna willen oppakken. Dus dit is echt iets, de eerste processen komen dus ook al heel snel.

[30:02] Gerrit Jan van Tilburg: Ik denk dat dat een mooi moment is Marco om nog even wat te gaan bekijken.

[30:47] Marco Valk: Operations. Misschien hebben jullie het en we hadden al verschillende klantvragen daarover. Is het dan een beetje opgevallen bij de eerste agents? Is dat zo'n microfoon? Nu wel.

[31:07] Marco Valk: Zeg operations. Rechtsboven. We hadden al wat klantinput en vragen daarover gekregen. De eerste agents beginnen toonbaar te worden. Dat zijn nog niet de agents die wij ontwikkelen, maar dat zijn de standaard Microsoft agents. Vooralsnog, nou ja, wordt daar nog niet heel veel mee gedaan.

[31:26] Marco Valk: Maar ook in combinatie met wat Gerrit Jan net vertelde, wat we bij Livestream in een pilotversie gedraaid hebben. En ook wat de output is van het volledige red carpet programma. Is dat wel de manier hoe de agents binnen Business Central gaan werken. Rechtsboven zien wij hier in mijn voorbeeldomgeving. Twee agents draaien, eentje voor het opvoeren van eenheden en eentje voor de onderhoudsintakel. Wat hier heel belangrijk is, is dat het werk wat hier staat, actie van mij verwacht.

[31:59] Marco Valk: Dus ik zie hier een tweetje bij het opvoeren van eenheden, blijkbaar heeft iemand eenheden Opgevoerd of geprobeerd op te voeren via de agent en ik moet een actie uit gaan voeren, Om een taak af te ronden, eventueel een taak te controleren. Hier is het altijd van belang dat de human in de loep genomen wordt. Dus we kunnen geautomatiseerd zaken op gaan voeren, moet altijd gecontroleerd worden door Een medewerker. Ik ga het wel even laten zien hoe die agents werken, maar ik denk dat de kracht hiervan Vooral zit in dat zij op een zeker moment, wij kunnen nu agents gaan maken, maar medewerkers.

[32:31] Marco Valk: Of jullie als organisatie kunnen dat zelf ook gaan doen te zijnde tijd. Ik navigeer even naar agents toe. Ik heb er hier twee staan, de onderhoudsintake en het opvoeren van eenheden. Dit is diegene die we gezamenlijk met Microsoft ontwikkeld hebben. En dit is er eentje die een collega van ons in de avonturen gemaakt heeft voor ons. Opvoeren van eenheden, en hier zie je eigenlijk wat het belang is van het Microsoft platform. Enerzijds is het heel eenvoudig om natuurlijk de algemene informatie te geven over de agent.

[33:05] Marco Valk: Daaronder zien we al direct... Dat wij die agent heel erg kunnen gaan beperken in wat ze wel en niet kunnen. Dus wat wij doen is, we maken een algemene agent aan, opvoeren van de eenheden. We geven die een specifieke rechten set. Dus wat mag die agent binnen de applicatie? En dit zijn, zoals je vooral nog ziet, Gewoon de machtigingssets die wij uitleveren. Dus wat een medewerker zou kunnen, dat kan die agent ook en echt niet meer. Daarnaast, daaronder zien wij, Wie binnen de organisatie willen wij u behouden.

[33:36] Marco Valk: Dat is enerzijds de achterkant. Daarboven ligt nog wat gaat zo'n agent doen hoe programmeren wij het, hoe lastig is het om een agent te maken te zorgen dat een agent ook daadwerkelijk uitvoert wat wij willen. Hier linksboven, instructies beheren, ik klik daarop. En hier zie je eigenlijk hoe wij zo'n agent definiëren.

[34:06] Marco Valk: Eigenlijk is het gigantisch eenvoudig, want je zegt niks anders dan in menselijke taal. Je vertelt een klikpad wat hij moet gaan doen, waar hij rekening mee moet gaan houden en hoe hij zich door die applicatie heen moet navigeren. Dus hier gaat het voor het opvoeren van de eenheid. Hij krijgt een input, die ga ik hem zo direct geven uiteraard. En we zeggen open het rolcentrum, navigeer via het lint naar de hoge eenheden, klik in het lint op de knop nieuw. En zo, op basis van de input die wij hebben, gaat hij proberen die eenheid zo volledig mogelijk op te voeren.

[34:36] Marco Valk: Als we dan even terugdenken aan wat ik net liet zien in de online help en de werkinstructies die wij hebben. Dit is in heel veel gevallen niks anders dan die volledige uitgeschreven werkinstructies die wij hebben. Dus willen wij ondersteuning op een bepaald vlak, dan is het bijna werkinstructies kopiëren in een agent zetten. En je kan ermee aan de slag.

[35:00] Marco Valk: Hoe werkt dat dan? Zo'n agent kunnen we voeden vanuit de applicatie zelf. Nou, nu begin. Het gaat nog redelijk houtje-tuintje, maar ik ga het even laten zien. We kunnen het aanroepen via een API, dus we kunnen een mailbox uit laten leveren. Dat is ook hoe wij hem gepilot hebben bij Livestrom, met de andere agent, waarbij gewoon een mailtje binnenkomt. Die wordt door de agent opgepakt en die onderhoudsintake wordt op basis van die informatie aangemaakt. Maar in dit geval kan ik gewoon zeggen, ik wil een taak uitvoeren. Ik zeg bijvoorbeeld aanmaken 1 heden.

[35:35] Marco Valk: Door Mark Valk. Het kan bijvoorbeeld ook op basis van een bijlage. Dus ik heb een excelsheet met de volgende eenheden, ik heb een nieuwbouwproject, dat wil ik opleveren. Ik krijg vanuit de aannemer additionele informatie, maar in dit geval heb ik een hele basale prompt. Maak een bedrijfsruimte aan, adres met de lofcode nummer 4 met bouwjaar 1990.

[35:58] Marco Valk: Redelijk basis. Ik zeg, voor maar uit.

[36:02] Marco Valk: Als we dan heel even teruggaan.

[36:08] Marco Valk: Dan zullen wij zien dat binnen mijn agents, hier aan de rechterkant, enerzijds, dit is taak 14, geloof me maar, dat is echt waar, dat die voor aanmaak agent, dat die daar nu mee bezig is. Hij is actief, dus hij gaat die agent proberen, hij gaat enerzijds interpreteren wat ik als prompt meegeef, anderzijds gaat hij al die stappen gewoon af. Dus hij gaat gewoon stap 1... Dan ging hij naar het rolcentrum, hij ging bij die eenheid naartoe en die gaat hij opvoeren. Daar is hij 1, 2 minuutjes mee bezig, want hij loopt het pad gewoon door, snap ik alles,

[36:40] Marco Valk: Heb ik voldoende informatie. Ik had natuurlijk al heel even eentje aangemaakt, waarbij ik een bepaalde eenheid wilde aanmaken, Dat was een bericht. Maak een bedrijfsruimte aan, prompt wat ik net ook had gegeven. En hier zegt hij eigenlijk ja, die hele taak heb ik afgerond. En ik beloop hem even naar de volgende stap. Hij heeft een nieuwe eenheid aangemaakt, Rijns A4, dat zijn onze buren verderop bij het Nieuwe kantoor. En hij zegt direct, ik heb daar 10 beoordelingsstappen op.

[37:14] Marco Valk: Dus die eenheid heeft hij volledig aangemaakt, je ziet ook Rijns A4, postcode plaats, bedrijfsruimte, Hij pakt meteen het juiste type, in ontwikkeling, in de meer. De gemeente, wijk en buurt is natuurlijk gewoon wat hij op basis van de applicatie toe kan voegen. En zo vult hij alles wat hij kan vullen op basis van wat ik hem meegeef in die input. Ik druk hier op oordelen. Ik ga hier rustig de zaken controleren zoals de agent mij voorgesteld heeft.

[37:49] Marco Valk: En zo kan je natuurlijk gigantisch veel... Oplossingen bedenken waarbij agent je kan gaan ondersteunen in enerzijds Repeterende taken, anderzijds complexe taken. Maar die output die je hier ziet, Dat hoeft niet tot één pagina te zijn. Ik kan direct ook de administratieve eigenaar Opvoeren, heeft de agent recht om die te activeren, kan ik die opvoeren. Ik kan toevoegen aan een cluster. Dus het is maar net hoe ik die agent voordeeven Hier, met welke variabelen en wat die wel en niet mag. Ver hij mij kan gaan ondersteunen. Je ziet eigenlijk hij heeft een redelijke eenheid opgevoerd.

[38:25] Marco Valk: Met heel veel informatie die wij misschien niet eens op basis van het prompt direct zouden gaan, Vullen. Die kan ik natuurlijk hier gaan accepteren. Het huurbeleid pakt hij natuurlijk van wat hebben De andere eenheden ook en zo leert hij ook hoe jullie binnen de organisatie werken. Ik kijk Heel even naar de tijd.

[38:49] Marco Valk: We hebben ook de agent voor het onderhoudsverzoek. Ik zal hem niet helemaal aftrappen, maar ik zal Wel even eentje laten zien hoe hij binnen is gekomen. De mailbox wordt uitgelezen en wat Die agent voor ons gaat doen is niks anders. Ik heb hier het mailtje. Hallo, ik huur een huis Aan Meester de Klerkstraat 79 in Zijns. Het stopcontact in de keuken is kapot. Er staat, Geen stroom op. Kunt u mij helpen? Alsjeblieft. Check. Die agent pakt hem op. Enerzijds gaat hij controleren en je kan natuurlijk, nou ik bedenk hierbij, je kan een foto bijzitten,

[39:22] Marco Valk: Je kunnen bijlagen bijzitten, je kunnen ook twee, drie taken in één mailtje gemeld worden. Wat gaat die applicatie doen? Ik zeg, volgende stap. En hij zegt, ja ik heb een onderhoudsverzoek geregistreerd, maar controleer het toch nog even. Nou, stopcontact in de keuken, dat heeft hij als omschrijving meegegeven. En type is reparatie onderhoud. Nou, voor mijn gevoel klopt dat wel. Ik klik door. Hij heeft direct een reparatie schabloon toegevoegd. Stopcontact, stopcontact herstellen, klopt ook.

[39:54] Marco Valk: Hij stelt de ruimtesoort in. Als het goed is, volgens mij gaf die huurder aan dat het in de, Keuken was. Dat heeft hij direct toegevoegd. Volgende stap, maak een onderhoudsorder aan. In die agent zoals ik hem net liet zien voor het aanmaken van de eenheid, Voor deze agent hebben we helemaal geprogrammeerd. Heb je alle informatie, maak direct. De onderhoudsorde aangemaakt en hij geeft aan voor mij is die taak afgerond.

[40:26] Marco Valk: Ik heb dus alleen, nou ja die orde ligt bij de leverancier via de DICO koppeling, ik heb, Alleen even een controlerende taak in dit hele proces gehad. Hier zijn heel veel leuke scenario's die we ook getest hebben. Een huurder meldt iets en die zegt ik huur hier en hier, groetjes Mark of valk. Op het moment dat dat niet de huurder is. Dan krijg je meteen, nou ja, medewerker, controleer eens even. Ik zie dat de woning gehuurd wordt door Gerrit-Jan van Tilburg en niet door Marco Valk. Klopt dat wel? En zo heeft hij heel veel zaken waar hij op checkt. Taal, dat maakt niet uit.

[40:57] Marco Valk: Op het moment dat de huurder het mailtje in het Pools had gemaild, Kan die intake gewoon die volledige check doen op basis van de Poolse taal Of op het moment dat het mailtje in de Turks binnenkomt.

[41:11] Marco Valk: Zo zie je wel, ik denk dat jullie meteen heel enthousiast worden van de mogelijkheden die dit gaat bieden op het moment dat jullie zelf die agents kunnen gaan bouwen.

[41:26] Marco Valk: Ik word er zelf wel enthousiast van.

[41:49] Gerrit Jan van Tilburg: In ieder geval hoop ik dat we een heel stuk duidelijkheid hebben gegeven over hoe uiteindelijk Dat AI daadwerkelijk echt praktisch in jullie processen, in jullie activiteiten, alles echt Wel gaat helpen. En wat Zich ook aan het doen is om dat allemaal mogelijk te maken. Nog even als een soort van samenvatting over waar we dan staan in dat hele proces. We hebben natuurlijk vorig jaar ook al een aantal van dit soort presentaties gehouden. Daar waren we vooral bezig met de hele architectuur, de hele onderliggende laag.

[42:22] Gerrit Jan van Tilburg: Zorgen dat dit ook überhaupt kan gaan werken. We hebben nu mooie stappen gezet met zowel de assistent als van de zomer wat we met Flo gaan doen. En dan zijn we uiteindelijk vooral nog bezig met automatiseren van bestaande processen. Precies wat Marco zegt, die best practice. En dat gebruiken we om uiteindelijk die processen voor jullie te gaan helpen. En dan is dus nog wel even de vraag, hoe dan verder? Nou, na van de zomer, als we uiteindelijk dan met die pilots aan de gang gaan,

[42:53] Gerrit Jan van Tilburg: Dan zullen we de tweede helft van het jaar daar met name mee bezig zijn om te zorgen dat dat een succes wordt. En zullen we parallel daaraan ook nieuwe processen gaan oppakken. Daar kunnen jullie ook invloed op hebben, want dat doen we met de klanten. Dus we hebben het ook over de prioriteiten, van wat zijn dan de volgende stappen die we daarin kunnen gaan zetten. Dat gaan we doen, dus we zullen steeds meer processen op gaan pakken. We zullen ook elk van die processen steeds verder gaan automatiseren met AI. Zijn we er al? Nee, want uiteindelijk als we die processen echt gaan meten,

[43:23] Gerrit Jan van Tilburg: Dan ga je ook zien waar de problemen zitten. Dan ga je ook zien waar de bottlenecks zitten. Dus neem even het verre mutatieproces, al heel snel gaat al duidelijk worden, Waar zitten nou echt de mogelijkheden om te verbeteren. En daar kan AI ook weer heel mooi gaan helpen. Dus uiteindelijk ben je dus aan een continue verbetering bezig. Maar op termijn gaat dat ook betekenen dat AI echt kan zeggen, wil je het echt anders doen, dan kan het ook op deze manier. En dat is wel waar we naartoe bewegen, waarbij ook die intelligentie van AI op die processen ingezet kan worden.

[43:53] Gerrit Jan van Tilburg: En dan zijn we wel echt aan het transformeren. Dus dat is even in het kort hoe wij naar AI kijken en hoe we jullie daarmee verder gaan helpen. En dan geef ik het stokje graag weer aan Gerbert over.

[44:08] Gerrit Jan van Tilburg: Om jullie dan nog weer even verder te vermaken.

[44:21] Gerbert Kooij: Ja, dankjewel Gerrit-Jan. Nu moet ik de tijd gewoon vol praten, want we moeten nog even switchen naar een andere laptop.

[44:30] Gerbert Kooij: Ja, toch een stukje AI naar praktijk. Het beste centrum in, maar ook eroverheen, over al die applicaties. Een assistent die beschikbaar komt in al die applicaties en dan ook nog een aantal agents Die in jullie processen gaan werken en voor jullie gaan werken. Ho, we hebben storing. Dit is wel heel oud beeld dit.

[44:50] Gerbert Kooij: Dit is als een Mac met Microsoft.

[44:57] Gerbert Kooij: Daar openen ze standaard mee.

[45:00] Gerbert Kooij: Nog even die Mentimeter. Toch nog even een vraag aan jullie. Alles wat jullie vandaag gehoord hebben, of vanmorgen vandaag gehoord hebben...
