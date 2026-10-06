import { Document, Scalar, parse } from 'yaml';
import { kbConfig, GENERATED_MARKER } from './config.js';
import { safeFileName, slugify, splitFrontmatter } from './files.js';
import { redact } from './redact.js';
import { normalizeKey, type Vocabulary } from './vocabulary.js';
import type { Extraction } from './extract.js';
import type { SourceTranscript } from './sources.js';

export interface Candidate {
  name: string;
  kind: 'persoon' | 'onderwerp';
  /** Where the name came from: spoken in a Teams transcript, or mentioned. */
  origin: 'spreker' | 'genoemd' | 'onderwerp';
}

export interface Conversation {
  id: string;
  /** Path relative to the conversations dir: "2026-10/2026-10-05 12-00 — Titel.md". */
  relPath: string;
  content: string;
  candidates: Candidate[];
}

/** Section markers that survive regeneration. */
const NOTES_HEADING = '## Notities';
const NOTES_PLACEHOLDER = '_Eigen aantekeningen hier blijven bewaard bij het opnieuw genereren._';

export interface CarryOver {
  checked: Set<string>;
  notes: string;
}

function localParts(ms: number): { date: string; time: string; yyyyMm: string; long: string } {
  const d = new Date(ms);
  const get = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-CA', { timeZone: kbConfig.timeZone, ...opts }).format(d);
  const date = get({ year: 'numeric', month: '2-digit', day: '2-digit' });
  const time = get({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const long = d.toLocaleDateString('nl-NL', { timeZone: kbConfig.timeZone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return { date, time, yyyyMm: date.slice(0, 7), long };
}

/** Core text of an action line, for matching checkbox state across regenerations. */
export function actionKey(line: string): string {
  return normalizeKey(
    line
      .replace(/^- \[[ xX]\] /, '')
      .replace(/^\*\*[^*]+:\*\* /, '')
      .replace(/ _\(deadline: [^)]*\)_$/, ''),
  );
}

/** Notes and ticked actions from an existing conversation file, to keep them on regeneration. */
export function readCarryOver(body: string): CarryOver {
  const checked = new Set<string>();
  for (const m of body.matchAll(/^- \[[xX]\] .*$/gm)) checked.add(actionKey(m[0]));
  const notes = body.split(new RegExp(`^${NOTES_HEADING}\\s*$`, 'm'))[1]?.split(/^## /m)[0]?.trim() ?? '';
  return { checked, notes: notes === NOTES_PLACEHOLDER ? '' : notes };
}

export function parseConversationFile(text: string): { meta: Record<string, unknown>; body: string } | null {
  const parts = splitFrontmatter(text);
  if (!parts || !text.includes(GENERATED_MARKER)) return null;
  return { meta: (parse(parts.yaml) ?? {}) as Record<string, unknown>, body: parts.body };
}

/** Name variants to blank out: unlisted names plus their parts, unless a part belongs to a listed person or term. */
function unlistedVariants(names: string[], vocab: Vocabulary): string[] {
  const protectedTokens = new Set<string>();
  for (const e of [...vocab.persons, ...vocab.topics]) {
    for (const v of [e.naam, ...e.aliassen, e.organisatie ?? '']) {
      for (const t of normalizeKey(v).split(' ')) if (t) protectedTokens.add(t);
    }
  }
  const out = new Set<string>();
  for (const name of names) {
    if (!protectedTokens.has(normalizeKey(name))) out.add(name);
    for (const part of name.split(/\s+/)) {
      if (part.length >= 3 && !protectedTokens.has(normalizeKey(part))) out.add(part);
    }
  }
  return [...out];
}

/** YAML 1.1 readers parse an unquoted 09:13 as a number; quote the time explicitly. */
function yamlFrontmatter(data: Record<string, unknown>): string {
  const doc = new Document(data);
  const time = doc.get('tijd', true);
  if (time instanceof Scalar) time.type = Scalar.QUOTE_DOUBLE;
  return doc.toString().trim();
}

const link = (dir: string, name: string) => `[${name}](../../${dir}/${slugify(name)}.md)`;

export function buildConversation(src: SourceTranscript, ex: Extraction, vocab: Vocabulary, carry?: CarryOver): Conversation {
  const candidates: Candidate[] = [];
  const persons = new Set<string>();
  const unlisted: string[] = [];
  const consider = (raw: string, origin: Candidate['origin']) => {
    const hit = vocab.matchPerson(raw);
    if (hit) persons.add(hit.naam);
    else {
      unlisted.push(raw);
      candidates.push({ name: raw, kind: 'persoon', origin });
    }
  };
  for (const s of src.speakers) consider(s, 'spreker');
  for (const p of [...ex.personen, ...ex.overige_personen]) consider(p, 'genoemd');

  const topics = new Set<string>();
  for (const t of ex.onderwerpen) {
    const hit = vocab.matchTopic(t);
    if (hit) topics.add(hit.naam);
    else candidates.push({ name: t, kind: 'onderwerp', origin: 'onderwerp' });
  }

  const blank = unlistedVariants(unlisted, vocab);
  const clean = (s: string) => redact(s, blank);
  const when = localParts(src.startMs);
  const title = clean(src.title);
  const personList = [...persons].sort((a, b) => a.localeCompare(b, 'nl'));
  const topicList = [...topics].sort((a, b) => a.localeCompare(b, 'nl'));
  const id = `g-${src.hash.slice(0, 10)}`;

  const frontmatter = {
    id,
    titel: title,
    datum: when.date,
    tijd: when.time,
    duur_min: src.durationMin,
    type: ex.type,
    personen: personList,
    onderwerpen: topicList,
    bron: src.source,
    bronbestand: src.relPath,
    gegenereerd: `${GENERATED_MARKER} (kb:enrich)`,
  };

  const bullets = (items: string[], empty: string) => (items.length ? items.map(i => `- ${clean(i)}`).join('\n') : `_${empty}_`);
  const actionLines = ex.actiepunten.map(a => {
    const owner = a.eigenaar ? vocab.matchPerson(a.eigenaar)?.naam : undefined;
    const text = clean(a.actie);
    const deadline = a.deadline ? ` _(deadline: ${clean(a.deadline)})_` : '';
    const line = `${owner ? `**${owner}:** ` : ''}${text}${deadline}`;
    const done = carry?.checked.has(actionKey(`- [ ] ${line}`)) ? 'x' : ' ';
    return `- [${done}] ${line}`;
  });

  const body = [
    `# ${title}`,
    '',
    `${when.long} om ${when.time} · ${src.durationMin} min · ${ex.type} · bron: ${src.source === 'teams' ? 'Teams' : 'Plaud'}`,
    '',
    `**Personen:** ${personList.length ? personList.map(p => link('personen', p)).join(', ') : '—'}  `,
    `**Onderwerpen:** ${topicList.length ? topicList.map(t => link('onderwerpen', t)).join(', ') : '—'}`,
    '',
    '## Samenvatting',
    '',
    clean(ex.samenvatting) || '_Geen samenvatting._',
    '',
    '## Besluiten',
    '',
    bullets(ex.besluiten, 'Geen besluiten vastgelegd.'),
    '',
    '## Actiepunten',
    '',
    actionLines.length ? actionLines.join('\n') : '_Geen actiepunten._',
    '',
    '## Open vragen',
    '',
    bullets(ex.open_vragen, 'Geen open vragen.'),
    '',
    NOTES_HEADING,
    '',
    carry?.notes || NOTES_PLACEHOLDER,
    '',
  ].join('\n');

  const fileBase = safeFileName(`${when.date} ${when.time.replace(':', '-')} — ${title}`);
  return {
    id,
    relPath: `${when.yyyyMm}/${fileBase}.md`,
    content: `---\n${yamlFrontmatter(frontmatter)}\n---\n\n${body}`,
    candidates,
  };
}

/** Disambiguate two conversations that land on the same file name (e.g. Plaud and Teams of one meeting). */
export function withSuffix(relPath: string, suffix: string): string {
  return relPath.replace(/\.md$/, ` (${suffix}).md`);
}

