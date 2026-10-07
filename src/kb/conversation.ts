import { Document, Scalar, parse } from 'yaml';
import { kbConfig, GENERATED_MARKER } from './config.js';
import { safeFileName, slugify, splitFrontmatter } from './files.js';
import { isPrivateTerm, redact } from './redact.js';
import { normalizeKey, type Vocabulary } from './vocabulary.js';
import type { Extraction } from './extract.js';
import type { SourceTranscript } from './sources.js';

export interface Candidate {
  name: string;
  kind: 'persoon' | 'onderwerp' | 'organisatie';
  /** Where the name came from: spoken in a Teams transcript, or mentioned. */
  origin: 'spreker' | 'genoemd' | 'onderwerp' | 'organisatie';
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

/**
 * @param series Raw title of the recurring series this conversation belongs to, if any.
 */
export function buildConversation(src: SourceTranscript, ex: Extraction, vocab: Vocabulary, carry?: CarryOver, series?: string): Conversation {
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

  // Topics: the most specific match; its main topic follows from the vocabulary.
  const topics = new Set<string>();
  const mainTopics = new Set<string>();
  for (const t of ex.onderwerpen) {
    const hit = vocab.matchTopic(t);
    if (hit) {
      topics.add(hit.naam);
      mainTopics.add(hit.parent ?? hit.naam);
    } else {
      // "Main topic: something new": file it under the known part until kb:beheer maps the term.
      const { term, prefix } = vocab.topicTerm(t);
      if (prefix) {
        topics.add(prefix.naam);
        mainTopics.add(prefix.parent ?? prefix.naam);
      }
      if (!isPrivateTerm(term)) candidates.push({ name: term, kind: 'onderwerp', origin: 'onderwerp' });
    }
  }
  // A main topic is redundant when one of its sub-topics is already there.
  for (const t of [...topics]) if (mainTopics.has(t) && vocab.topics.some(x => x.parent === t && topics.has(x.naam))) topics.delete(t);

  const organisations = new Set<string>();
  for (const o of ex.organisaties) {
    const hit = vocab.matchOrganisation(o);
    if (hit) organisations.add(hit.naam);
    else candidates.push({ name: o, kind: 'organisatie', origin: 'organisatie' });
  }

  // Type: a title pattern wins over the model's choice.
  const typeDef = vocab.typeFromTitle(src.title) ?? vocab.typeDefs.find(d => d.naam === ex.type);
  const type = typeDef?.naam ?? 'overig';

  // "About": for 1-op-1's etc. Title first (MBR Jan & …), then the model, then the only other person.
  let about: string | undefined;
  if (typeDef?.overPersoon) {
    const notOwner = (p?: { naam: string }) => p && p.naam !== vocab.owner?.naam;
    const inTitle = vocab.personsIn(src.title).filter(notOwner);
    const fromModel = ex.over_persoon ? vocab.matchPerson(ex.over_persoon) : undefined;
    const others = [...persons].filter(p => p !== vocab.owner?.naam);
    about = inTitle.length === 1 ? inTitle[0].naam
      : notOwner(fromModel) ? fromModel!.naam
      : others.length === 1 ? others[0] : undefined;
    if (about) persons.add(about);
  }

  const blank = unlistedVariants(unlisted, vocab);
  const clean = (s: string) => redact(s, blank);
  const when = localParts(src.startMs);
  const title = clean(src.title);
  const personList = [...persons].sort((a, b) => a.localeCompare(b, 'nl'));
  const topicList = [...topics].sort((a, b) => a.localeCompare(b, 'nl'));
  const mainList = [...mainTopics].sort((a, b) => a.localeCompare(b, 'nl'));
  const orgList = [...organisations].sort((a, b) => a.localeCompare(b, 'nl'));
  const seriesName = series ? clean(series) : undefined;
  const id = `g-${src.hash.slice(0, 10)}`;

  const frontmatter = {
    id,
    titel: title,
    datum: when.date,
    tijd: when.time,
    duur_min: src.durationMin,
    type,
    ...(seriesName ? { reeks: seriesName } : {}),
    ...(about ? { over: about } : {}),
    personen: personList,
    hoofdonderwerpen: mainList,
    onderwerpen: topicList,
    organisaties: orgList,
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
    `${when.long} om ${when.time} · ${src.durationMin} min · ${type} · bron: ${src.source === 'teams' ? 'Teams' : 'Plaud'}`,
    '',
    ...(about ? [`**Over:** ${link('personen', about)}  `] : []),
    ...(seriesName ? [`**Reeks:** ${link('reeksen', seriesName)}  `] : []),
    `**Personen:** ${personList.length ? personList.map(p => link('personen', p)).join(', ') : '—'}  `,
    `**Onderwerpen:** ${topicList.length ? topicList.map(t => {
      const parent = vocab.matchTopic(t)?.parent;
      return parent ? `${link('onderwerpen', t)} (${parent})` : link('onderwerpen', t);
    }).join(', ') : '—'}  `,
    `**Organisaties:** ${orgList.length ? orgList.map(o => link('organisaties', o)).join(', ') : '—'}`,
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

