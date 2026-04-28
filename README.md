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

## Quick install

```bash
git clone https://github.com/kvdaatselaar/plaud-integration.git
cd plaud-integration

# 1. Eerst Azure app-registratie aanmaken — zie sectie hieronder.
# 2. Daarna alles in één klap:
./install.sh
```

Het script: `npm install` → `.env` invullen → Plaud-login (browser) → MS-login
(device-code) → notebook aanmaken → launchd activeren. Idempotent: gewoon
opnieuw draaien als er iets misging of je later iets wilt toevoegen.

Uninstall: `./uninstall.sh` (haalt launchd weg + optioneel state).

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
└── plaud/                 # vendored Plaud client (zie plaud/VENDOR.md)
scripts/
├── plaud-login.ts          # Plaud email/password (optie A)
├── plaud-browser-login.ts  # Plaud Google SSO via Playwright (optie B)
├── plaud-debug.ts          # rauwe /file/detail response dumpen
├── graph-login.ts          # MS device-code flow
├── setup-notebook.ts       # notebook pre-aanmaken (optioneel)
├── open-notebook.ts        # OneNote-desktop openen op de notebook
├── retitle.ts              # bestaande page-titels bijwerken obv agenda
└── run-sync.sh             # launchd wrapper (laadt nvm)
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
| `npm run typecheck` | TypeScript check |
