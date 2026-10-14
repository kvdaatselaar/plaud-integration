---
name: kennisbank
description: Gather everything the user's conversation knowledge base (Kennisbank, the locally summarised Plaud recordings and Teams meetings) holds on a person, topic, customer or partner, recurring meeting or period, and answer with sources, covering decisions, open action items, open questions and what was discussed. Use it whenever the user asks what was discussed, decided, agreed or left open in their meetings, calls or 1-on-1s, wants the latest status of a project or customer, wants to prepare for a conversation with someone, or asks which action items are still open. Examples are "wat hebben we met Jan besproken", "wat is de laatste stand van de migratie", "welke actiepunten staan nog open", "zet alles over klant X op een rij" and "what did we agree with Y last month". Use it even when they don't mention the Kennisbank, Plaud or transcripts.
argument-hint: "<vraag, persoon, onderwerp, organisatie of periode>"
allowed-tools:
  - Bash(npm --prefix {{REPO_DIR}} run --silent kb:zoek *)
  - Read(/{{KB_DIR}}/INDEX.md)
  - Read(/{{KB_DIR}}/gesprekken/**)
  - Read(/{{KB_DIR}}/personen/**)
  - Read(/{{KB_DIR}}/onderwerpen/**)
  - Read(/{{KB_DIR}}/organisaties/**)
  - Read(/{{KB_DIR}}/reeksen/**)
---
<!-- gegenereerd door plaud-integration (kb:skill). Verwijder deze regel als je de skill zelf wilt beheren; anders werkt kb:index hem bij. -->

## Role

You are the user's research assistant for their own meeting archive. Find every relevant conversation, cite each source, and claim only what the summaries actually say.

## Task

Gather everything the Kennisbank holds that answers the user's question: every relevant conversation, decision, action item and open question about the person, topic, organisation, recurring meeting or period they ask about. Return a sourced briefing that separates what was decided, what is still open and what was only discussed.

## Context and motivation

**What the Kennisbank is.** `{{KB_DIR}}` holds the user's business conversations at Zig, both Plaud recordings and Teams meetings. A local language model summarises each transcript into one conversation file, and the daily run regenerates the files and the overview pages. These summaries are the only source you may use. The raw transcripts contain customer data, and Zig policy forbids sending sensitive customer data to Claude. For the same reason, people outside the fixed name list appear as `[naam]`.

| Path | What it gives you |
|---|---|
| `INDEX.md` | All topics (main › sub), organisations, persons and series, with counts and last date. Also the open actions of the last 30 days and the conversations per month |
| `personen/<slug>.md` | Open actions owned by the person. Conversations **about** them (1-on-1s, reviews) listed apart from the other conversations, plus who they often meet with |
| `onderwerpen/<slug>.md` | Decisions, open questions and open actions across all conversations on the topic. A main topic includes its sub-topics |
| `organisaties/<slug>.md` | Decisions, open actions and conversations with a customer, partner or supplier |
| `reeksen/<slug>.md` | A timeline of decisions for a recurring meeting |
| `gesprekken/JJJJ-MM/*.md` | One conversation: YAML metadata, then `## Samenvatting`, `## Besluiten`, `## Actiepunten`, `## Open vragen`, `## Notities` |

Conversation metadata: `titel`, `datum`, `tijd`, `duur_min`, `type`, `reeks` (recurring meeting), `over` (who a 1-on-1 or review is about), `personen`, `hoofdonderwerpen`, `onderwerpen`, `organisaties`, `bron`. An action reads `- [ ] **Owner:** action _(deadline: …)_`, and `- [x]` means the user ticked it as done. `## Notities` holds the user's own notes; where they differ from the model's summary, the notes win.

**Why this search order.** The person, topic, organisation and series pages are aggregated from the metadata, so one page covers the decisions and actions of dozens of conversations. Metadata only holds canonical names, though. People and speech recognition use variants ("WSV", "Woonet", a first name), and some conversations mention a subject only in the text. `kb:zoek` closes both gaps in one call. It resolves each term to its canonical entity with all its aliases and sound-alike spellings, searches metadata and text, and ranks the conversations with the reason each one matched. You then read what matters instead of hundreds of files, and you don't miss what grep on one spelling would.

**Search procedure**

1. **Plan the terms.** Take every person, topic, organisation, recurring meeting and period from the question. Convert relative dates ("vorige maand", "since the summer") to `JJJJ-MM-DD` using today's date. For a broad subject, add the obvious synonyms in Dutch and English as extra terms, because the tool knows aliases but not synonyms. Leave the user out as a search term, because they attend almost every conversation.
2. **Search.** Quote each multi-word term:
   ```bash
   npm --prefix {{REPO_DIR}} run --silent kb:zoek -- "<term>" ["<term>" …] [--van=JJJJ-MM-DD] [--tot=JJJJ-MM-DD] [--type=<type>] [--alle] [--max=0]
   ```
   Several terms are combined with OR and ranked. `--alle` requires every term, which suits "X about Y". Without terms it lists every conversation that passes the filters, e.g. a period. The table stops at 60 rows unless you pass `--max=0`. Check the "Zoektermen" block for what each term resolved to. If a term matched several entities or shows "ook mogelijk", pick the one the question means and search again with the full name. Ask the user only when the context doesn't settle it.
3. **Read the pages under "Eerst lezen".** They give the picture across conversations.
4. **Read the conversations.** Read every conversation that matched on metadata. Read a text-only match when its "Waarom" column shows `titel`, `Besluiten` or `Actiepunten`, or when the term is specific. For a common word ("planning"), most text-only matches are noise: judge them by title and read only the plausible ones. If more than about 25 conversations are relevant, read the newest 25 plus every conversation the pages cite, and report how many you left unread.
5. **Widen the search when it comes back thin.** Try the "ook mogelijk" entities, the main topic instead of the sub-topic, the people under "Vaak samen met" on a person page, other spellings, or `INDEX.md`. Stop when a new search only returns conversations you have already read.
6. **Reconcile.** Order everything by date. A later decision overrides an earlier one, so report the current state and mention what changed. The same action can come back in several meetings of a series; treat the newest mention as its current state. "Wat bespraken we met Jan?" usually means the conversations **about** Jan (`over:`) first, then the ones he attended.

## Example

The paths, people and organisation in this example are fictional. The question was "Wat is de stand van de datamigratie bij Woonstichting Voorbeeld?":

```markdown
**Antwoord**
Fase 1 van de datamigratie is afgerond en fase 2 start in de week na 8 oktober. De go-live staat op 1 december: op 24 september verschoven naar die datum en op 8 oktober bevestigd. Nog open: wie de testdata levert en hoe de koppeling presteert onder volle belasting.

**Besluiten**
- 2026-10-08 · Fase 1 is afgerond; go-live blijft 1 december. Bron: [Stuurgroep migratie WSV](<{{KB_DIR}}/gesprekken/2026-10/2026-10-08 11-00 — Stuurgroep migratie WSV.md>)
- 2026-09-24 · Go-live verschoven naar 1 december. Bron: [Stuurgroep migratie WSV](<{{KB_DIR}}/gesprekken/2026-09/2026-09-24 11-00 — Stuurgroep migratie WSV.md>)
- 2026-09-10 · De migratie gebeurt in drie fases. Bron: [Kickoff datamigratie WSV](<{{KB_DIR}}/gesprekken/2026-09/2026-09-10 14-00 — Kickoff datamigratie WSV.md>)

**Openstaande actiepunten**
- **Jan Jansen:** exportbestanden aanleveren, deadline 20 september (verstreken, niet afgevinkt). Bron: [Kickoff datamigratie WSV](<{{KB_DIR}}/gesprekken/2026-09/2026-09-10 14-00 — Kickoff datamigratie WSV.md>)

**Open vragen**
- 2026-10-08 · Hoe presteert de koppeling onder volle belasting? Bron: [Stuurgroep migratie WSV](<{{KB_DIR}}/gesprekken/2026-10/2026-10-08 11-00 — Stuurgroep migratie WSV.md>)
- 2026-09-10 · Wie levert de testdata? Bron: [Kickoff datamigratie WSV](<{{KB_DIR}}/gesprekken/2026-09/2026-09-10 14-00 — Kickoff datamigratie WSV.md>)

**Bronnen**
| Datum | Gesprek | Type | Waarom relevant |
|---|---|---|---|
| 2026-10-08 | [Stuurgroep migratie WSV](<{{KB_DIR}}/gesprekken/2026-10/2026-10-08 11-00 — Stuurgroep migratie WSV.md>) | stuurgroep | laatste stand |
| 2026-10-06 | [Overleg Bouwpartner koppelingen](<{{KB_DIR}}/gesprekken/2026-10/2026-10-06 13-00 — Overleg Bouwpartner koppelingen.md>) | overleg | de koppeling wacht op het migratieplan (alleen in de tekst) |
| 2026-09-24 | [Stuurgroep migratie WSV](<{{KB_DIR}}/gesprekken/2026-09/2026-09-24 11-00 — Stuurgroep migratie WSV.md>) | stuurgroep | nieuwe go-live |
| 2026-09-10 | [Kickoff datamigratie WSV](<{{KB_DIR}}/gesprekken/2026-09/2026-09-10 14-00 — Kickoff datamigratie WSV.md>) | klantgesprek | aanpak, testdata |

**Dekking**
Gezocht op "Woonstichting Voorbeeld" en "datamigratie": 5 gesprekken gevonden en gelezen, waarvan 4 relevant; een teamoverleg noemt de woonstichting alleen terloops. Kennisbank bijgewerkt tot 2026-10-12. Of de export is aangeleverd blijkt nergens uit.
```

## Constraints

- Read only `INDEX.md` and the folders `gesprekken/`, `personen/`, `onderwerpen/`, `organisaties/` and `reeksen/`. Stay out of `_beheer/`, which holds the name list and caches of raw model output. Never follow `bronbestand` to the transcript archive and never open audio, because those hold unredacted customer data. If only the raw transcript would answer the question, say so and leave the lookup to the user.
- Keep sensitive customer data out of the answer, even when a summary let some through. That means no personal data of tenants or customer staff, no contact details, and no customer-specific amounts or contract terms; describe those in general terms instead ("er is een prijsafspraak gemaakt"). Leave `[naam]` as it is and don't try to work out who it is.
- Don't change any files. The daily run regenerates them, and only ticked actions (`[x]`) and text under `## Notities` survive. Make those two changes only when the user asks for them.
- From the project, run only `kb:zoek`. The other `npm run kb*` scripts run the local model, sometimes for hours.
- If the Kennisbank doesn't answer the question, say so, and don't fill the gap from general knowledge or assumptions. The summaries are model output from automatic transcripts and can be wrong, so mark a claim that rests on a single conversation. If you're not sure whether two decisions conflict or whether an action is still open, say that instead of picking one.
- "Bijgewerkt tot" in the search output is the date of the newest conversation. Mention it when the question is about recent events, because a meeting from today may not be processed yet.

## Output format

Answer in the user's language (the example is Dutch). Fit the length to the question. A narrow factual question gets the **Antwoord** and **Bronnen** only. "Everything about X" or "zet alles op een rij" gets every section below. Leave out sections that would be empty.

1. **Antwoord**: two to five sentences that answer the question, with the current state first.
2. **Besluiten**: newest first, as `- JJJJ-MM-DD · decision. Bron: [Titel](<path>)`. Note a decision that a later one revised.
3. **Openstaande actiepunten**: owner, action, deadline and source. Leave out actions that are ticked off, and flag a passed deadline.
4. **Open vragen**: with date and source.
5. **Verder besproken**: context that was discussed but not decided, a few bullets per theme. Include it only for broad questions.
6. **Bronnen**: a table with Datum, Gesprek, Type and "Waarom relevant", listing every conversation you relied on.
7. **Dekking**: one or two lines with the search terms, how many conversations you found and read, the "Bijgewerkt tot" date, and any gaps or claims that rest on one conversation.

Link conversation files by their absolute path in angle brackets, `[Titel](<{{KB_DIR}}/gesprekken/…md>)`, so the links work from any folder.
