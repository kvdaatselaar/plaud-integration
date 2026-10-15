import { chatJson } from './llm.js';
import { chunk, PRIVACY_RULES } from './extract.js';
import { dropHealthOrPrivate, isHealthOrPrivate, redact } from './redact.js';
import type { SourceTranscript } from './sources.js';
import type { Vocabulary } from './vocabulary.js';

// A question about one conversation, answered by the local model from the raw transcript.
// The transcript never leaves this Mac: only the answer does, after the same privacy rules and
// filters as the summaries. This is how the /kennisbank skill gets past a summary that is too brief.

/** Large parts: fewer calls, and a part still fits the model's context with room for the answer. */
const PART_CHARS = 36_000;
const MAX = { punten: 12, antwoordPunten: 15 };

export interface Point {
  tijd: string;
  tekst: string;
}

export interface TranscriptAnswer {
  antwoord: string;
  punten: Point[];
  onzeker: string;
  /** Parts of the transcript the model read, and how many there are. */
  gelezen: number[];
  delen: number;
  /** Names outside the fixed list that were replaced by [naam]. */
  weggelaten: number;
}

const str = { type: 'string' };
const points = (max: number) => ({
  type: 'array',
  maxItems: max,
  items: { type: 'object', properties: { tijd: str, tekst: str }, required: ['tijd', 'tekst'] },
});

function system(vocab: Vocabulary): string {
  const persons = vocab.persons.map(p => `- ${p.naam}${p.aliassen.length ? ` (ook: ${p.aliassen.join(', ')})` : ''}`).join('\n');
  return `Je beantwoordt een vraag over één zakelijk gesprek van Zig, een softwareleverancier voor woningcorporaties, op basis van het automatische transcript. Je antwoordt in het Nederlands.${vocab.owner ? ` De eigenaar van de kennisbank, die de vraag stelt, is ${vocab.owner.naam}.` : ''}

${PRIVACY_RULES}

INHOUD:
- Alleen wat in het transcript staat; verzin of vul niets aan. Staat het er niet in, zeg dat.
- Spraakherkenning maakt fouten; gebruik de schrijfwijze van de personenlijst als een naam daar duidelijk op lijkt.
- Geef bij elk punt het tijdstip uit het transcript ([uu:mm:ss]) waar het besproken werd.
- Onderscheid wat besloten of afgesproken is van wat alleen besproken of voorgesteld werd.
- Citeer niet letterlijk; beschrijf kort in eigen woorden.

Personenlijst:
${persons || '(leeg)'}`;
}

/** Answers a question from the transcript of one conversation, part by part, then combined. */
export async function askTranscript(
  src: SourceTranscript,
  question: string,
  vocab: Vocabulary,
  log: (m: string) => void = () => {},
): Promise<TranscriptAnswer> {
  const parts = chunk(src.transcript, PART_CHARS);
  const sys = system(vocab);
  const header = `Gesprek: "${src.title}" (${src.durationMin} min).`;
  const names = new Set<string>();
  const found: { deel: number; punten: Point[] }[] = [];

  for (const [i, part] of parts.entries()) {
    log(`deel ${i + 1}/${parts.length}`);
    const raw = await chatJson<{ relevant?: boolean; punten?: Point[]; personen?: string[] }>(sys, `${header}
Dit is deel ${i + 1} van ${parts.length} van het transcript.
Vraag: ${question}

Geef de punten uit dit deel die de vraag beantwoorden (maximaal ${MAX.punten}), met tijdstip. relevant=false en geen punten als dit deel er niets over zegt. personen: alle persoonsnamen die je in de punten noemt.

Transcript (deel ${i + 1}):
"""
${part}
"""`, {
      type: 'object',
      properties: { relevant: { type: 'boolean' }, punten: points(MAX.punten), personen: { type: 'array', items: str } },
      required: ['relevant', 'punten', 'personen'],
    }, { relevant: false, punten: [], personen: [] });
    for (const n of raw.personen ?? []) names.add(String(n));
    const kept = (raw.punten ?? []).filter(p => p?.tekst?.trim());
    if (raw.relevant !== false && kept.length) found.push({ deel: i + 1, punten: kept });
  }

  let antwoord = 'Het transcript zegt hier niets over.';
  let punten: Point[] = [];
  let onzeker = '';
  if (found.length) {
    const raw = await chatJson<{ antwoord?: string; punten?: Point[]; onzeker?: string; personen?: string[] }>(sys, `${header}
Vraag: ${question}

Hieronder staan de punten die per deel van het transcript gevonden zijn (JSON, in volgorde). Geef:
- antwoord: 2-8 zinnen die de vraag beantwoorden, met eerst wat besloten of afgesproken is
- punten: de belangrijkste punten met tijdstip, ontdubbeld en in volgorde (maximaal ${MAX.antwoordPunten})
- onzeker: wat uit het transcript niet duidelijk wordt (leeg als alles duidelijk is)
- personen: alle persoonsnamen die je noemt

${JSON.stringify(found)}`, {
      type: 'object',
      properties: { antwoord: str, punten: points(MAX.antwoordPunten), onzeker: str, personen: { type: 'array', items: str } },
      required: ['antwoord', 'punten', 'onzeker', 'personen'],
    }, { antwoord: 'mock', punten: [], onzeker: '', personen: [] });
    for (const n of raw.personen ?? []) names.add(String(n));
    antwoord = String(raw.antwoord ?? '').trim() || antwoord;
    punten = (raw.punten ?? []).filter(p => p?.tekst?.trim());
    onzeker = String(raw.onzeker ?? '').trim();
  }

  // The same safety net as the summaries: identifiers out, names outside the list as [naam],
  // nothing about anyone's health or private life.
  const unlisted = [...names].map(n => n.trim()).filter(n => n.length > 1 && !vocab.matchPerson(n) && !vocab.matchOrganisation(n));
  let replaced = 0;
  const clean = (t: string) => {
    const out = redact(dropHealthOrPrivate(t), unlisted);
    replaced += (out.match(/\[naam\]/g)?.length ?? 0) - (t.match(/\[naam\]/g)?.length ?? 0);
    return out;
  };
  return {
    antwoord: clean(antwoord),
    punten: punten.filter(p => !isHealthOrPrivate(p.tekst)).map(p => ({ tijd: String(p.tijd ?? '').trim(), tekst: clean(p.tekst) })),
    onzeker: clean(onzeker),
    gelezen: parts.map((_, i) => i + 1),
    delen: parts.length,
    weggelaten: Math.max(0, replaced),
  };
}

/** Rough duration, for telling the user how long a question will take. */
export const estimateMinutes = (src: SourceTranscript) => Math.max(1, Math.ceil(chunk(src.transcript, PART_CHARS).length * 1.2 + 0.5));

