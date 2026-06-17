---
title: "2026-05-12 11:01 — MBR Raimond & Kobbe"
date: 2026-05-12
time: "11:01"
duration_min: 51
plaud_id: 4cc73ff94c66fa5c305be76bda150bb3
source: plaud
---

# 2026-05-12 11:01 — MBR Raimond & Kobbe

- **Datum:** 2026-05-12 11:01
- **Duur:** 51 min

---

## Vergaderinformatie
> Datum: 2026-05-12 13:01:54
> Locatie: [Voeg locatie in]
> Deelnemers: [Kobbe van Daatselaar] [Raimond Stokkel] [Speaker 3]
## Vergadernotities
- **Titel: Persoonlijke updates en gezondheid**
  - Raimond was op vakantie met baby en hond nabij Winterswijk; ontspannend maar rustig tempo.
  - Raimond heeft oorontsteking met doorboord trommelvlies; minder pijn, hersteltijd nodig.
  - Informele check-in over welzijn en werkstart na vakantie.
  - **Conclusie**: Geen actie nodig; ter info gedeeld.
- **Titel: Huidige tooling en werkwijze documentatie**
  - Kobbe neemt Teams-meetings op, sync naar OneDrive en maakt weekoverzichten (terugblik zaterdag, vooruitblik zondag).
  - Gebruik van OneNote en Co-Work om informatie te centraliseren en delen.
  - **Conclusie**: Bestaande werkwijze is functioneel en gedeeld met team.
- **Titel: Podcasts en kennisopbouw voor AI-engineering**
  - Raimond volgt AI-gerelateerde podcasts (AI Engineer, The AI Space, Practical AI).
  - Claude downloadt transcripts van Spotify voor analyse.
  - Doel: input voor een development loop rond AI-engineering.
  - **Conclusie**: Inhoud wordt benut om development loop vorm te geven.
- **Titel: Lokale vs. Cloud-gebaseerde AI-Modellen en Hardware**
  - Er is een permissie aangezet ("YOLO-mode") die het mogelijk maakt lokaal AI-modellen te activeren en te draaien.
  - De hardware voor lokaal draaien van modellen werd besproken: Macs met "Unified Memory" (betere GPU-prestaties) en snellere, maar duurdere NVIDIA-opstellingen zoals een "Blackwell".
  - Een kosten-batenanalyse is nodig voor eigen hardware, die bijna 100% benut moet worden om rendabel te zijn. Raimond's laptop heeft te weinig videogeheugen (6 GB).
- **Titel: Bezoek aan RIE en gezamenlijke werksessie**
  - Kobbe was de afgelopen twee weken bij RIE; zij zijn verder in aanpak.
  - Plan om RIE-gasten hierheen te halen voor een tweedaagse: dag 1 “wat doen wij/zij”, dag 2 samenbrengen naar één framework.
  - RIE heeft een agent-framework (policies/guidelines hardening) en werkte met lokale AI (NVIDIA).
  - **Conclusie**: Intentie om frameworks te harmoniseren en AI-first aanpak te alignen. Kernteam (Kobbe, Raimond, Christian, Jonathan) is genoemd.
- **Titel: Productstrategie, Internationalisatie en MVP voor Duitsland**
  - Besloten om een specifiek product (nummer vijf) niet te bouwen.
  - Focus ligt op internationalisatie van het "maintenance domein" (facilitaire managementoplossing) met Duitsland als eerste doelmarkt.
  - Plan is om een MVP in Duitsland te bouwen en lanceren binnen dit jaar, als "stok tussen de deur" voor de ERP-uitrol van Unique.
  - Voor de ontwikkeling wordt een team samengesteld dat "AI-first" werkt.
- **Titel: Development loop en koppeling met DevOps/Jira**
  - Raimond ziet de development loop als haalbaar, met uitdagingen aan de voor- en achterkant.
  - Advies: loskoppelen van DevOps/Jira op feature-niveau en later synchroniseren.
  - Voorbeeld Unique: PO-agent maakt stories, refinement-agent maakt tasks; koppeling met Azure DevOps.
  - **Conclusie**: Richting is om AI-agents voor planning/refinement te benutten en DevOps-koppeling pragmatisch te houden.
- **Titel: DUO-onderwerp en afstemming met Marco**
  - Vragen over DUO worden besproken met Marco in een volgende meeting. Raimond heeft nog geen contact gehad.
  - **Conclusie**: DUO-discussie is doorgeschoven naar gezamenlijke sessie met Marco.
- **Titel: Frontrunners-groep en interne adoptie**
  - Frontrunners-groep is gevormd voor vindbaarheid, kennisdeling en show-and-tells.
  - Kobbe's doel: in Q3 AI-first onboarden van teams voor de producten Overage en CRM.
  - **Conclusie**: Adoptietraject wordt opgezet met focus op Overage en CRM in Q3.
- **Titel: Voorwaarden om te starten (inputpipeline en verificatie)**
  - Raimond mist een inputpipeline met feature-informatie voor start DUO.
  - Focus op verificatie/testen (overleg met Doana geweest). Starten met dit deel kan waarde aantonen.
  - **Conclusie**: Starten met verificatie is mogelijk, maar een inputpipeline is een randvoorwaarde.
- **Titel: Teamcapaciteit en architectuurzorgen (Flow/Frontend/CRM)**
  - Rick Duk signaleert architectuurproblemen in modulaire opzet en frontend-integraties (AI-assistent, ZTS, CRM etc.).
  - Risico: instabiliteit binnen 2 jaar als structuur niet wordt herzien.
  - **Conclusie**: Noodzaak om architectuurposities snel te bepalen en herinrichting op te starten.
- **Titel: Roemenië-hackathon doelstellingen**
  - Volgende week hackathon in Roemenië.
  - Doel: agentic engineers voor Azure DevOps use-cases (omgeving aanvragen, self-repairing pipelines).
  - Opzet: VMs met werkende Copilot CLI om permissie-issues te omzeilen.
  - **Conclusie**: Kickstart om operationele servicevragen agentic af te handelen.
- **Titel: Ervaringen met Claude/Codegen tools, gebruikslimieten en kosten**
  - Raimond experimenteerde met Claude op een groot project (~5000 edits), wat hoge tokenkosten en beperkingen door prompts met zich meebracht.
  - Zorgen over GitHub Copilot pricing-switch per 1 juni (naar token-based facturatie). Kobbe werkt met Jan om Claude toe te voegen aan geaccepteerde applicaties.
  - **Conclusie**: Tooling wordt geformaliseerd; kosten- en governance-impact moet gemonitord worden.
- **Titel: Status en technische aanpak na drop-in feedback**
  - Feedback verzameld en geëvalueerd. Volgende stap is een preview, maar onduidelijkheid over de rol van Robin.
  - Huidige oplossing (Power Automate, Business Central agent) kan geen afbeeldingen verwerken. Alternatief is een losse prompt of externe agent.
  - **Conclusie**: Afbeeldingen via huidige BC-agent niet haalbaar; externe agent is kansrijk alternatief.
- **Titel: Ontwikkeling en Hergebruik van AI-componenten**
  - Het nieuwe team voor de MVP in Duitsland kan onderzoeken hoe bestaande frameworks en de AI-intake hergebruikt kunnen worden.
  - Raimond's "agent" (prompt met tools, data, endpoint) is herbouwbaar maar heeft toegang tot specifieke datastructuren nodig.
- **Titel: Organisatie en coördinatie van AI-initiatieven**
  - Behoefte aan coördinatie ("Robomap") van de vele ideeën. Internationale controleschool is hiermee gestart.
  - Deense partners moeten nog worden toegevoegd.
- **Titel: Planning komende meetings en afstemming**
  - Volgende meeting op de 26e. Voorstel om eerst intern af te stemmen (8-9 juni) om overload te voorkomen.
- **Titel: CRE en bugfix agent workflow**
  - Raimond helpt Jerry met een bugfix agent workflow: team selecteert bug, agent stelt oplossingsplan voor, dan uitvoering en PR.
  - De opzet is generiek toepasbaar en wordt getest met operations en AI frontrunners.
- **Titel: AI-Consumptiemeting, tooling en API Management**
  - Ron werkt aan meting van AI-consumptie. Raimond stelt API Management voor om verkeer te sturen en controle te krijgen (keys, headers, debug-opties).
  - Behoefte aan meting van AI-bijdrage aan code (bv. via tags/comments).
  - Er is een work-around gedeeld met Frits om Copilot-kosten vanaf 1 juni in te schatten.
- **Titel: Ontwikkelprincipes en veranderende rol van ontwikkelaars**
  - AI genereert soms code die niet "clean" is; dit kan via extra prompts verbeterd worden. "Clean code" eisen moeten mogelijk heroverwogen worden.
  - Nieuwe principes voor developers en testers zijn nodig voor effectief werken met AI. Dit leidt tot een onvermijdelijke roltransitie.
## Vervolgafspraken
- [ ] Organiseer tweedaagse sessie met RIE-gasten; plan dagindeling en doelen vastleggen.
- [ ] Bevestig rollen en beschikbaarheid van Christian en Jonathan voor de tweedaagse.
- [ ] Inplannen tweedaagse sessie en bevestigen: 8-9 juni.
- [ ] Plan meeting met Marco om DUO-vragen door te nemen en scope te bepalen.
- [ ] Bepalen of we naar volgende klant gaan of een preview uitbrengen, inclusief duidelijkheid over de rol/status van Robin.
- [ ] Een scope bepalen voor het MVP op basis van reverse engineering van de specificaties.
- [ ] Een multidisciplinair team samenstellen om de MVP "AI-first" te ontwikkelen.
- [ ] Onderzoeken of bestaande AI-componenten (zoals de agent van Raimond) hergebruikt kunnen worden voor het nieuwe project.
- [ ] Beslissen over architectuur voor beeldverwerking: externe agent/MCP versus BC-agent.
- [ ] Opstellen/actualiseren van een “Robomap” voor coördinatie van AI-initiatieven.
- [ ] Namen van Deense deelnemers verzamelen en toevoegen aan de internationale controleschool-robomap.
- [ ] Definieer en implementeer inputpipeline voor feature-informatie (voor DUO/development loop).
- [ ] Start met opzet van verificatie/testframework samen met Doana.
- [ ] Stel architectuursessie op met Rick, Mats, Kiel en Enterprise Architect om frontend/Flow/CRM-integratie te herzien.
- [ ] Bereid Roemenië-hackathon voor: VMs, Copilot CLI, use-cases en tooltoegang.
- [ ] Implementeren van API Management voor het beheren van AI-consumptie en toegang tot endpoints.
- [ ] Implementeren van tagging/metrics om AI-bijdrage aan code te meten in DevOps/Bitbucket.
- [ ] Analyseer impact van GitHub Copilot pricingwijziging per 1 juni en stel kostenbeperkingen in.
- [ ] Kosteninschatting Copilot vanaf 1 juni valideren met token/work-around van Frits.
- [ ] Beoordeel en formaliseer opname van Claude/verwante tools in geaccepteerde applicaties.
- [ ] Plan kennisdeling sessie waarin Raimond ervaringen met Claude-project en loops deelt.
- [ ] Uitwerken en delen van ontwikkel- en testprincipes voor AI-gedreven softwareontwikkeling.
- [ ] Voorbereiden meeting op 26e met agenda en benodigde deelnemers.
- [ ] Doorontwikkelen en uitrollen van de bugfix agent workflow naar andere teams/producten.
- [ ] [Voeg meer in]
## AI-aanbevelingen
> AI heeft de volgende punten geïdentificeerd die niet zijn afgerond of zonder duidelijke acties blijven; let hierop:
> 1.  **Onvoldoende duidelijkheid over DUO-scope:** Zonder afstemming met Marco blijft de development loop-implementatie blokkeren.
> 2.  **Ontbrekende inputpipeline:** Dit belemmert de start van agentic workflows en verificatie; definieer bron, formaat en eigenaarschap.
> 3.  **Architectuurrisico:** De integratie van Flow/frontend/CRM kan binnen 2 jaar tot instabiliteit leiden; urgente besluitvorming over modulair ontwerp is nodig.
> 4.  **Kosten- en governance-risico:** De overgang van GitHub Copilot naar token-based billing vraagt om gebruiksrichtlijnen, limieten en monitoring.
> 5.  **Besluitvorming Hardware:** Er is geen besluit genomen over lokale vs. online AI-modellen. Een kosten-batenanalyse voor eigen hardware staat nog open.
> 6.  **Hergebruik AI-agent:** De specifieke datastructuren die de agent van Raimond nodig heeft, moeten gedefinieerd worden voor hergebruik in het nieuwe project.
> 7.  **Blokkade door onduidelijke rol:** Onzekerheid over de status/rol van Robin blokkeert de beslissing over een preview of volgende klant; wijs een eigenaar aan om dit te verduidelijken.
> 8.  **Architectuurkeuze beeldverwerking:** De keuze tussen de beperkte BC-agent en een externe agent voor beeldverwerking is niet gemaakt; plan een technische beslissessie.
> 9.  **Coördinatie AI-initiatieven:** Verantwoordelijkheden, scope en tijdlijn voor de "Robomap" ontbreken; wijs een coördinator aan en stel een eerste versie op.
> 10. **Meting en kosten:** Meting van AI-bijdrage en kosten blijft ad hoc; definieer uniforme metrics, taggingrichtlijnen en een rapportagecyclus.
> 11. **Ontwikkelprincipes:** Nieuwe ontwikkel/testprincipes zijn genoemd maar niet vastgesteld; organiseer een workshop om deze te formuleren en borgen.
> 12. **Harmonisatie RIE-framework:** Succescriteria en een concreet integratieplan voor het RIE-framework ontbreken nog.

---

## Transcript

[0:07] Kobbe van Daatselaar: Ja, ik heb nu wel een programma waar ik wel werk, dus al mijn teamsmeetings neem ik op. Teamsmeetings neem ik hier op. Ik zink het naar OneDrive en maak er op zaterdag een overzicht van mijn afgelopen weken en op zondag maak ik er een overzicht van de komende weken.

[0:25] Raimond Stokkel: Ja, Maar gewoon met hun app of een eigen flow? Co-work. Ja, co-work, ja precies. Ja, dat is gewoon de co-work. Ja, dat is prima. Dat alles in one note staat en dan kan de co-work overal bij.

[0:46] Raimond Stokkel: Zo, Hoe gaat ie?

[0:48] Raimond Stokkel: Goed ja, de afgelopen week vakantie. Dus dat was wel fijn. Wat blijft er aan toe? Voor het eerst met de baby ook het geluk. Dus we waren in de buurt van Winterswijk op een camping, maar dan op zo'n staartkerkerevent zeg maar. We hebben gewoon met de baby geswommen. Je doet maar één ding, want de hond was ook mee, dus je doet uiteindelijk maar één ding per dag. Dat was voor mij heel geweldig.

[1:11] Kobbe van Daatselaar: Ja, dat wende maar aan, ja. Maar goed,

[1:14] Raimond Stokkel: Het was wel... Slaapjes timen. Het was wel goed. Nou ja, het is prima gewoon een kasteeltje bezoeken. Dat doe je ook voor anderhalf uur. Dat is op zich prima. En de baby vond zwemmen heel erg leuk, dus we zijn wel een paar keer bezig zwemmen met haar. Dat was wel leuk.

[1:30] Kobbe van Daatselaar: Het is een beetje de slaapjes-time en tussendoor kijken wat je kan doen, hè?

[1:33] Raimond Stokkel: Ja, precies. En de hond moest ik ook... Daar was wel een mooie omgeving om hem uit te laten. Dat was eigenlijk wel prima. Even ontspannen. Ik heb nu alleen wel... Ik ben al drie weken verkouden door die kinderdagenvang. Maar nu heb ik ook oorontsteking, dus dat is wat minder.

[1:54] Raimond Stokkel: Ja, is dat vervelend? Nee, het is snel een loopoor geworden, dus mijn trommelvlies is door. Dus dat is op zich fijn, want dan is de pijn weg. Ja. Ja, nu even een weekje wachten en kijken. Ik heb wel vaak, want ik heb heel veel gedoken vroeger, ja vroeger, tot voor kort. Dus ik heb wel vaker last gehad van mijn oren.

[2:13] Raimond Stokkel: Je weet wat het is. Ja, kom maar horen. Dus als ik iets niet hoor, dan is het niet dat ik het niet wil horen, maar misschien ook wel. Ja.

[2:25] Kobbe van Daatselaar: Oké.

[2:27] Kobbe van Daatselaar: En qua werk?

[2:29] Raimond Stokkel: Ja, druk. Ik ben natuurlijk nu weer aan de slag. Ik ben natuurlijk veel bezig geweest met, oh ja, op het moment als ik met de hond liep, Of niet met de hond liep, met podcasts en met name die, je hebt de AI Engineer, je hebt De AI Space, ik ben nu, Claude is voor mij nu transcripts aan het downloaden van Spotify.

[2:53] Raimond Stokkel: Want er zijn een aantal backstatterlijsters die zeggen, ja hier zitten wel elementen in waar we iets aan hebben. Bijvoorbeeld die guy, die Felix Riesberg bijvoorbeeld, die gaat uitleggen hoe hij CloudCode gemaakt heeft. Met zijn metraille team, over hoe ze dat nu doen. En ook Practical AI, dus ik vind steeds mijn podcast, die ook over, nouja, nu dan over, en dan maak ik het weer open, over meer het engineering gedeelte van AI gaan. Daar probeer ik nu al wat slimme dingen uit te halen, die ik dus morgen hopelijk ook kan meenemen in het verhaal van om echt een development loop te gaan bouwen.

[3:33] Raimond Stokkel: Ik denk dat een development loop op zich is denk ik niet eens het moeilijkste, ik bedoel dat ja, een beetje indruk aan het nu ook al, maar vooral aan de voorkant en de achterkant zitten natuurlijk de moeilijkheden.

[3:52] Kobbe van Daatselaar: Ik ben natuurlijk de afgelopen twee weken bij het RIE geweest.

[4:01] Kobbe van Daatselaar: Zij zijn denk ik wel wat verder dan wij zijn.

[4:04] Raimond Stokkel: Ja Ik heb mijn drone er ook over, die heb ik ook over.

[4:07] Kobbe van Daatselaar: En we gaan eigenlijk kijken of we 8, 9 juni... Nee, sorry.

[4:19] Kobbe van Daatselaar: Om hun gasten hier heen te halen.

[4:32] Speaker 3: Ja, geen probleem.

[4:39] Kobbe van Daatselaar: Dan wil ik eigenlijk gewoon.

[4:42] Kobbe van Daatselaar: Jouw rol, Christian en Jonathan, dat zijn volgens mij, Degenen die nu wel hier actief bezig zijn. Ja. Het idee is wel gewoon dat we eventjes dag 1 vertellen wat doen wij en wat doen zij.

[4:54] Kobbe van Daatselaar: Zij hebben al een soort van framework opgebouwd. Ja. En nu wil ik wel gewoon kijken of we dat naar één framework kunnen. Dan kunnen we dag 2 gewoon kijken of we dat ook kunnen omzetten in wat bruikbaars. Oké.

[5:13] Kobbe van Daatselaar: En met name over, een arts heeft een agent framework gemaakt. Om de regions te maken. En daar zit dan, zeg maar, zo'n hardening van alle policies en guidelines en dat soort, Dingen in. Ik denk dat als we die kunnen gebruiken en dan specificaties daarmee kunnen aansluiten, Op wat jij al gemaakt hebt.

[5:29] Raimond Stokkel: Ja, ja, want dat stuk heb ik niet per se inderdaad. Klopt. Ja.

[5:33] Kobbe van Daatselaar: En dan kunnen we dat... Maar ze hebben ook wel een aanpak waarin ze gewoon... Ze doen geloof ik per week of per sprint doen ze een team. Een? Een team. Dat is één van de development teams. Dus ze hebben gewoon...

[5:46] Raimond Stokkel: Ah, Zo ja. Ja.

[5:47] Kobbe van Daatselaar: Ze hebben gewoon dingen uitgedacht, dat hebben ze geproofd, concept. Ze hebben ook met lokale AI een aantal dingen gedaan.

[5:55] Kobbe van Daatselaar: Dus ook kunnen opbouwen, kunnen lokale AI inzetten. Ze hebben zo'n Nvidia ding gekocht.

[6:00] Kobbe van Daatselaar: Ik wil daar gewoon kijken, wat kunnen we daar van elkaar leren. Zorgen dat we alles een beetje op dezelfde manier gaan doen. En in hun aanpak hebben ze dus ook geconviseerd, iedereen gaat hierop over. AI first, dat wordt het gewoon.

[6:17] Kobbe van Daatselaar: We hebben al concrete nieuwe productfeatures mee gebouwd en daar rollen we dat nu eigenlijk Gewoon weer per team uit. Per week of per week. Dus de frontrunnersgroep zoals wij het nu ook hebben gaat eigenlijk gewoon in de teams, Langs. Omdat iedereen op zich denkt dat die aanpak, dat kan bij ons denk ik nog wel wat strakker.

[6:39] Raimond Stokkel: Ja, absoluut. Eens, ja.

[6:42] Kobbe van Daatselaar: Dus Dat wil ik eigenlijk in die twee dagen dan doen.

[6:46] Kobbe van Daatselaar: Ja gaaf.

[6:51] Kobbe van Daatselaar: Een hoop vragen over DUO, dat gaan we morgen wel bespreken denk ik, als Marco er ook bij Is. Ja.

[7:02] Kobbe van Daatselaar: Ben je online met Marco? Niet op DUO?

[7:05] Raimond Stokkel: Nee, ik heb nog geen tijd gehad voor mijn vakantie, toen ben ik met mensen gelopen.

[7:15] Raimond Stokkel: Ja, dus dat moeten we morgen elkaar ook even vinden, dus ik heb dat stuk nog heel even aan de voorkant, heb ik wel wat ideeën over, maar heb ik ook nog even leeggelaten. Maar dat maakt eigenlijk voor de development loop maakt er niet zo heel veel uit.

[7:29] Raimond Stokkel: Want je gaat gewoon tot een itemplan of een requirements MD moet je komen. En wat Ron ook al achtergekomen is, en ik ook, je moet het loskoppelen van DevOps of Jira. Dat is... Dat is altijd het verkeerde niveau staat daar. Dus je wil eigenlijk per, Requirement of per feature, Het ligt ervan hoe je wat je als een feature of een app beschouwt, Per stuk dat je gaat aanpakken met Met Raging, dan wil je eigenlijk zelf het abstractie niveau.

[8:00] Raimond Stokkel: Gaan bepalen. Dat je nou voor een bug kan is dat simpel, is dat wel gewoon één op één met een DevOps item. Maar voor andere stukken ontwikkeling is dat niet. Dat zijn over drie items of vier items. En we... De DevOps heeft het losgelaten en dan later ga je dat wel weer bijwerken met de DevOps.

[8:14] Kobbe van Daatselaar: Ja, Wat ik bij Unique gezien heb is, zij hebben dus een PO -agent en dan hebben ze ook nog een refinement agent. Dus de PO maakt zeg maar de storage en de refinement agent maakt de tasks. Ze heeft het gekocht met Azure DevOps en dan de rest van de workflow pakt die wel die items op.

[8:31] Kobbe van Daatselaar: Maar wat het belangrijkste is, dat zij daaraan hebben is een goede rack agents gebouwd met alle context erin.

[8:43] Kobbe van Daatselaar: Oké, en jij legt nu de focus op operations en ook het duo deel?

[8:53] Raimond Stokkel: Ja, Wat dat betreft, als je er opnieuw over nadenkt dan verandert het weer. Maar je moet ergens een keer gaan starten.

[9:05] Raimond Stokkel: En dat lijkt me inderdaad het goede moment.

[9:12] Kobbe van Daatselaar: Hoe functioneert die frontrunners groep hier intern nu dan?

[9:15] Raimond Stokkel: Die zijn net gevormd. Ik wilde voor mijn vakantie in internet met pop-posts, maar toen kan marketing er ook Er in dat ze ook wel aan haken, zeg maar qua, Een beetje keuring. Maar in principe wat frontrunners dus doen is dat ze vanuit de organisatie kunnen worden gevonden. Dat is niet alleen de tweezelfde mensen altijd. Het is niet lastig vallen, maar gewoon, Bevragen. Maar ook dat ze weten dat ze ook anderen kunnen bevragen en andersom.

[9:43] Raimond Stokkel: Tips en tricks gaan delen en met elkaar onderling dingen gaan bespreken. Maar er staat niks op de planning om te bouwen. We hebben natuurlijk gewoon show en tell, gewoon een meeting. Om de X-tijd.

[9:57] Raimond Stokkel: Maar dat is nu echt het plan.

[10:00] Kobbe van Daatselaar: Ik heb wel een paar ideeën, want het zijn de development managers daarop aangehakt. Die per se. Die hebben het ook wel ingelegd. En ook MT, daar krijg ik allerlei vragen van terug over hoe en wat.

[10:13] Kobbe van Daatselaar: Mijn doel is wel om te zorgen dat we in ieder geval de twee belangrijkste producten waar we veel het meest moeten bouwen, Dat we gewoon in Q3 de teams omborden op een AI-first approach.

[10:22] Raimond Stokkel: Wat zijn de twee producten?

[10:24] Kobbe van Daatselaar: Overage en CRM, dat is waar nu wel de grootste druk op zit.

[10:30] Kobbe van Daatselaar: Dus we hebben wel moeten kijken, misschien willen we dat dan even samen met Chris doen ofzo, Van wat is er daar dan voor nodig om te zorgen dat we gewoon een complete flow ook hebben staan.

[10:37] Raimond Stokkel: Ja, Chris zit er in ieder geval wel in inderdaad.

[10:39] Kobbe van Daatselaar: Ja, maar de herstelling is goed. Ik ben wel vrijblijvend op teams waar we e-access willen maken in Q3.

[10:47] Raimond Stokkel: Ja, het punt is, ik heb er al ideeën over, maar voordat we echt zijn gestart met DUO heb ik ook nog niks aan.

[10:56] Raimond Stokkel: Omdat ik eigenlijk die inputpipeline nog mis met informatie over de features.

[11:02] Raimond Stokkel: Ik heb al wel met Doana gezeten over het tweede deel. Het belangrijke is het verificatiedeel, dus het testen.

[11:11] Raimond Stokkel: Ik heb er wel ideeën over, maar als we daarmee kunnen starten eigenlijk, dan hebben we ook wat draaien. Dat gaat natuurlijk zelf ook verbeteren, maar dan kan je ook vertellen dat het werkt. Ja, je bent een ambitieuzere kant van de taal. Nou ja, het liefst was ik nog ambitieuzer, alleen dat is even hoe vol ook de tijd is met de werkzaamheden ook. Ja. We hebben wel gezegd met Ron ook... Met het beeldteam, omdat we dat wel in je valbouw eruit gaan trekken, in die zin dat je daar geen p.o. meer van bent.

[11:43] Raimond Stokkel: Dat wordt wel een beetje krap allemaal.

[11:47] Raimond Stokkel: En nu is Rick Duk in het flowteam begonnen. Ja, dat wordt wel wat.

[11:56] Raimond Stokkel: Ja, die heeft wel heel goeie ideeën. Is ook slim.

[12:03] Raimond Stokkel: In het Float Team zit er een aantal zichtingen aan te bouwen die veel beter kunnen. Ik zit er niet per se zelf in te bouwen, maar bijvoorbeeld aan Mats wel. Rick ziet dat dit veel beter kan, ook hoe die modules nu onderling liggen. Daar wil ik ook met Kiel en de Enterprise Architect aan haken, dat we dat nu goed gaan neerzetten. Want hij ziet dat het over twee jaar allemaal omvallen gaat. Als we zo door gaan bouwen met bijvoorbeeld een AI-assistent, Lea heeft ook een stuk frontend,

[12:39] Raimond Stokkel: Wat eigenlijk weer bij het ZTS hoort, en daar is dan weer een landing page bij gebouwd, Maar Flo doet weer zijn eigen pagina er aan toevoegen met een module, dat wordt gewoon, Een zooitje. En dan willen we ook nog in het CRM nog iets gaan weergeven, dat gaat in de soep lopen, En dat ziet hij gewoon nu al. Dus ik denk dat hij... Zo snel als we kunnen een goede positie moeten hebben om dat ook aan te kunnen pakken, want dat wil hij ook heel graag.

[13:07] Kobbe van Daatselaar: Oké, dan lopen we daar nog tegenaan dat Mats daar een hele andere beeld op heeft, want dat gebeurt overigens toch wel eens. Nou ja,

[13:12] Raimond Stokkel: Dat wordt wel een uitdaging. Ja, dat gaat met Sjoerd, Arno en Gerrit-Jan gaan dat regelen.

[13:22] Raimond Stokkel: Maar ik vind het wel...

[13:25] Raimond Stokkel: En Rick die werkt ook wel gewoon met AI.

[13:29] Raimond Stokkel: Hij doet het dan voor zichzelf met agents die aan de slag zijn. Dus als hij in een meeting zit, is het geen verloren tijd, want die agents gaan gewoon door.

[13:39] Raimond Stokkel: Dus hij werkt als agent, ik heb hem ook gevraagd om toedeling mee te helpen denken. Maar we moeten even kijken dat we hem nu zo slim mogelijk inzetten.

[13:51] Raimond Stokkel: Maar dat zeg ik wel aan het minst.

[13:54] Speaker 3: Oké, mooi. Ja.

[14:08] Kobbe van Daatselaar: Wat denk je, wanneer gaan jullie nou naar Roemenië of zijn jullie dan volgende week? Volgende week. En dan is het doel, Ron?

[14:15] Raimond Stokkel: Dan gaan we, dat is een hackathon, dan gaan we in principe voor Azure DevOps, die gaan een, Agentic, nou die hebben natuurlijk niet echt development, maar agentic engineers zeg maar. Waarbij dus een soort van service formulier-achtig, ik wil een nieuwe omgeving met die en die versie. En dan moet zo'n agentic engineer gewoon kunnen zien, oké, dat is dus die code en dan moet ik dat erbij houden. Die pipeline moet ik starten en als die faalt, dan gaat hij hem ook weer repareren.

[14:46] Raimond Stokkel: En zo zijn er andere van die service vragen die gewoon door zo'n agentic team kan worden uitgevoerd met de juiste tools.

[14:52] Speaker 3: Ja.

[14:55] Raimond Stokkel: En dan ga je naar self-preparing pipelines toe, of in ieder geval dat ze iets zinnigs kunnen zeggen behalve wat nu als er een pipeline fout, met name een release, is het vaak iets dat in operations niet goed is gegaan, ergens in de code bijvoorbeeld, niet compatible. En dan gaat er aan het eind fout bij DevOps, die komt moeilijk bij de error. En operations wil graag die error hebben, anders kunnen we het niet oplossen. Allemaal van dat soort dingen, dat kunnen we veel slimmer oplossen.

[15:24] Raimond Stokkel: En de bedoeling is nu om ze gewoon een kickstart te geven en we maken een paar VM's, zorgen Dat de Copilot CLI goed werkt op die VM's, zodat je ook niks te maken hebt met permissies Of dat soort dingen. En ik denk dat we dan in tweeënhalve dag echt wel ver komen. En dat ze in ieder geval ook het idee gaan krijgen, want dat kwamen ze zelf ook met de Voorstellen. Ik dacht van ja, je denkt nog te klein, zeg maar. Ja, een log-analyse. Ja, nee, je moet veel verder denken. Hij kan het ook gaan oplossen.

[15:57] Kobbe van Daatselaar: Ben jij nog aan het spelen met Cloth en Codex als je laatste keer kwam hier mee?

[16:03] Raimond Stokkel: Codex nog niet, want dat was net voor mijn vakantie, dus ik denk een beetje zonde om dat nu op te starten. Cloth zeker. Dat is met name dat project van anderhalve week.

[16:15] Raimond Stokkel: Dat is wel vervelend. Twee dingen zijn vervelend, dat je het niet lokaal kan installeren. Dus je kan hem niet op YOLO-modus zetten, zeg maar. Dus je moet elke keer allow-ons doen.

[16:28] Raimond Stokkel: Daar heeft die admin recht voor nodig. Ik heb nu een tooltje gemaakt die klikt voor mij op allowant.

[16:37] Raimond Stokkel: Maar het was wel een uitdaging, want daar gingen we echt wel... Wat heeft hij uiteindelijk gedaan? 5000 edits over de 1400 files. Maar ook die analyse daarvan, we hebben natuurlijk heel veel tokens gekost. Maar het was wel interessant inderdaad, dat je dus elke 5 uur je wekker zet om hem daarna weer een schop te geven.

[16:59] Raimond Stokkel: We hebben er wel een hoop van geleerd ook, met name dat die loopjes, die vallen steeds Op. Maar dat was wel een instant track. Ik ga er nog een keer iets over vertellen.

[17:10] Kobbe van Daatselaar: Ik ben nu wel met Jan bezig geweest om te zorgen dat plot ook toegevoegd wordt aan onze accepted.

[17:18] Kobbe van Daatselaar: Applicaties.

[17:19] Raimond Stokkel: Ja. Je gaat straks wel een issue krijgen denk ik als we een usage-based... Info's ingaan voor GitHub Copilot. Dat kan wel eens...

[17:31] Kobbe van Daatselaar: Ja, ik heb nu... Ja, voor GitHub Copilot. Daar zit nu een cap op, dus die zit op...

[17:38] Raimond Stokkel: Ja, maar dat zijn nog requests. Dat doet niet iedereen even slim. Maar omdat het nu per request is, doe ik gewoon een verzoek steeds. Helemaal uitschrijven. Er zitten gewoon meerdere dingen in. Dus één request is minimaal een half uur bij bezig, maar... Ik weet toch niet hoeveel tokens het kost. Maar als we dat dus gaan omdraaien op 1 juni, dan is het wel per token beest. Dus dan gaat het wel aan te factureren worden. Maar je ziet dat bij al die ontwikkelaars, dat is steeds van de een naar de ander. Dan gaan ze weer niet naar Codex, want dan is daar het meeste te halen. En dan gaan ze weer allemaal terug naar Call of Code.

[18:14] Raimond Stokkel: Maar ik ben dus benieuwd, maar ik heb er maar één slijt over.

[18:18] Kobbe van Daatselaar: Ik heb net wel in ons team dat ActWithout wel dat...

[18:23] Kobbe van Daatselaar: Die permissie aangezet. Sorry? Ik heb net wel in de organisatie die permissie aangezet, dus dat je wel een YOLO-mode, zeg Maar.

[18:34] Raimond Stokkel: Nou, oké.

[18:36] Kobbe van Daatselaar: Volgens mij kan jij het dan ook activeren.

[18:39] Raimond Stokkel: Oké. Ja, dat zou... Heb jij hem niet lokaal staan,

[18:42] Kobbe van Daatselaar: Platcode, nog?

[18:43] Raimond Stokkel: Jawel, ja. Maar dan ga je inderdaad, stel je doet het op die manier, dan zou je...

[18:52] Raimond Stokkel: Of je eigen tools intussen kunt doen. Maar ik heb wel voor die massale bewerking waarvoor ik elke vijf uur mijn wekker moet zetten. Ja, als je dat hier kan doen, dan heb je dat al wel opgelost. Ook qua tokens. En dat kunnen die modellen tegenwoordig ook wel. Die lopen nu een half jaar achter ofzo.

[19:06] Kobbe van Daatselaar: En wat heb jij voor gpu lokaal?

[19:10] Raimond Stokkel: Niet zo interessant denk ik hoor.

[19:19] Kobbe van Daatselaar: We hadden nu deze week test bij Unique gedaan met een M5 Mac.

[19:23] Raimond Stokkel: Ja maar die kun je niet meer met zelf een geheugen kopen. Je kon ze tot een half jaar geleden nog met 512 geheugen kopen ook.

[19:34] Raimond Stokkel: Oh je bedoelt een laptop? Ja. Oh nee ik bedoel zo'n mini.

[19:38] Kobbe van Daatselaar: Nee Het is helemaal van die MacBook, van zo 'n MacBook Pro die ik heb. En die M4 erin zit, maar er zitten er wel 20 GPU's in ofzo.

[19:46] Kobbe van Daatselaar: Omdat ze dat gecombineerd hebben.

[19:48] Raimond Stokkel: Ja, ze hebben daar Unified Memory inderdaad. Dus dan maakt het niet uit of het een videocard is of niet.

[19:57] Kobbe van Daatselaar: En ze hadden ook dat lokale NVIDIA-spul, zeg maar. En dat was wel veel sneller?

[20:07] Raimond Stokkel: Ja, dan hebben ze een BlackBall of zo, of een 5090.

[20:13] Raimond Stokkel: Voor de NVIDIA-kaart, lokaal. Weet je niet.

[20:18] Kobbe van Daatselaar: Nee, gewoon die M5 chip van Apple.

[20:22] Raimond Stokkel: Ja, Ja, ja, oké. Ja, maar je zei, ze hebben ook iets met Nvidia.

[20:26] Kobbe van Daatselaar: Ja, Van Bare Metal gewoon in België gekocht met een lege videokaart erin.

[20:30] Raimond Stokkel: Ja. Ja, want deze laptop heeft maar 6 gig videokaart. Ja, 6 gig. Ja, dan kan ik niet eens GTA 5 verpalen, dus laten we het laten.

[20:42] Kobbe van Daatselaar: Nee, dat is natuurlijk wel het woorden van die Mac zeg maar, is dat je gewoon qua GPU Beter zit.

[20:46] Raimond Stokkel: Ja, want het geheugen is gewoon één pool waar je uit kan werken. Ja, zeker. Ja, absoluut.

[20:52] Kobbe van Daatselaar: En dan kun je natuurlijk lokaal modellen gaan draaien, of inderdaad wat je kan zeggen van, We moeten misschien ergens een stukje ijzer neerzetten met wat GPU's en daar modellen opzetten.

[21:01] Raimond Stokkel: Ja, want dan als je ergens zo'n Blackwell neerzet, weet ik veel, dat is niet goedkoop hoor, Maar met hoeveel hebt dat ding? 96 giga of zo.

[21:11] Raimond Stokkel: Maar dan kun je wel wat draaien inderdaad, maar goed.

[21:18] Kobbe van Daatselaar: Je Vraagt op een gegeven moment de vraag, wat is goedkoop?

[21:21] Raimond Stokkel: Nou, dat is ook nog een ding, want dan moet je hem eigenlijk wel bijna tegen 100% aan gaan benutten.

[21:29] Raimond Stokkel: Want als je al onder de 50 schiet, dan heb je er al geen zin meer. Dan moet je gewoon een berekening maken.

[21:36] Kobbe van Daatselaar: Nee, Je moet echt Q's gewoon gaan bouwen.

[21:37] Raimond Stokkel: Ja, precies.

[21:44] Kobbe van Daatselaar: Ik kan het wel zeggen, ze hadden een voorbeeld gezien, die had voor één story 20 tasks gemaakt en die hadden gewoon 8 reeks in parallel met een task uitgevoerd.

[21:55] Kobbe van Daatselaar: Dat was prima, maar de bottleneck wordt eigenlijk het voorbereidende met het uitvoeren van het code.

[22:09] Kobbe van Daatselaar: Bij Google is het nu zo...

[22:13] Kobbe van Daatselaar: Dat als een regelcode door een mens geschreven wordt, dan moet het een extra proefgestep door, Omdat het potentieel gescheurd is.

[22:26] Kobbe van Daatselaar: Ik zie ook elke dag dingen voorbij komen met bedrijven die mensen aan het vervangen zijn, Door AI enzo. Ik denk voorlopig hebben we nog 8 jaar aan de roadmap in te halen.

[22:37] Raimond Stokkel: Nee, dat zei ik ook. Ik heb ook gevraagd hoe het is gekleed inderdaad, in pre-stalletjes enzo. Zorg maar als je kijkt naar welke ambities we ook hebben. En trouwens, ik heb sinds AI gebruik, ik heb nog niemand gehoord die het minder druk heeft, zeg maar. Nee. Toch is het van AI, zeker nog.

[22:57] Raimond Stokkel: Nee, dus als we dat plan hebben voor Duo, dat kan heel snel natuurlijk, dan moeten we even kijken, is dat inderdaad wat we willen.

[23:09] Raimond Stokkel: Ja, dan moeten we kijken of er iets in de mix handig is.

[23:17] Raimond Stokkel: Met lokale modellen heb ik er nog niet mee gespeeld, want ik heb er geen hand in.

[23:22] Kobbe van Daatselaar: Nee, het zou wel uitkomst kunnen zijn, zeker als het denkwerk en dat soort zaken gewoon door de online modellen gebeurt. Maar het genereren van code is natuurlijk niet zo spannend.

[23:34] Raimond Stokkel: Nee, Wat je nu zegt, hij moet gewoon een analyse doen. Dus gewoon al die regels coden door, akkeren voor iets, op zoek naar iets, en ja, het viel er uiteindelijk nog mee hoor, het was maar 100 RON tokens.

[23:55] Raimond Stokkel: Wat ik had met de RON uitgerekend, het was wel bijna 9 maanden aan mensenwerk.

[24:03] Raimond Stokkel: Dus dat was wel grappig.

[24:04] Kobbe van Daatselaar: Ja, Die refactor van die performance, dat was wel een vette showcase ja. Dat was wel leuk.

[24:09] Raimond Stokkel: Het kan nog beter hoor, maar het was wel leuk.

[24:16] Kobbe van Daatselaar: En die had je in klot gedaan? Klot -kot, Ja.

[24:19] Raimond Stokkel: Ja, maar dat was een beetje mijn eigen schuld. Ik was natuurlijk begonnen met 4.6 opus en die had eerst twee badges gedaan. Ik had allemaal badges gemaakt, omdat ik ja, hij moet wel door. Toen dacht ik, ja, maar nu vertrouw ik het niet meer om niet de andere opus te laten doen. Dus daar heb ik vooral de sub-agents ook weer even opus gebruikt. Daar gaat het wel hard. Maar goed, ik denk ja, ik moet toch gewoon even een weekje dan even doorbijten.

[24:49] Kobbe van Daatselaar: Maar die was nog wel binnen de license, anders stopt die na vijf uur zeg maar.

[24:56] Raimond Stokkel: Nee, ik heb hem gewoon van pak een beet anderhalve week om de vijf uur aangezet. Nou, dan zijn op een gegeven moment je weekly tokens ook op. Nou, dan moest ik even twee dagen wachten. En daarna weer door. Dat is nou één, hè? Ja. Nee, maar dit had veel efficiënter gekund hoor, dus dat is ook een goeie les.

[25:16] Kobbe van Daatselaar: Jij hebt wel een pijagmaat, dat is prima.

[25:21] Raimond Stokkel: Nee, dit kan veel beter. Maar ik dacht op een gegeven moment, nou ga ik het model niet terugzetten. Of agents met zonnetspannen. Ik hou het wel heel erg op opus, want zo ben ik niet helemaal bocht.

[26:01] Kobbe van Daatselaar: We zijn veel bezig geweest met productstrategie en hoe willen we dingen nu gaan aanpakken.

[26:24] Kobbe van Daatselaar: Ik heb net geprofesseerd met de vraag of we dit bouwen en importeren, daar heb ik nee op gezegd, omdat dat zou minstens product nummer vijf zijn in het portfolio. Oh ja, ja.

[26:39] Kobbe van Daatselaar: Vanuit hele productinternationalisatie willen we wel graag dat hele maintenance domein internationaliseren. Nou, willen we dat in eerste instantie naar Duitsland, in Duitsland gaan uitrollen, uit de klanten. Dus ik had dat met Tony besproken. En zij hebben op hun roadmap nog staan om, eigenlijk is het de facility management oplossing, Maar daarin zit ook het element assistente loopproducten gaan bouwen.

[27:10] Kobbe van Daatselaar: We willen eigenlijk wel het MVP gaan bouwen van dat product in Duitsland. In ieder geval in Duitsland omdat we uiteindelijk ook het ERP willen uitrollen in Duitsland van Unique. Dus dan is het ook een soort stok tussen de deur. En we willen, het is ook wel een mooie showcase om iets te bouwen wat we echt met het hele bedrijf moeten maken.

[27:38] Kobbe van Daatselaar: Dus het idee is nu wel om eigenlijk een team vanuit verschillende entiteiten bij elkaar te gaan brengen. En die full focus op dat product te gaan zetten. En zorgen dat we dit jaar een soort MVP kunnen maken die we kunnen launchen in Duitsland. Wat dan ook nuttig en nodig is, want in Denemarken is het sowieso ook nodig. Want onderdeel van de migratie naar Abyssen is ook dit platform. Ja. Dat is wel gaan versnellen. Ik ben al bezig geweest om met alle informatie die ik heb.

[28:09] Kobbe van Daatselaar: En ook van Unicap gekregen om een soort reverse engineering te doen op de specs. Dus het idee is wel om een reverse engineering van die specs te doen, dan een scope te bepalen van wat willen we bouwen. Daar een MVP uit te destilleren en dat met een team AI-first te laten ontwikkelen.

[28:29] Kobbe van Daatselaar: En ik zit ook even te denken aan het harnas dat we bouwen in het framework. Dat we ook in dit jaar betrokken zijn. Of we niet één video hier gewoon als eerste opdracht moeten zetten van gaan we met wat er is, kijken naar hoe we dat kunnen bouwen en het team daarin ondersteunen. En ten tweede, de hele AI intake. Zij zouden in de prototype ook hetzelfde idee kunnen hebben dat wij hebben gekregen.

[28:59] Kobbe van Daatselaar: Dat zou je natuurlijk wel kunnen, dan kan je daar niet een goed... Dat is nou de beste aanpak daarvoor, of kunnen we hergebruiken wat we al hebben in operations En generieken maken, want op zich, daar volgen we ook gewoon aan.

[29:12] Kobbe van Daatselaar: En jij heet je het achter toch, dus het is niet per se helemaal embedded in...

[29:17] Raimond Stokkel: Nee, Ik kan het voor je... Nee, het is super simpel. Dat is juist het mooie ervan, ja.

[29:26] Kobbe van Daatselaar: Nou ja, dus dat is wel een van de initiatieven die we dit jaar wel willen... Het gaat erin dat we het wel dit jaar moeten kunnen afronden in ieder geval.

[29:34] Raimond Stokkel: Ja, want we hebben nu met de customer ook dat het loopt, voor de customer.

[29:43] Kobbe van Daatselaar: Om het te koppelen aan?

[29:45] Raimond Stokkel: Nou, om het te maken, het is niet per se koppelen, je kan het hergebruiken.

[29:52] Kobbe van Daatselaar: En is wat er staat nu een aparte service?

[29:59] Raimond Stokkel: Eigenlijk is het een agent, want het is een prompt met tools, een beetje data en een endpoint.

[30:05] Raimond Stokkel: En dat draait nu toevallig in Business Central, hij zit wel gekoppeld aan de data van de eenheid En de vraagboom en de taken die er bestaan. Dus die moet hij wel hebben, maar waar die vandaan komen moet ik niet weten.

[30:23] Kobbe van Daatselaar: Ja, Dus je moet wel even refinen van welke datastructuur en de vraagboomstructuur. Kijk, uiteindelijk moet er ook wel iets van een catalogje af te komen met...

[30:38] Raimond Stokkel: Hij Heeft een stukje data nodig om te kunnen koppelen van wat hij nou ziet op een foto.

[30:43] Kobbe van Daatselaar: En dat input, haalt hij die nu op uit de bron?

[30:46] Raimond Stokkel: Ja, hij leest het nu gewoon uit de tabel, omdat hij toch al in de operatie draait.

[30:50] Kobbe van Daatselaar: Ja precies, daar zouden we ook een lagere koppeling voor kunnen maken in het bewijsgesprek. Om dan wel twee systemen te kunnen koppelen.

[30:56] Raimond Stokkel: Ja, het is echt niet zo ingewikkeld, je kan het zo herbouwen.

[31:02] Kobbe van Daatselaar: En wat hij nu gebruikt, dat is ook gekoppeld aan de VSI-consumptiemodel van BusinessCenter?

[31:10] Raimond Stokkel: Nee, hij zit aan de Foundry, gewoon een endpoint.

[31:15] Kobbe van Daatselaar: Nog een ander punt, dat is de pocket van de ongename consumptiemeter, waar Ron mee bezig is? Ja. Ben jij ook hard aan het sparten?

[31:23] Raimond Stokkel: Zeker, daar heb ik het al. De oplossing komt niet zomaar uit de lucht vallen via de API-management.

[31:33] Raimond Stokkel: Dat heb ik ook al eerder met JT uit en over gehad, dus dat is gewoon de manier, want uiteindelijk Komt alles bij zijn endpoint terecht. Je hebt verschillende diensten nu kun je een paar headers toevoegen sowieso wil Je eigenlijk niet dat mensen rechtstreeks de Foundry gebruiken, want je kan daarmee Met een key en via API management kun je netjes met enter ID of een eigen key of iets ertussen, Zetten wat je wil.

[32:05] Raimond Stokkel: Nu Kun je zelfs nog makkelijk ook debug meer aanzetten, dat is zo 'n gesprek dat wel wordt Opgeslagen, maar wat je niet altijd wil bijvoorbeeld.

[32:21] Kobbe van Daatselaar: We hebben nu.

[32:24] Raimond Stokkel: De input verzameld bij drop -in. We hebben nu de input verzameld bij drop-in en we hebben de input verzameld bij drop-in. Ik weet eerlijk gezegd niet, het was vlak voor mijn vakantie en we hebben geëvalueerd met de klant.

[32:37] Raimond Stokkel: Ja, dus als het goed is moeten we nu naar de volgende stap, of naar de volgende klant, Of in ieder geval een preview uitbrengen. Maar ik weet niet waar Robin dan in staat, nog.

[32:47] Kobbe van Daatselaar: Maar er zijn niet aanpassingen?

[32:50] Raimond Stokkel: Jazeker, op basis van de feedback. Ten eerste, Ideeën dat we sowieso al hadden en op basis van de feedback. En op basis, nou hij werkt nu natuurlijk alleen nog maar op e-mail. Nou dat moet ook iets bereden gezet worden, maar dat is ook te lossen op een andere manier. Ik heb zin niks met de prom te maken.

[33:08] Raimond Stokkel: Ja, want het werkt nu ook via een Power Automate Flow die een e-mailbox uitleest. Ja, dus het maakt niet uit.

[33:20] Raimond Stokkel: Alleen die Flow zal nooit afbeeldingen gaan kunnen.

[33:26] Raimond Stokkel: Ja, omdat hij gebruik maakt van het agent framework van Business Central. Ja, daar komen geen afbeeldingen in, tenminste niet op de afzienbare tijd.

[33:36] Kobbe van Daatselaar: Net Zoals we dus die lostrackers hadden gehad, dat we net al gehad hadden.

[33:41] Raimond Stokkel: Ja, Dit is de oude variant van mij, die wel met afbeeldingen werkt. Maar dat is gewoon losse prompt inderdaad, met een imagemodel.

[33:49] Kobbe van Daatselaar: Nou, Ik was net over als we die agent eruit willen halen, niet in bc, maar gewoon wel de data uit bc. Dat geeft ook de mogelijkheid om wel afbeeldingen te halen.

[33:57] Raimond Stokkel: Ja, alleen dan ga je niet door de schermen heen klikken, want wat hij nu dus, hij opent Een eenheid, hij zoekt een eenheid, hij klikt op verzoek aanmaken. Dat heb ik allemaal niet, dat moet bij mij allemaal input zijn. Dat kun je ook wel weer oplossen.

[34:15] Kobbe van Daatselaar: Weet je het?

[34:17] Raimond Stokkel: Komt wel, maar voorlopig niet. Als het, Misschien dat ze een connector in Copilot Studio, dat je dat dan reverse-engineerde. Maar wat ze hebben gemaakt is MCP-server, call-configuratie, dus daar kun je het ook mee oplossen.

[34:35] Kobbe van Daatselaar: Ja, Ik kan me even iets voorstellen dat je dat image -wekken is, je moet omzetten naar tekst en dan naar bc 'en schieten.

[34:39] Raimond Stokkel: Ja, dat zou ik daar doen. Nee, ja, dat heb ik geprobeerd, maar dat is niet handig. Als je een image omzet naar tekst, dan verlies je zoveel context. Want als zo'n image-model...

[34:51] Raimond Stokkel: Als je een afbeelding gaat zoeken met een bepaald idee, dat is heel wat anders dan tekst eruit halen. Je verliest zoveel context. Wat je wel kan met de MCP, is dus wat de agent kan in Business Central, Kun je ook een agent die er buiten leeft, die kan dan bij hetzelfde. Je kan gewoon de eenheden als MCP aanbieden, de klant enzovoort. Dus dat kan wel. Dat is ook feitelijk hoe we Wordlink nu hebben opgelost. In plaats van een agent in, hebben we het er nu uit getrokken. Wat denk ik sowieso wel de toekomst wordt.

[35:32] Raimond Stokkel: We vertellen sowieso een split over, AI intern gebruik, Eigenlijk om het te ontwikkelen, misschien zelfs om stories te maken en te testen. Plus AI extern gebruik, dat wordt wel erg veel werk om dat allemaal bij te houden.

[35:46] Raimond Stokkel: Er spelen natuurlijk veel ideeën, nou voor sommige dingen weet ik al veel af. Die mensen in tekenen, die agents kan ik ook wel. Maar ik merk dat er veel initiatief is. Alleen ik kan het niet allemaal in de lucht houden, terwijl ik dat wel zou willen, weet je wel. Al die ideeën waar mensen mee komen, ik wil er ook wel mee helpen. Bijvoorbeeld met support, die op Jira iets zit te doen. Die misschien al dikke code wil gebruiken om een inkomend Jira item te analyseren of te verifiëren. Dat was een goed idee. Nou sprak Arno, die vroeg, en? Ik zeg ja, en wat? Ja, dat idee dat ik had. Oh ja, shit, daar was ik al.

[36:20] Raimond Stokkel: Dus ik ben wel benieuwd of daar straks meer mensen bij gaan opstaan. Dat zal wel heel anders zijn.

[36:26] Kobbe van Daatselaar: Ja, Die Robomap ook een beetje moeten coördineren.

[36:30] Raimond Stokkel: Ja, Dat is wel heel erg fijn, een beetje daar overzicht op krijgen.

[36:37] Kobbe van Daatselaar: En ik denk, we hebben natuurlijk nu één sessie gehad met de internationale controleschool. We moeten daar ook gewoon naar zo'n Robomap komen.

[36:43] Raimond Stokkel: Oh, goed dat je het zegt. Dit vraag ik, wie vanuit onze Deense vrienden moet daar bijzetten?

[36:52] Raimond Stokkel: Ik moet niet nu alle minuten antwoorden, anders moet je het even doorsturen, dat is misschien nog makkelijker zelfs.

[36:58] Kobbe van Daatselaar: Wanneer is die volgende meeting?

[37:00] Raimond Stokkel: Die is over twee weken.

[37:09] Raimond Stokkel: 26e.

[37:13] Kobbe van Daatselaar: Ik denk dat het een beetje information overload wordt, dus ik stel voor dat wij eerst die 8-9 juni even met elkaar doen en dan een lijn op hoe vaak we zijn. Ja, tuurlijk.

[37:35] Kobbe van Daatselaar: Ik neem aan dat je geen tijd meer voor CRE hebt.

[37:38] Raimond Stokkel: Voor CRE. Nee, dat draait ook wel. Ik help Jerry nu wel, want die is ook die bugfix agent workflow aan het inzetten. Dus daar help ik wel mee, maar op de inhoud op dit moment niet inderdaad.

[37:50] Kobbe van Daatselaar: En die bugfix workflow, is dat automatisch oppikken tot aan PR klaarzetten, zeg maar? Is dat wat hij al doet?

[37:57] Raimond Stokkel: Ja, Dus je stopt er een itemnummer in, voor een DevOps item. Pak je die niet zelf op? Inderdaad, nog niet, nee. Naja, nog niet alles. Dat was de eerste signalise van bugs. Wat me trouwens opviel, dat was een paar jaar geleden wel anders. Maar ik had nu met Martin was ik die flow aan het opzetten. En op een gegeven moment hadden we gewoon geen nieuwe bugs meer om mee te testen. Dus dat was wel niet zo. Wat zei jij niet? Nee, van heel operations niet. Oké. Ehm, maar wat wil ik zeggen, is dat omdat we nu, zijn ze die flow aan het testen.

[38:30] Raimond Stokkel: Uit elk team minimaal één, en er sluiten nu ook steeds meer mensen aan. Die kijken overal zelf naar de bug, oké is die goed? En die plakken het itemnummer naar de agent. En die gaat dan een voorstel doen van wat hij wil gaan oplossen. Dan zeg je ja, ga maar naar de slag als dat de goede richting is, zeg maar.

[38:48] Kobbe van Daatselaar: En dan komt hij met een PR?

[38:50] Raimond Stokkel: Ja, maar ik controleer liever een plan dan een PR, eigenlijk.

[38:56] Kobbe van Daatselaar: En is die generiek genoeg om ook voor andere producten in te zetten of is het wel een specifiek gevolg geweest?

[39:02] Raimond Stokkel: Ja, het maken van die agents voor zo'n workflow, dat is een dag. Twee dagen, pak een beet, en daaraan moeten mensen die in de producten werken toch gaan Verfijnen. Dus dat loopje, als die eenmaal snapt en dan zetten we samen de agents neer, dat is geen, Beter werk. Dat is deze.

[39:26] Raimond Stokkel: Als je van het loopje snapt, dit zijn niet de losse agents hoor, maar de instructie is Hoog over vanuit de orchestrator. Gaat het?

[39:36] Raimond Stokkel: Nou zeg, na een week heb je het ook wel getest, zeg maar, met z'n paarden.

[39:44] Kobbe van Daatselaar: Nou, dit is wel bijvoorbeeld dat je zegt, dit kun je gewoon bij andere teams... Je moet wel tijd voor hebben natuurlijk, dat snap ik, maar met andere teams zeg ik...

[39:51] Raimond Stokkel: Ja, Dit is eerst van... Nee, trouwens, in de AI frontrunners eerste meeting heb ik Martin deze laten testen bij operations.

[40:02] Raimond Stokkel: Dus de frontrunners hebt u in ieder geval gezien.

[40:05] Kobbe van Daatselaar: Ja, maar ik bedoel meer... Oké, dan hoe zet het in action dat stuk gaan implementeren? Ja, oké, dat is dan de volgende vraag. Ja.

[40:19] Kobbe van Daatselaar: Hoeveel mensen komen er met zorgen bij?

[40:23] Raimond Stokkel: Ja, zorgen valt gelukkig mee. Die komen allemaal bij Frits en...

[40:29] Raimond Stokkel: Nee, er zijn natuurlijk wel...

[40:32] Raimond Stokkel: Wat ik in het begin van het jaar al zei, als je aan het einde van het jaar nog code klopt met de hand, dan gaat het liefst niet goed.

[40:39] Kobbe van Daatselaar: Dat wilde je eigenlijk eindelijk vertellen.

[40:41] Raimond Stokkel: Ja, maar dat durfde ik toen niet te zeggen, want ik bedoelde eigenlijk, het kan nu al. Alleen dat vond ik een beetje...

[40:51] Raimond Stokkel: Maar goed, als je naar een... Wat doen de grote bedrijven nu? Ergens tussen de 60 en de 80 procent?

[40:59] Raimond Stokkel: Nou, dat is wel...

[41:06] Raimond Stokkel: Het Is jammer dat je ziet de requests nu bij het kooppijl, dat er nog geen token is. Ik heb wel Frits gestuurd hoe hij dat er wel uit kan halen, want dan kun je straks ook een, Inschatting maken hoe hoog de rekening wordt vanaf 1 juni.

[41:24] Kobbe van Daatselaar: Voor de laatste keer een bedrijf, want ik dacht toen ik die koop had, hoe kun je nou, Verwerking meten wat hij eigenlijk gedaan heeft. Je kan natuurlijk wel GitHub kopen uit de kopplein aan GitHub, zeg maar. En dan gaat er automatisch bij hoeveel procent van de code wordt gemaakt. Maar ja, het blijft gelijk fitbucket en devops.

[41:42] Raimond Stokkel: Ja, Ik hoor het stel.

[41:42] Kobbe van Daatselaar: Het Bedrag die gewoon zijn agents laat taggen, wat hij zelf toegevoegd heeft. Van de comments. En dan weten ze dat.

[41:51] Raimond Stokkel: Ja, tussenoplossing.

[41:52] Kobbe van Daatselaar: Ja, Maar het is wel een interessante metric.

[41:55] Raimond Stokkel: Ja, ik kan me voorstellen.

[41:59] Raimond Stokkel: Ja, ook steeds... Ja maar de code die eruit komt, ik vind de functies te lang, of ik vind de, weet ik veel De naam, ja, oh, ja dus, ga je straks, ten eerste als je het echt netjes wil hebben dan Vraag je toch of die het netjes wil maken, daarna nog in een loopje. En ook al, ook het ligt er een beetje aan waar die code zit, het is zoals een boom met, als Het helemaal aan die leaf node zit, dus echt de functies uiteindelijk, ja daar ga je toch, Nooit meer aankomen, of misschien over 10 jaar.

[42:31] Raimond Stokkel: Het maakt uit dat het niet helemaal clean code is. Dat is wel een andere manier van nadenken. Maar daar heb ik morgen ook wel een paar principles die je wel moet gaan meenemen als ontwikkelaar. Misschien wel als tester. Anders gaat het niet werken, als je op de oude manier op de top blijft denken. Dat is wel eng.

[42:56] Kobbe van Daatselaar: Je hebt natuurlijk een paar waarvan je zegt, oké, bridge to far en dan moet je dit doen. Als Clark wil meegeven. En dan vragen we hem weer een keer hoe erg is het daar nog. Ja.

[43:07] Raimond Stokkel: Oké.

[43:09] Raimond Stokkel: Het wordt nog wel interessant hoe dat...

[43:14] Kobbe van Daatselaar: Oké, laten we het daar morgen dan verder over hebben.

[43:18] Kobbe van Daatselaar: Ik had Ron niet uitgenodigd. Dat heb ik nu allemaal uitgehaald. Wel dat hij wel een manager stroomt bij morgen.

[43:25] Raimond Stokkel: Ja.

[43:27] Raimond Stokkel: Ja, er staat wel, maar ik zie dat de co-pilot is gegenereerd gelukkig, denk ik. Het lichtdoel wat er nodig is, staffing, tooling en randvoorwaarden. Nou, staffing, daar ga ik gelukkig niet over. Het lichtdoel wat er nodig is. Ja. Oké. Het lichtdoel wat er nodig is. Maar ik ga het op je zeggen, we hebben bijna geen staffing meer nodig. Ja, dat vind ik ook prima.

[43:49] Raimond Stokkel: Ja. Nou, ik ga er wel wat, ik heb er uiteindelijk iets toegevoegd om over te zeggen. Ja, gelukkig.

[43:57] Kobbe van Daatselaar: Grappig, Tonny was hier gisteren en Sjoerd was er ook bij, dus die was even heel trots Over wat zij gedaan hadden en Sjoerd is natuurlijk helemaal bang van allemaal mensen die dan Gaan muiten. Dus Tonny zegt, ja we hadden de aankondiging gedaan dat alle vrije eigenheden ieder het Oog moesten volgen, waar drie mensen niet op komen daar.

[44:15] Kobbe van Daatselaar: Oké. Sjoerd zegt, echt? Hij zegt, en nu? Hij zegt, ja ik weet niet, twee hebben nog steeds niet teruggezien, dus ik denk dat die, Niet meer bij ons zijn.

[44:27] Kobbe van Daatselaar: Ik ben wel aan het bezig van proberen dat iedereen een beetje gante gestureerd en goed staat te samenwerken.

[44:31] Raimond Stokkel: Ja, maar dat is eigenlijk ook tegen Frits, maar dat is ook een andere manier om dingen op te pakken. Want er was inderdaad iemand die was me keer duizend of keer honderd uit zijn premium request geschoten. En ik heb altijd met Frits die discussie. Ja, maar als ik nog geen rijbewijs heb, dan ga je mij toch ook geen Ferrari geven, weet je wel? Of een Ferrari laten rijden. Ja, maar zegt Frits, ja, maar je doet toch een rijles? Ja, ik ga toch zelf een rijles volgen. Ik ga toch naar een rijschool toe en zeggen, ga mij eens leren hoe die auto te rijden.

[45:02] Raimond Stokkel: Terwijl hier zijn er heel veel mensen die zitten er andersom in. Die denken, oh een Ferrari, die gaan zo hard als ze kunnen. Ja, maar die discussie heb ik altijd met Frits. Dus ik ben wel heel benieuwd als we nog... Nee, want ik denk echt dat we iedereen nog steeds hard nodig hebben voor de foreseeable future. Als ik zie wat we doen.

[45:18] Kobbe van Daatselaar: Ja, maar ik heb ook precies hetzelfde mening. Dat ik hetzelfde van, oh, hoeveel mensen hebben we nu minder nodig? Wij zeggen alleen maar min, he? We kunnen, Ja.

[45:25] Raimond Stokkel: We konden het werk niet aan.

[45:27] Kobbe van Daatselaar: Nu ben je van in loco geworden, dus we gaan gewoon veel meer doen.

[45:30] Raimond Stokkel: Ja. Nee, ja. We gaan de output verhogen. Zeker, ja.

[45:37] Raimond Stokkel: Maar ik denk dat niet iedereen mee gaat kunnen.

[45:40] Kobbe van Daatselaar: Dat Is het tweede ding. Kijk of je er nu mee wil of kan.

[45:42] Raimond Stokkel: Maar dan is er een andere reden.

[45:45] Kobbe van Daatselaar: Kijk, ik snap heel goed. Dit is niet de baan waarvoor je ooit je studie hebt gedaan en waar je op gesolliciteerd Hebt.

[45:53] Kobbe van Daatselaar: En ik kan me heel vervolgens voorstellen dat het echt mensen zijn die zeggen ja, dat is niet wat ik ooit vroeger benieuwd waar ik mijn energie uit haal. Dat vind ik heel legitiem.

[46:00] Raimond Stokkel: Ja, dat snap ik. Dat is wel wat er gaat gebeuren, Ja. Nee, Er is geen reden om dat te zeggen, oh nee, ga jij dan maar...

[46:08] Kobbe van Daatselaar: Nee, Dat zijn mensen met paarden.

[46:09] Raimond Stokkel: Nee, Maar wat je al zei... Vroeger reageerde ik met paarden,

[46:11] Kobbe van Daatselaar: Nu is het een hobby geworden. Ja.

[46:12] Raimond Stokkel: Nee, maar dat zei je al, straks wordt het een liability, want je hebt nog mensen aan het toetsenbord zitten.

[46:20] Kobbe van Daatselaar: Nee, ja, want ik denk, ja, vroeger hadden ze paarden nodig om het land te bewerken, en tegenwoordig is het... Ja, vier paarden. Als je paardrijden leuk vindt, dan ga je op paardrijles. Ja. Of je neemt een paard en is het je hobby, en het kost geld. Ja. Dat software maken wordt ook zo. Ja.

[46:32] Raimond Stokkel: Nee, zeker.

[46:33] Kobbe van Daatselaar: Dus Jij hebt heel leuk met de code te typen. Ja.

[46:36] Raimond Stokkel: Ja, dat zei die gast van OpenClaw, zei ook dat zo, weet je wel. Dat echt nog, sommige dingetjes doet hij nog zelf, puur omdat hij het leuk vindt, weet je wel. Omdat hij toch zit te wachten. Ja. Ja, dat is wel grappig.

[46:49] Kobbe van Daatselaar: Oké, heb jij nog andere punten?

[46:51] Raimond Stokkel: Nee, niet voor nu.

[46:53] Kobbe van Daatselaar: Oké, Dan ga ik die meeting, die tweedaagse inplannen en dan spreken we morgen verder over een duo.

[47:00] Raimond Stokkel: Ja, dat is wel goed. Oké, thanks.

[48:40] Speaker 3: Dank u wel.
