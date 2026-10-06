import * as path from 'node:path';
import { kbConfig } from './config.js';
import { chatJson } from './llm.js';
import { readJson, writeJson } from './files.js';
import type { SourceTranscript } from './sources.js';
import type { Vocabulary } from './vocabulary.js';

/** Bump when prompts or schema change in a way that should re-run extraction. */
export const PROMPT_VERSION = 1;

export interface ActionItem {
  actie: string;
  eigenaar?: string;
  deadline?: string;
}

export interface Extraction {
  samenvatting: string;
  type: string;
  besluiten: string[];
  actiepunten: ActionItem[];
  open_vragen: string[];
  /** Names from the person list, as spelled there. */
  personen: string[];
  /** Other names mentioned. Only used to redact and to suggest candidates; never written to the knowledge base. */
  overige_personen: string[];
  onderwerpen: string[];
}

interface CacheEntry {
  version: number;
  model: string;
  extraction: Extraction;
  createdAt: string;
}

const str = { type: 'string' };
const strList = { type: 'array', items: str };
const actions = {
  type: 'array',
  items: {
    type: 'object',
    properties: { actie: str, eigenaar: str, deadline: str },
    required: ['actie'],
  },
};
const PART_SCHEMA = {
  type: 'object',
  properties: {
    kernpunten: strList,
    besluiten: strList,
    actiepunten: actions,
    open_vragen: strList,
    personen: strList,
    overige_personen: strList,
    onderwerpen: strList,
  },
  required: ['kernpunten', 'besluiten', 'actiepunten', 'open_vragen', 'personen', 'overige_personen', 'onderwerpen'],
};
const finalSchema = (types: string[]) => ({
  type: 'object',
  properties: {
    samenvatting: str,
    type: { type: 'string', enum: types },
    besluiten: strList,
    actiepunten: actions,
    open_vragen: strList,
    personen: strList,
    overige_personen: strList,
    onderwerpen: strList,
  },
  required: ['samenvatting', 'type', 'besluiten', 'actiepunten', 'open_vragen', 'personen', 'overige_personen', 'onderwerpen'],
});

function systemPrompt(vocab: Vocabulary): string {
  const persons = vocab.persons.length
    ? vocab.persons.map(p => `- ${p.naam}${p.aliassen.length ? `: ${p.aliassen.join(', ')}` : ''}`).join('\n')
    : '(nog leeg)';
  const topics = vocab.topics.length
    ? vocab.topics.map(t => `- ${t.naam}${t.omschrijving ? `: ${t.omschrijving}` : ''}`).join('\n')
    : '(nog leeg)';
  return `Je bent notulist bij Zig, een softwareleverancier voor woningcorporaties. Je verwerkt een automatisch gegenereerd transcript tot een kennisbankitem in het Nederlands.

PRIVACY (strikt, gaat boven volledigheid):
- Neem geen gevoelige klantgegevens op: niets over huurders, bewoners, eindgebruikers of individuele medewerkers van klanten (namen, adressen, contactgegevens, geboortedata, BSN, IBAN, inkomen, gezondheid, klachten of incidenten over personen).
- Noem een persoon in teksten alleen bij naam als die op de personenlijst staat; beschrijf anderen met hun rol ("de projectleider van de corporatie").
- Geen bedragen, tarieven of contractvoorwaarden die bij een specifieke klant horen; beschrijf ze algemeen ("prijsafspraak besproken").
- Geen wachtwoorden, sleutels, interne URL's of details van beveiligingslekken.

INHOUD:
- Alleen wat in het transcript staat; verzin of vul niets aan.
- Spraakherkenning maakt fouten; gebruik de schrijfwijze uit de lijsten als een naam of term daar duidelijk op lijkt.
- Besluit: iets wat expliciet is afgesproken of besloten. Actiepunt: een concrete taak, met eigenaar en deadline als die genoemd worden. Open vraag: een vraag die onbeantwoord bleef of werd uitgesteld.
- Schrijf elk punt als één korte, zelfstandig leesbare zin.

Personenlijst (naam: varianten):
${persons}

Onderwerpenlijst (naam: omschrijving):
${topics}`;
}

function header(src: SourceTranscript): string {
  const when = new Date(src.startMs).toLocaleString('nl-NL', { timeZone: kbConfig.timeZone, dateStyle: 'long', timeStyle: 'short' });
  const speakers = src.speakers.length ? `, sprekers: ${src.speakers.join(', ')}` : '';
  return `Gesprek: "${src.title}" op ${when} (bron: ${src.source}${speakers}).`;
}

const LIST_FIELDS = `- besluiten, actiepunten (actie, eigenaar, deadline indien genoemd) en open_vragen
- personen: sprekende of genoemde personen die op de personenlijst staan, in de schrijfwijze van de lijst
- overige_personen: andere persoonsnamen die genoemd worden (alleen de naam)
- onderwerpen: 1-5 onderwerpen; kies uit de onderwerpenlijst, of formuleer kort een nieuw onderwerp als niets past`;

/** Split on line boundaries so a chunk never cuts a sentence in half. */
export function chunk(text: string, size: number): string[] {
  const out: string[] = [];
  let current = '';
  for (const para of text.split(/\n{2,}/)) {
    if (current && current.length + para.length + 2 > size) {
      out.push(current);
      current = '';
    }
    if (para.length > size) {
      for (let i = 0; i < para.length; i += size) out.push(para.slice(i, i + size));
      continue;
    }
    current = current ? `${current}\n\n${para}` : para;
  }
  if (current) out.push(current);
  return out;
}

function normalize(raw: Partial<Extraction>, types: string[]): Extraction {
  const list = (v: unknown) => (Array.isArray(v) ? v.map(x => String(x).trim()).filter(Boolean) : []);
  return {
    samenvatting: String(raw.samenvatting ?? '').trim(),
    type: types.includes(String(raw.type)) ? String(raw.type) : 'overig',
    besluiten: list(raw.besluiten),
    actiepunten: (Array.isArray(raw.actiepunten) ? raw.actiepunten : [])
      .filter(a => a && String(a.actie ?? '').trim())
      .map(a => ({
        actie: String(a.actie).trim(),
        eigenaar: a.eigenaar ? String(a.eigenaar).trim() || undefined : undefined,
        deadline: a.deadline ? String(a.deadline).trim() || undefined : undefined,
      })),
    open_vragen: list(raw.open_vragen),
    personen: list(raw.personen),
    overige_personen: list(raw.overige_personen),
    onderwerpen: list(raw.onderwerpen),
  };
}

/** Placeholder output for KB_LLM=mock: exercises every section without a model. */
const MOCK: Extraction = {
  samenvatting: 'Voorbeeldsamenvatting (KB_LLM=mock, geen taalmodel gebruikt). Mail test@example.com.',
  type: 'overleg',
  besluiten: ['Voorbeeldbesluit.'],
  actiepunten: [
    { actie: 'Voorbeeldactie met eigenaar.', eigenaar: 'TP', deadline: 'vrijdag' },
    { actie: 'Voorbeeldactie zonder eigenaar.' },
  ],
  open_vragen: ['Voorbeeldvraag?'],
  personen: ['Test Persoon'],
  overige_personen: ['Externe Contactpersoon'],
  onderwerpen: ['Testonderwerp', 'Nieuw Onderwerp'],
};

async function extract(src: SourceTranscript, vocab: Vocabulary): Promise<Extraction> {
  const system = systemPrompt(vocab);
  const schema = finalSchema(vocab.types);
  const parts = chunk(src.transcript, kbConfig.llm.chunkChars);
  const typeLine = `- type: het soort gesprek, één van: ${vocab.types.join(', ')}`;

  if (parts.length === 1) {
    const raw = await chatJson<Partial<Extraction>>(system, `${header(src)}
Geef:
- samenvatting: 3-8 zinnen lopende tekst over het hele gesprek
${typeLine}
${LIST_FIELDS}

Transcript:
"""
${parts[0]}
"""`, schema, MOCK);
    return normalize(raw, vocab.types);
  }

  const partials: unknown[] = [];
  for (const [i, part] of parts.entries()) {
    partials.push(await chatJson(system, `${header(src)}
Dit is deel ${i + 1} van ${parts.length}. Geef voor dit deel:
- kernpunten: de belangrijkste inhoudelijke punten (maximaal 8)
${LIST_FIELDS}

Transcript (deel ${i + 1}):
"""
${part}
"""`, PART_SCHEMA, {}));
  }
  const raw = await chatJson<Partial<Extraction>>(system, `${header(src)}
Hieronder staan de deelresultaten (JSON) van alle ${parts.length} delen van dit gesprek, in volgorde.
Combineer ze tot één resultaat:
- samenvatting: 3-8 zinnen lopende tekst over het hele gesprek
${typeLine}
- besluiten, actiepunten en open_vragen: ontdubbeld; vervalt een open vraag doordat hij later beantwoord is, laat hem dan weg
- personen, overige_personen: ontdubbeld
- onderwerpen: 1-5 voor het hele gesprek

${JSON.stringify(partials)}`, schema, MOCK);
  return normalize(raw, vocab.types);
}

function cachePath(hash: string): string {
  return path.join(kbConfig.cacheDir, 'extract', `${hash}.json`);
}

export function cachedExtraction(src: SourceTranscript): Extraction | undefined {
  const entry = readJson<CacheEntry | null>(cachePath(src.hash), null);
  return entry && entry.version === PROMPT_VERSION ? entry.extraction : undefined;
}

/** Cached per transcript content: unchanged transcripts never hit the model again. */
export async function getExtraction(src: SourceTranscript, vocab: Vocabulary, force = false): Promise<Extraction> {
  const cached = force ? undefined : cachedExtraction(src);
  if (cached) return cached;
  const extraction = await extract(src, vocab);
  if (kbConfig.llm.provider !== 'mock') {
    writeJson(cachePath(src.hash), {
      version: PROMPT_VERSION,
      model: kbConfig.llm.model,
      extraction,
      createdAt: new Date().toISOString(),
    } satisfies CacheEntry);
  }
  return extraction;
}
