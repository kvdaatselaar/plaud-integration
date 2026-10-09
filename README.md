# plaud-integration

Dagelijkse sync van [Plaud](https://www.plaud.ai/)-opnames naar Microsoft
OneNote. Gegroepeerd per ISO-week (één section per week, één overzichtspagina
en één pagina per opname), met titels die automatisch matchen op je
Outlook-agenda.

macOS only (launchd). Personal/work Microsoft account.

## Hoe het werkt

- Plaud Web API (vendored client) → lijst + transcript + AI-summary + notes
- Microsoft Graph → OneNote pagina's, weekly overview-pagina via PATCH
- Microsoft Graph → Outlook agenda voor titel-matching (alleen meetings met
  ≥1 andere attendee tellen mee — geen solo-blockouts)
- launchd → dagelijkse cron om 07:00
- State in `~/.plaud-integration/`

## Architectuur

```
launchd (07:00 daily)
  └─ npm run sync
       ├─ Plaud API client (vendored, src/plaud/) → lijst + transcript + summary + notes
       └─ MSAL Node → POST /me/onenote/pages (Microsoft Graph)
```

State in `~/.plaud-integration/`:
- `state.json` — gesynchroniseerde recording-IDs + OneNote notebook/week-sections
- `msal-cache.json` — Microsoft refresh token
- `browser-profile/` — persistente Chrome profile voor Plaud browser-login

Plaud-credentials in `~/.plaud/config.json` (zelfde locatie als upstream
plaud-toolkit).

## Structuur in OneNote

```
📒 Plaud Notes                        (notebook)
  📁 Week 16 (13-19 apr 2026)         (section, auto per ISO-week)
    📄 Overzicht Week 16 ...          (level 1, auto-gegenereerd per sync)
    📄 2026-04-13 09:00 — Meeting X   (opname)
    📄 2026-04-14 14:30 — Meeting Y
  📁 Week 17 (20-26 apr 2026)
    📄 Overzicht Week 17 ...
    📄 ...
```

Overzicht-pagina toont per dag: tijd, duur, titel (met link naar de opname-
pagina). Wordt ge-PATCH'd bij elke nieuwe opname in die week.

Per opname-pagina:
- Samenvatting + minutes (uit Plaud's `auto_sum`, markdown → HTML)
- Notes / highlights (uit Plaud's `note:` data)
- Transcript met timestamps per zin (uit `source:` data)

### Opnames zonder transcriptie

Plaud transcribeert opnames van de telefoon automatisch, maar niet alles (bijvoorbeeld opnames uit de
desktop-app). De sync start dan zelf transcriptie + samenvatting in Plaud, met de instellingen van je laatste
transcriptie (taal, sjabloon, sprekerherkenning), wacht tot Plaud klaar is (meestal een paar minuten, maximaal
15) en bewaart het resultaat bij de opname, zoals de webapp doet. Daarna staat de opname gewoon getranscribeerd
in Plaud en gaat hij in dezelfde run naar OneNote. Is Plaud niet op tijd klaar, dan pakt de volgende sync hem op.
Een opname die nog zijn tijdstempel als naam had, krijgt (net als in de app) de kop van de samenvatting als naam.

- Niet voor opnames korter dan een minuut (`PLAUD_MIN_TRANSCRIBE_SECONDS`), opnames waar Plaud al mee bezig
  is, of als je transcriptietegoed niet meer genoeg is (dat staat dan in de log).
- Een mislukte transcriptie wordt hooguit twee keer gestart; daarna staat in de log dat je hem in de
  Plaud-app moet starten.
- Uitzetten: `PLAUD_AUTO_TRANSCRIBE=off`. Wachttijd: `PLAUD_TRANSCRIBE_WAIT_MINUTES` (0 = niet wachten).

Dit gebruikt dezelfde aanroepen als de knop "Generate" in de Plaud-webapp (`/ai/transsumm/{id}`, daarna
`PATCH /file/{id}` om het resultaat te bewaren); die zijn niet officieel gedocumenteerd en kunnen veranderen.
Sprekers krijgen geen namen uit je stemprofielen, zoals de app soms wel doet; ze blijven "Speaker 1", "Speaker 2".

## Teams-meetings

Naast Plaud pakt de sync ook je Microsoft Teams-meeting-transcripts van de
laatste 30 dagen mee — dezelfde week-structuur, aparte pagina per Teams-meeting
naast Plaud-opnames. In het overzicht krijgen Teams-items een 📞 badge.

**Vereisten (eenmalig):**

1. Azure app permissions: `OnlineMeetings.Read` + `OnlineMeetingTranscript.Read.All` — **admin-consent nodig**
2. Na consent: `npm run graph:login` opnieuw zodat de refresh-token de nieuwe scopes bevat

Zonder consent slaat de sync de Teams-fase netjes over met een log-melding —
Plaud-sync blijft werken.

Wat wél/niet:
- ✅ Transcripts (VTT → nette `[hh:mm:ss] Speaker: text` opmaak)
- ✅ Titel uit Outlook calendar event subject
- ✅ Meetings die je zelf organiseert (via `getAllTranscripts`, ook uitzonderingen in een reeks)
- ✅ Meetings binnen Zig van een andere organisator waar je deelnemer bent
- ✅ Terugkerende meetings: elke transcript landt op de datum van zijn eigen occurrence
- ❌ Meetings georganiseerd door een andere organisatie (bv. klanten/leveranciers): Microsoft Graph
  geeft geen toegang tot transcripts in een andere tenant. Ze staan aan het eind van elke sync-log
  onder "niet bereikbaar via Microsoft Graph".
- ❌ Meetings waar je via een groep/town hall bij zat (Graph ziet je dan niet als deelnemer)
- ❌ AI-samenvatting (vereist Copilot for M365 + preview scope)
- ❌ Video/audio recording download

Microsoft heeft transcript-id's in het verleden opnieuw uitgegeven; de sync herkent een transcript
daarom aan zijn aanmaaktijd, niet alleen aan het id.

**Opschonen na oudere versies** — eerdere versies maakten dubbele pagina's (na zo'n id-wissel) en
gaven alle transcripts van een terugkerende meeting de datum van de eerste occurrence:

```bash
npm run teams:repair              # dry run: laat zien wat er zou veranderen
npm run teams:repair -- --apply   # verwijdert dubbelen, maakt verkeerd gedateerde pagina's opnieuw aan
```

Pagina's waarvan Microsoft de transcript niet meer heeft, blijven ongemoeid (dan is jouw pagina de
enige kopie). Let op: eigen aantekeningen op verwijderde/opnieuw aangemaakte pagina's gaan verloren.

## Lokale transcript-dump

Naast OneNote schrijft de sync standaard ook een markdown-file per opname naar
`~/Documents/PlaudTranscripts/<weekLabel>/<title>.md`. Zelfde week-indeling als
OneNote. Bevat YAML frontmatter (datum, duur, Plaud-ID) + summary + notes +
transcript — ideaal voor grep, Obsidian, of git-versionering.

Configureerbaar via `.env`:

```
# Aangepaste locatie
TRANSCRIPTS_DIR=/Users/jouw-naam/Documents/PlaudTranscripts

# Uitzetten
TRANSCRIPTS=off
```

Bestaande (al-gesynchroniseerde) opnames in één keer naar disk schrijven:

```bash
npm run transcripts:dump
```

## Audio-download

Audio wordt standaard tijdens `npm run sync` opgehaald naar
`~/Documents/PlaudAudio/<weekLabel>/<title>.mp3`. Streamt via Plaud's
presigned download-URL — geen memory-blowup voor lange opnames, en idempotent
(bestaande files worden overgeslagen).

Backfill / handmatig triggeren:

```bash
npm run audio:download
```

Config via `.env`:

```
# Audio uit sync halen
AUDIO=off

# Aangepaste locatie
AUDIO_DIR=/Users/jouw-naam/Documents/PlaudAudio

# Opus i.p.v. MP3 (kleinere files, niet overal afspeelbaar)
AUDIO_FORMAT=opus
```

## Kennisbank: verrijken en indexeren

Twee losse stappen na het ophalen maken van het transcriptarchief een doorzoekbare kennisbank. Beide zijn
apart uit te voeren en veilig te herhalen. De week-mappen in het transcriptarchief worden alleen gelezen;
de kennisbank komt in een eigen map ernaast (`KB_DIR`, standaard `<map boven TRANSCRIPTS_DIR>/Kennisbank`).

```
Kennisbank/
├── CLAUDE.md                 # hoe je de kennisbank bevraagt (voor Claude Code)
├── INDEX.md                  # startpunt: actiepunten, onderwerpen, personen, gesprekken per maand
├── gesprekken/2026-10/…md    # één gespreksbestand per transcript
├── personen/…md              # per persoon; aparte sectie voor gesprekken óver die persoon
├── onderwerpen/…md           # per hoofd- en subonderwerp
├── organisaties/…md          # per klant, partner, leverancier
├── reeksen/…md               # per terugkerende meeting, met tijdlijn
└── _beheer/                  # vaste lijst, kandidaten en cache (geen onderdeel van de kennisbank)
```

**Vereiste: een lokaal taalmodel.** De transcripten bevatten klantgegevens en mogen volgens het beleid van
Zig niet naar een cloud-LLM. Verrijken draait daarom op [Ollama](https://ollama.com) op je eigen Mac:

```bash
brew install ollama && brew services start ollama
ollama pull gemma3:12b          # ±8 GB; past op een Mac met 16+ GB geheugen
```

Een ander lokaal model kan via `KB_MODEL`. Het script weigert een niet-lokale `KB_LLM_URL`, tenzij je
bewust `KB_ALLOW_REMOTE_LLM=yes` zet. Doe dat alleen met expliciete toestemming.

### Vooraf: inrichting bepalen (`npm run kb:analyze`)

Voordat je het hele archief verrijkt, kun je een snelle analyse draaien om de vaste lijst goed in te richten.
Per gesprek doet het lokale model één aanroep op een steekproef (begin, midden, eind) en stelt vrije thema's,
een gesprekstype (en of de huidige typelijst past) en de genoemde organisaties voor. Duur: ongeveer 20
seconden per gesprek; resultaten worden gecachet.

- `_beheer/analyse.md`: rapport met thema's, types, organisaties en terugkerende reeksen, met voorbeelden
- `_beheer/analyse-aggregaat.json`: alleen thema's, types en aantallen, zonder organisatienamen

Gebruik dit om onderwerpen, aliassen en types in `vocabulaire.yml` vast te leggen; het model kiest bij het
verrijken dan uit jouw lijst in plaats van eigen varianten te bedenken.

### Stap 1: verrijken (`npm run kb:enrich`)

Maakt per transcript een gespreksbestand met YAML-metadata (`datum`, `tijd`, `type`, `personen`,
`onderwerpen`, `bron`) en de secties Samenvatting, Besluiten, Actiepunten en Open vragen. Lange gesprekken
worden in delen samengevat en daarna samengevoegd.

```bash
npm run kb:enrich                        # nieuwe/gewijzigde transcripten + alles opnieuw renderen
npm run kb:enrich -- --dry-run           # hoeveel transcripten en modelaanroepen er klaarstaan
npm run kb:enrich -- --limit=5           # proefrun, of de eerste run in porties
npm run kb:enrich -- --since=2026-09-01  # alleen recente transcripten
npm run kb:enrich -- --force             # alles opnieuw door het model (na een modelwissel)
npm run kb:enrich -- --alleen-op-stroom  # Mac op accu: wacht op de lader vóór elk gesprek
```

- **Herhaalbaar:** de modeluitvoer wordt per transcriptinhoud gecachet. Een transcript gaat dus maar één keer
  door het model. Daarna wordt alleen opnieuw gekoppeld aan de vaste lijst en gerenderd, en dat kost seconden.
  De eerste run over het hele archief duurt lang (orde van uren); `--limit` spreidt hem.
- **Eigen werk blijft staan:** afgevinkte actiepunten (`- [x]`) en tekst onder `## Notities` blijven bewaard,
  ook als de titel van het gesprek verandert.
- **Privacy:** het model krijgt de instructie geen gevoelige klantgegevens op te nemen. Daarnaast filtert de
  code altijd e-mailadressen, telefoonnummers, IBAN's, BSN's en links met tokens. Namen die niet op de vaste
  lijst staan worden in alle teksten (ook titels) vervangen door `[naam]`.

### Stap 2: indexeren (`npm run kb:index`)

Bouwt `INDEX.md` en een pagina per persoon en per onderwerp opnieuw op uit de gespreksbestanden, en houdt
`CLAUDE.md` actueel. Er zijn geen netwerk- of modelaanroepen, dus deze stap is altijd snel. Pagina's van
personen of onderwerpen die niet meer voorkomen worden opgeruimd.

`npm run kb` draait beheer (de vaste lijst bijwerken, zie hieronder), verrijken en indexeren na elkaar. Met `KB_AUTO=on` in `.env` doet de dagelijkse launchd-run dat
na de sync automatisch. Daarvoor moet Ollama draaien. Dagelijks gaan alleen nieuwe of gewijzigde transcripten
door het model; de rest komt uit de cache.

Een grote achterstand (de eerste keer, of na een aanpassing van de prompt) kost een paar minuten per gesprek
en dus al snel een nacht. Plan die met `npm run kb:later -- 20:00`: de run start dan vanzelf om 20:00 (of
morgen, als dat tijdstip al voorbij is), verrijkt alleen op netstroom en draait daarna nog één keer
`npm run kb`. Zolang hij wacht of loopt, slaat de dagelijkse sync de kennisbank over. Laat de Mac open en aan
de lader staan; de voortgang staat in `~/.plaud-integration/kb-later.log`. Annuleren:
`pkill -f 'scripts/kb-(later|enrich)'`. Wat al verwerkt is blijft bewaard.

### De vaste lijst: twee lagen, automatisch onderhouden

Alleen wat op de vaste lijst staat komt in de kennisbank. De lijst onderhoudt zichzelf:

| Bestand | Van wie | Inhoud |
|---|---|---|
| `_beheer/vocabulaire.yml` | jij | `eigenaar`, de onderwerpenboom, `types`, correcties, `negeren` en de `beheer`-instellingen. Wint altijd. |
| `_beheer/vocabulaire.auto.yml` | `kb:beheer` | personen, organisaties (met soort), schrijfvarianten, nieuwe onderwerpen. Niet bewerken. |
| `_beheer/wijzigingen.md` | `kb:beheer` | wat er per run automatisch veranderde, en waarom |

`npm run kb:beheer` (stap 0, draait ook in `npm run kb`):

- **Personen** uit de agenda-uitnodigingen van je opgenomen gesprekken (meetings met hoogstens 15
  deelnemers, minimaal 2 gesprekken). Organisatie volgt uit het e-maildomein. Aliassen: voornaam als die
  uniek is, dubbele voornaam ("Peter Jan"), en een gedeelde voornaam alleen als de agenda uitwijst wie bij
  de 1-op-1's met die naam in de titel zat.
- **Organisaties** uit e-maildomeinen van externe deelnemers en uit namen die het model in minimaal
  `min_gesprekken_organisatie` gesprekken noemt. Namen die hetzelfde klinken worden samengevoegd; de spelling
  van het e-maildomein wint ("Akme" wordt een alias van Acme). De **soort** (klant, partner, leverancier,
  groep, investeerder, overheid, technologie, overig) volgt uit het verrijken: het model leest daar het hele
  gesprek en beoordeelt per genoemde organisatie de relatie. Een duidelijke meerderheid over minimaal twee
  gesprekken beslist; tot die er is, deelt het model de organisatie in op basis van titels, typen en termen.
  Soorten in `uitsluiten_soorten` blijven buiten de kennisbank.
- **Onderwerpen**: termen die het model gebruikte en die niet op de lijst staan, koppelt het lokale model aan
  het meest specifieke (sub)onderwerp, als alias en alleen als het zeker is. Schrijft het model
  "Hoofdonderwerp: iets nieuws", dan telt het gesprek alvast mee onder dat hoofdonderwerp. Algemene woorden
  en persoonlijke zaken (gezondheid, privéleven, beloning) worden nooit een alias of onderwerp; termen uit
  verrijkingen van vóór de huidige privacyregels tellen niet mee. Een thema dat nergens past en in minimaal
  `min_gesprekken_onderwerp` gesprekken voorkomt, wordt een nieuw subonderwerp onder het passende
  hoofdonderwerp (nooit genoemd naar een persoon of organisatie), of alleen een voorstel met
  `nieuwe_onderwerpen: voorstel`.
- **Schrijfvarianten** van de spraakherkenning, met een klanksleutel ("Woonet" → WoonNet). Afkortingen en
  woordparen met een vulwoord tellen niet mee; bij personen en organisaties alleen varianten die meestal met
  een hoofdletter staan.

Beslissingen van het model worden gecachet; elke run vraagt alleen naar wat nieuw is. Is de agenda niet
bereikbaar, dan blijft de vorige automatische laag staan.

**Ingrijpen** hoeft niet, maar kan altijd in `vocabulaire.yml`:

```yaml
negeren: [Microsoft]          # komt nooit (meer) in de kennisbank
organisaties:
  - naam: WoonNet             # verkeerde spelling of samenvoegen: jouw naam wint,
    aliassen: [Woonet]        # de automatische varianten komen eronder
    soort: klant              # en jouw soort wint van die van het model
```

`npm run kb:aliassen` maakt een rapport van alle gevonden schrijfvarianten (`_beheer/aliassen.voorstel.md`).
`npm run kb:beheer -- --dry-run` laat zien wat er zou veranderen zonder iets te schrijven.

De lijst staat in je kennisbankmap, niet in deze repository: hij bevat namen.

### Bevragen

Open Claude Code in de map `Kennisbank`. `CLAUDE.md` legt uit waar wat staat, hoe je zoekt, dat antwoorden
een bron noemen en dat de ruwe transcripten en `_beheer/` buiten bereik blijven.

## Quick install (one-liner)

```bash
curl -fsSL https://raw.githubusercontent.com/kvdaatselaar/plaud-integration/main/bootstrap.sh | bash
```

Dit kloont de repo naar een door jou gekozen pad (default `~/plaud-integration`)
en draait dan `install.sh` — die loopt door:

1. `npm install`
2. `.env` invullen (vraagt om je Azure Client ID; zie [Azure / Entra app-registratie](#2-azure--entra-app-registratie) hieronder als je er nog geen hebt)
3. Plaud-login via browser (Google SSO)
4. Microsoft-login via device-code
5. OneNote notebook resolven/aanmaken
6. launchd activeren (dagelijks 07:00)

Idempotent — gewoon opnieuw draaien als er iets misging of je later iets wilt
aanvullen.

Uninstall: `./uninstall.sh` (launchd unload + optioneel state cleanup).

> **Azure app-registratie eerst aanmaken** — zonder Client ID kan het script
> de `.env` niet afmaken. Volg [stap 2 hieronder](#2-azure--entra-app-registratie).
> Heb je 'm al? Dan loopt de bootstrap door zonder te wachten.

## Eenmalige setup (als je `install.sh` niet wilt gebruiken)

### 1. Dependencies

```bash
cd ~/code/plaud-integration
npm install
cp .env.example .env
```

### 2. Azure / Entra app-registratie

1. https://portal.azure.com → **Microsoft Entra ID** → **App registrations** → **New registration**
2. **Name**: `plaud-integration`
3. **Supported account types**: *Personal Microsoft accounts only* (persoonlijke
   OneNote) of *single tenant* (werk-OneNote).
4. **Redirect URI**: leeg laten — we gebruiken device-code flow.
5. Na aanmaken → **Authentication** → onderaan **Allow public client flows = Yes**. Save.
6. **API permissions** → **Add a permission** → **Microsoft Graph** →
   **Delegated permissions** → vink aan:
   - `Notes.ReadWrite`
   - `Calendars.Read` (voor titel-matching met Outlook-agenda)
   - `OnlineMeetings.Read` (Teams-meeting metadata) — **admin-consent**
   - `OnlineMeetingTranscript.Read.All` (Teams transcripts) — **admin-consent**
   - `User.Read`
   - `offline_access`

   Klik **Add**. Voor persoonlijke accounts is geen admin-consent nodig.
   > Als je `Calendars.Read` later toevoegt nadat je al was ingelogd: run
   > opnieuw `npm run graph:login` zodat het refresh-token de nieuwe scope
   > krijgt.
7. **Overview** → noteer **Application (client) ID** en **Directory (tenant) ID**.

### 3. `.env` invullen

```
AZURE_CLIENT_ID=<jouw-client-id>
AZURE_TENANT_ID=consumers   # of tenant GUID voor werk-account
NOTEBOOK_NAME=Plaud Notes
```

### 4. Plaud inloggen

**Optie A — email/password** (als je een Plaud-password hebt):

```bash
npm run plaud:login
```

**Optie B — browser-login via Playwright** (Google SSO, aanbevolen):

```bash
npm run plaud:browser-login
```

Chrome opent met een eigen profile (`~/.plaud-integration/browser-profile/`).
Log in met Google — het script intercepteert de eerste API-call's Authorization
header, slaat de bearer token op, en sluit de browser. Token leeft ~300 dagen.

Bij re-login: profile is persistent, dus Google-sessie blijft meestal geldig →
opnieuw runnen haalt automatisch een verse bearer.

> Standaard gebruikt de script-launcher `channel: 'chrome'` (je geïnstalleerde
> Chrome). Bij problemen: `npx playwright install chromium`.

### 5. Microsoft inloggen (device code)

```bash
npm run graph:login
```

Output toont URL + code. Open, plak code, log in met je Microsoft-account.
Refresh-token in `~/.plaud-integration/msal-cache.json`.

### 6. Notebook aanmaken (optioneel)

```bash
npm run graph:setup-notebook
```

Maakt/vindt notebook "Plaud Notes". Weeksections worden bij de eerste sync in
elke week automatisch aangemaakt. Eerste `npm run sync` doet dit ook zelf, dus
deze stap is niet verplicht.

### 7. Test-run

```bash
npm run sync
```

Eerste run pakt alle bestaande Plaud-opnames en zet ze in week-sections. Check
de OneNote-app of https://www.onenote.com/notebooks.

Om de notebook direct in de OneNote-desktop-app te openen:

```bash
npm run onenote:open
```

### Titels uit Outlook-agenda

Tijdens de sync wordt voor elke opname de Microsoft-agenda bevraagd (window
±30 min). Als er een meeting overlapt met de opname, wordt de subject van
die meeting de titel; anders de Plaud-filename.

Om bestaande (al-gesynchroniseerde) pagina's alsnog met calendar-titels bij te
werken zonder re-sync:

```bash
npm run onenote:retitle
```

Loopt door alle opnames in state, matcht tegen de agenda, PATCH't titel + week-
overzicht als er een betere titel is.

## Dagelijks automatisch draaien (launchd)

`./install.sh` doet dit standaard. Handmatig (bv. om paden aan te passen):

```bash
sed -e "s|__PROJECT_DIR__|$(pwd)|g" -e "s|__HOME__|$HOME|g" \
  launchd/local.plaud-integration.plist.template \
  > ~/Library/LaunchAgents/local.plaud-integration.plist
launchctl load ~/Library/LaunchAgents/local.plaud-integration.plist
```

Draait elke dag om 07:00. Logs in `~/.plaud-integration/sync.log` +
`sync.err.log`.

Stoppen / handmatig triggeren:

```bash
launchctl unload ~/Library/LaunchAgents/local.plaud-integration.plist
launchctl start local.plaud-integration
```

## Troubleshooting

- **"No account in MSAL cache"** → `npm run graph:login` opnieuw.
- **"No Plaud token"** → `npm run plaud:browser-login` (of `plaud:login`).
- **Graph 401 na weken/maanden** → refresh-token verlopen. `npm run graph:login` opnieuw.
- **Plaud API 401** → bearer token verlopen (~300d) of Google-sessie verlopen.
  `npm run plaud:browser-login` opnieuw.
- **Opname skipte je per ongeluk** → verwijder zijn ID uit `syncedIds` in
  `~/.plaud-integration/state.json`. Volgende run pakt 'm weer.
- **Alles opnieuw syncen** → `rm ~/.plaud-integration/state.json` en ruim de
  OneNote-sections handmatig op. Volgende `npm run sync` bouwt alles opnieuw.
- **Plaud API-structuur gewijzigd** → `npm run plaud:debug -- --list` om IDs te
  zien, dan `npm run plaud:debug -- <id>` om de rauwe response te inspecteren.
- **Plaud API kapot** → de vendored client in `src/plaud/` is reverse-engineered.
  Check [sergivalverde/plaud-toolkit](https://github.com/sergivalverde/plaud-toolkit)
  voor upstream-fixes; kopieer `packages/core/src/*.ts` opnieuw naar `src/plaud/`.

## Naar Azure Functions migreren (later)

De logica in `src/` is cloud-agnostisch. Voor Azure Functions:

1. Wrap `main()` in een timer-triggered function (NCRONTAB `0 0 7 * * *`).
2. `.env` secrets → App Settings of Key Vault.
3. MSAL cache: vervang file-backed cachePlugin door Azure Blob/Key Vault.
4. Plaud-credentials: `PlaudConfig` constructor accepteert custom dir, of
   lees credentials uit env en schrijf config-file runtime.
5. Playwright-browserlogin werkt niet headless — gebruik `plaud:login`
   email/password variant (of run browser-login lokaal en upload state.json
   naar de cloud).

## Bestandsindeling

```
src/
├── index.ts               # entry: daily sync
├── config.ts              # env + paths
├── state.ts               # synced IDs + OneNote notebook/weeks
├── week.ts                # ISO-week berekening
├── html.ts                # recording → OneNote HTML + overzicht generator
├── graph-auth.ts          # MSAL Node met file-backed token cache
├── onenote.ts             # Graph OneNote client (notebooks, sections, pages, PATCH)
├── calendar.ts            # Graph Calendar client + event-matching voor titels
├── teams.ts               # Graph client voor Teams onlineMeetings + transcripts
├── teams-sync.ts          # Teams-transcripts verzamelen, aan occurrence koppelen, pagina aanmaken
├── weeks.ts               # week-sectie + overzichtspagina beheer
├── vtt.ts                 # VTT-parser (Teams-transcript formaat)
├── transcripts.ts         # lokale markdown-dump per opname
├── audio-archive.ts       # audio-download helper (gedeeld met scripts/download-audio)
├── kb/                    # kennisbank: bronnen, extractie (Ollama), redactie, gespreksbestanden, index
└── plaud/                 # vendored Plaud client (zie plaud/VENDOR.md)
scripts/
├── plaud-login.ts          # Plaud email/password (optie A)
├── plaud-browser-login.ts  # Plaud Google SSO via Playwright (optie B)
├── plaud-debug.ts          # rauwe /file/detail response dumpen
├── graph-login.ts          # MS device-code flow
├── setup-notebook.ts       # notebook pre-aanmaken (optioneel)
├── open-notebook.ts        # OneNote-desktop openen op de notebook
├── retitle.ts              # bestaande page-titels bijwerken obv agenda
├── dump-transcripts.ts     # backfill van markdown-files voor al gesynchroniseerde opnames
├── download-audio.ts       # MP3-export naar lokale map (idempotent)
├── kb-analyze.ts           # kennisbank: analyse voor de inrichting van de vaste lijst
├── kb-beheer.ts            # kennisbank stap 0: vaste lijst automatisch onderhouden
├── kb-aliassen.ts          # kennisbank: rapport van schrijfvarianten (klanksleutel)
├── kb-enrich.ts            # kennisbank stap 1: verrijken
├── kb-index.ts             # kennisbank stap 2: indexeren
├── kb-later.sh             # kennisbank-run later laten starten (bijv. 's nachts), alleen op netstroom
└── run-sync.sh             # launchd wrapper (laadt nvm; KB_AUTO=on → ook kennisbank)
knowledge/
├── CLAUDE.md               # sjabloon voor Kennisbank/CLAUDE.md
└── vocabulaire.template.yml
launchd/
└── local.plaud-integration.plist.template
install.sh                     # eenmalige setup (idempotent)
uninstall.sh                   # launchd unload + state cleanup
```

## Script-referentie

| Commando | Doel |
|---|---|
| `npm run sync` | Hoofd-actie: Plaud → OneNote sync |
| `npm run plaud:login` | Plaud email/password |
| `npm run plaud:browser-login` | Plaud Google SSO (Playwright) |
| `npm run plaud:debug -- --list` | List recordings |
| `npm run plaud:debug -- <id>` | Raw API response voor één opname |
| `npm run graph:login` | MS device-code flow |
| `npm run graph:setup-notebook` | Notebook pre-aanmaken |
| `npm run onenote:open` | Notebook openen in OneNote-desktop |
| `npm run onenote:retitle` | Bestaande page-titels bijwerken obv Outlook-agenda |
| `npm run transcripts:dump` | Backfill: markdown-files voor al gesynchroniseerde opnames |
| `npm run audio:download` | MP3-export naar AUDIO_DIR (skip-if-exists) |
| `npm run teams:debug` | Teams-transcripts in de laatste 30 dagen + meetings zonder toegang |
| `npm run teams:repair` | Dubbele/verkeerd gedateerde Teams-pagina's opschonen (dry run; `-- --apply`) |
| `npm run kb:analyze` | Analyse vooraf: thema's en types voorstellen voor de vaste lijst |
| `npm run kb:beheer` | Vaste lijst automatisch onderhouden (personen, organisaties, soort, varianten, onderwerpen) |
| `npm run kb:aliassen` | Rapport van schrijfvarianten van namen in de transcripten |
| `npm run kb:enrich` | Kennisbank stap 1: gespreksbestanden maken (lokaal taalmodel) |
| `npm run kb:index` | Kennisbank stap 2: INDEX.md + pagina's per persoon en onderwerp |
| `npm run kb` | Beheer, verrijken en indexeren na elkaar |
| `npm run kb:later -- 20:00` | Volledige kennisbank-run vanaf 20:00, alleen op netstroom; dagelijkse sync wacht |
| `npm run typecheck` | TypeScript check |
