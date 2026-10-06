<!-- gegenereerd door plaud-integration (kb:index). Verwijder deze regel als je dit bestand zelf wilt beheren; anders wordt het bij elke run bijgewerkt. -->
# Kennisbank gesprekken: instructies voor Claude

Deze map is een kennisbank van zakelijke gesprekken van Zig: Plaud-opnames en Teams-meetings. Elk
gesprek is door een lokaal taalmodel samengevat in een gespreksbestand. De overzichten per persoon en
per onderwerp worden daaruit gegenereerd.

## Structuur

| Pad | Inhoud |
|---|---|
| `INDEX.md` | Startpunt: openstaande actiepunten, alle onderwerpen en personen, gesprekken per maand |
| `gesprekken/JJJJ-MM/*.md` | Eén bestand per gesprek |
| `personen/*.md` | Per persoon: gesprekken, openstaande actiepunten, onderwerpen, met wie vaak samen |
| `onderwerpen/*.md` | Per onderwerp: besluiten, open vragen, actiepunten, gesprekken, betrokkenen |
| `_beheer/` | Beheer (vaste lijst, cache, kandidaten). **Niet lezen.** |

Een gespreksbestand begint met YAML-metadata:

```yaml
id: g-3f2a9c1b7e        # stabiel id
titel: Kwartaaloverleg productroadmap
datum: 2026-10-05       # lokale tijd (Europe/Amsterdam)
tijd: "12:00"
duur_min: 90
type: overleg           # overleg | 1-op-1 | klantgesprek | stuurgroep | workshop | presentatie | sollicitatie | overig
personen:               # canonieke namen uit de vaste lijst
  - …
onderwerpen:            # canonieke onderwerpen uit de vaste lijst
  - …
bron: teams             # plaud | teams
```

Daarna volgen de secties `## Samenvatting`, `## Besluiten`, `## Actiepunten` (`- [ ]` open, `- [x]` afgerond,
eigenaar vetgedrukt vooraan), `## Open vragen` en `## Notities` (eigen aantekeningen van de gebruiker).

## Zo beantwoord je vragen

1. Begin bij `INDEX.md` om het juiste onderwerp, de persoon of de periode te vinden.
2. Gaat de vraag over een persoon, lees dan `personen/<naam>.md`; over een onderwerp `onderwerpen/<onderwerp>.md`.
   Bestandsnamen zijn kleine letters met streepjes, zonder accenten (`jan-de-vries.md`).
3. Voor details open je de gelinkte gespreksbestanden. Zoeken over alle gesprekken kan ook direct:
   - gesprekken in een maand: de bestanden in `gesprekken/2026-09/`
   - een onderwerp of persoon in de metadata: `grep -rlx "  - Datamigratie" gesprekken`
   - openstaande actiepunten van iemand: `grep -rn '^- \[ \] \*\*Jan de Vries:\*\*' gesprekken`
   - een term in de samenvattingen: `grep -rni "datamigratie" gesprekken`
4. Gebruik de canonieke namen. Varianten staan onder "Ook bekend als" op de persoons- en onderwerppagina's.
5. Noem bij elk antwoord de bron: titel en datum van het gesprek, met een link naar het gespreksbestand.
6. Let op de datum. Bij "wat is de laatste stand" weegt het nieuwste gesprek het zwaarst. Geef aan wanneer
   besluiten elkaar tegenspreken of later zijn herzien.
7. Onderscheid wat **besloten** is (Besluiten), wat alleen **besproken** is (Samenvatting) en wat nog
   **open** staat (Open vragen, `- [ ]`).
8. Staat het antwoord niet in de kennisbank, zeg dat dan. Vul niet aan met aannames.

## Grenzen

- Lees alleen bestanden in deze map, en niet in `_beheer/`.
- Open **niet** de ruwe transcripten of audio. Het veld `bronbestand` verwijst naar het transcriptarchief;
  volg dat niet. Daar staan onbewerkte gesprekken met klantgegevens.
- Neem geen gevoelige klantgegevens op in antwoorden: geen persoonsgegevens van huurders of medewerkers van
  klanten, geen contactgegevens, geen klantspecifieke bedragen of contractvoorwaarden. `[naam]` in een tekst
  is een bewust weggelaten naam van iemand buiten de vaste lijst; probeer die niet te achterhalen.
- De samenvattingen zijn door een taalmodel gemaakt uit automatische transcripten en kunnen fouten bevatten.
  Meld het als een antwoord op één enkel gesprek leunt.

## Bijwerken

De kennisbank wordt gegenereerd door het project `plaud-integration`:

- `npm run kb:enrich`: nieuwe of gewijzigde transcripten samenvatten (lokaal taalmodel)
- `npm run kb:index`: `INDEX.md` en de pagina's per persoon en onderwerp opnieuw opbouwen
- `npm run kb`: beide

Pas gegenereerde bestanden niet aan. Twee uitzonderingen blijven bewaard bij opnieuw genereren:
actiepunten afvinken, en eigen tekst onder `## Notities` in een gespreksbestand.
