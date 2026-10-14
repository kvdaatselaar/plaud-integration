import * as fs from 'node:fs';
import * as path from 'node:path';
import { kbConfig } from '../src/kb/config.js';
import { loadVocabulary, normalizeKey, wordPattern, type VocabEntry } from '../src/kb/vocabulary.js';
import { loadConversations, type IndexedConversation } from '../src/kb/index-builder.js';
import { slugify, splitFrontmatter } from '../src/kb/files.js';
import { isAcronym, soundKey } from '../src/kb/soundkey.js';

// Search the knowledge base the way the index is built: a term resolves to a person, topic,
// organisation or series (name, aliases, spelling variants), and conversations are ranked by
// where it occurs: in the metadata first, then in the text. Read-only; prints Markdown for
// the /kennisbank skill or the terminal. Nothing leaves the Mac.
//   npm run kb:zoek -- "Jan de Vries" datamigratie
//   npm run kb:zoek -- --van=2026-09-01 --tot=2026-09-30 --type=klantgesprek
//   npm run kb:zoek -- WoonNet migratie --alle --max=0

const arg = (name: string) => process.argv.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const FROM = arg('van');
const TO = arg('tot');
const TYPE = arg('type');
const ALL_TERMS = process.argv.includes('--alle');
const MAX = Number(arg('max') ?? 60);
const TERMS = process.argv.slice(2).filter(a => !a.startsWith('--')).map(t => t.trim()).filter(Boolean);

type Kind = 'persoon' | 'onderwerp' | 'organisatie' | 'reeks';

interface Entity {
  kind: Kind;
  naam: string;
  variants: string[];
  /** Page relative to the knowledge base, when it exists (only entities with conversations get one). */
  page?: string;
  parent?: string;
}

interface Resolved {
  term: string;
  /** Entities the term names exactly (name or alias), or else the best partial matches. */
  entities: Entity[];
  /** Partial matches shown as "ook mogelijk" when there is an exact one. */
  maybe: Entity[];
  patterns: { phrase: string; re: RegExp }[];
}

interface Hit {
  conv: IndexedConversation;
  score: number;
  reasons: string[];
  terms: Set<string>;
  inMeta: boolean;
}

const DIRS: Record<Kind, string> = { persoon: 'personen', onderwerp: 'onderwerpen', organisatie: 'organisaties', reeks: 'reeksen' };

function entity(kind: Kind, e: Pick<VocabEntry, 'naam' | 'aliassen' | 'parent'>): Entity {
  const page = `${DIRS[kind]}/${slugify(e.naam)}.md`;
  return {
    kind,
    naam: e.naam,
    variants: [e.naam, ...e.aliassen],
    page: fs.existsSync(path.join(kbConfig.dir, page)) ? page : undefined,
    parent: e.parent,
  };
}

const padded = (s: string) => ` ${normalizeKey(s)} `;

/** exact: name or alias; part: whole words of one inside the other ("Vries" ~ "Jan de Vries"); sound: misheard spelling. */
function matchKind(term: string, variant: string): 'exact' | 'part' | 'sound' | undefined {
  const t = normalizeKey(term);
  const v = normalizeKey(variant);
  if (!t || !v) return undefined;
  if (t === v) return 'exact';
  if ((t.length >= 3 && padded(v).includes(` ${t} `)) || (v.length >= 3 && padded(t).includes(` ${v} `))) return 'part';
  if (t.length >= 4 && !isAcronym(term) && !isAcronym(variant) && soundKey(term) === soundKey(variant)) return 'sound';
  return undefined;
}

/**
 * Compounds are common in Dutch ("datamigratieplan"), so longer phrases match anywhere in a word;
 * short ones ("AI", "HR") only as a whole word, or they would hit inside every other word.
 */
function textPattern(phrase: string): RegExp {
  const p = phrase.normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  return p.length >= 5 ? new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') : wordPattern(p);
}

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

function resolve(term: string, entities: Entity[]): Resolved {
  const scored = entities
    .map(e => ({ e, kinds: e.variants.map(v => matchKind(term, v)).filter(Boolean) }))
    .filter(x => x.kinds.length > 0);
  const exact = scored.filter(x => x.kinds.includes('exact')).map(x => x.e);
  const partial = scored.filter(x => !x.kinds.includes('exact')).map(x => x.e);
  const chosen = exact.length ? exact : partial;
  const phrases = [...new Set([term, ...chosen.flatMap(e => e.variants)].filter(p => p.trim().length >= 2))];
  return {
    term,
    entities: chosen,
    maybe: exact.length ? partial : [],
    patterns: phrases.map(phrase => ({ phrase, re: textPattern(phrase) })),
  };
}

/** Body sections by heading, plus the title; the metadata block is matched separately. */
function textSections(file: string): Map<string, string> {
  const out = new Map<string, string>();
  const body = splitFrontmatter(fs.readFileSync(file, 'utf-8'))?.body ?? '';
  out.set('titel', fold(body.match(/^# (.+)$/m)?.[1] ?? ''));
  for (const part of body.split(/^## /m).slice(1)) {
    const nl = part.indexOf('\n');
    out.set(part.slice(0, nl).trim(), fold(part.slice(nl + 1)));
  }
  return out;
}

function metaReasons(c: IndexedConversation, e: Entity): { score: number; why: string }[] {
  const out: { score: number; why: string }[] = [];
  if (e.kind === 'persoon') {
    if (c.over === e.naam) out.push({ score: 5, why: `over ${e.naam}` });
    else if (c.personen.includes(e.naam)) out.push({ score: 2, why: `met ${e.naam}` });
  } else if (e.kind === 'onderwerp') {
    if (c.onderwerpen.includes(e.naam)) out.push({ score: 4, why: `onderwerp ${e.naam}` });
    else if (c.hoofdonderwerpen.includes(e.naam)) out.push({ score: 3, why: `onder ${e.naam}` });
  } else if (e.kind === 'organisatie') {
    if (c.organisaties.includes(e.naam)) out.push({ score: 3, why: `organisatie ${e.naam}` });
  } else if (c.reeks === e.naam) {
    out.push({ score: 4, why: `reeks ${e.naam}` });
  }
  return out;
}

const TEXT_WEIGHT: Record<string, number> = { titel: 2, Besluiten: 2, Actiepunten: 2, 'Open vragen': 1, Samenvatting: 1, Notities: 1 };

function search(convs: IndexedConversation[], resolved: Resolved[]): Hit[] {
  const hits: Hit[] = [];
  for (const conv of convs) {
    const hit: Hit = { conv, score: 0, reasons: [], terms: new Set(), inMeta: false };
    let sections: Map<string, string> | undefined;
    for (const r of resolved) {
      const meta = r.entities.flatMap(e => metaReasons(conv, e));
      sections ??= textSections(path.join(kbConfig.dir, conv.rel));
      const inText = [...sections].filter(([, text]) => r.patterns.some(p => p.re.test(text))).map(([name]) => name);
      if (!meta.length && !inText.length) continue;
      hit.terms.add(r.term);
      hit.inMeta ||= meta.length > 0;
      hit.score += meta.reduce((n, m) => n + m.score, 0) + Math.min(4, inText.reduce((n, s) => n + (TEXT_WEIGHT[s] ?? 1), 0));
      hit.reasons.push(...meta.map(m => m.why));
      if (inText.length) hit.reasons.push(`tekst "${r.term}": ${inText.join(', ')}`);
    }
    if (!resolved.length || (ALL_TERMS ? hit.terms.size === resolved.length : hit.terms.size > 0)) hits.push(hit);
  }
  return hits.sort((a, b) => b.score - a.score || `${b.conv.datum} ${b.conv.tijd}`.localeCompare(`${a.conv.datum} ${a.conv.tijd}`));
}

const cell = (s: string) => s.replace(/\|/g, '\\|');
const describe = (e: Entity) => {
  const also = e.variants.slice(1);
  return [
    `${e.kind} **${e.naam}**`,
    e.parent && `(onder ${e.parent})`,
    e.page ? `· ${e.page}` : '· nog geen pagina (geen gesprekken)',
    also.length && `· ook: ${also.slice(0, 8).join(', ')}${also.length > 8 ? ', …' : ''}`,
  ].filter(Boolean).join(' ');
};

function main(): void {
  if (process.argv.length <= 2) {
    console.error('Gebruik: npm run kb:zoek -- <zoekterm> [<zoekterm> …] [--van=JJJJ-MM-DD] [--tot=JJJJ-MM-DD] [--type=…] [--alle] [--max=N|0]');
    process.exit(1);
  }
  if (!fs.existsSync(kbConfig.conversationsDir)) {
    console.error(`Geen kennisbank in ${kbConfig.dir}. Draai eerst: npm run kb`);
    process.exit(1);
  }

  const vocab = loadVocabulary();
  const all = loadConversations();
  const series = [...new Set(all.map(c => c.reeks).filter((s): s is string => !!s))];
  const entities = [
    ...vocab.persons.map(e => entity('persoon', e)),
    ...vocab.topics.map(e => entity('onderwerp', e)),
    ...vocab.organisations.map(e => entity('organisatie', e)),
    ...series.map(naam => entity('reeks', { naam, aliassen: [] })),
  ];

  const convs = all.filter(c =>
    (!FROM || c.datum >= FROM) && (!TO || c.datum <= TO)
    && (!TYPE || normalizeKey(c.type) === normalizeKey(TYPE)));
  const resolved = TERMS.map(t => resolve(t, entities));
  const hits = search(convs, resolved);
  const shown = MAX > 0 ? hits.slice(0, MAX) : hits;
  const range = all.length ? `${all[all.length - 1].datum} – ${all[0].datum}` : '—';
  const filters = [FROM && `van ${FROM}`, TO && `tot en met ${TO}`, TYPE && `type ${TYPE}`, ALL_TERMS && 'alle termen'].filter(Boolean);

  const out = [
    '# Zoekresultaat kennisbank',
    '',
    `Kennisbank: ${kbConfig.dir}  `,
    `Bijgewerkt tot: ${all[0]?.datum ?? '—'} · ${all.length} gesprekken (${range})${filters.length ? ` · filter: ${filters.join(', ')}` : ''}`,
    '',
  ];
  if (resolved.length) {
    out.push('## Zoektermen', '');
    for (const r of resolved) {
      if (!r.entities.length) out.push(`- "${r.term}" → geen persoon, onderwerp, organisatie of reeks; alleen in de tekst gezocht`);
      else out.push(`- "${r.term}" → ${r.entities.slice(0, 6).map(describe).join('\n  - ')}${r.entities.length > 6 ? `\n  - … en ${r.entities.length - 6} meer: maak de term specifieker` : ''}`);
      if (r.maybe.length) out.push(`  - ook mogelijk: ${r.maybe.slice(0, 6).map(e => `${e.naam} (${e.kind})`).join(', ')}`);
    }
    const pages = [...new Set(resolved.flatMap(r => r.entities.slice(0, 6).map(e => e.page)).filter(Boolean))];
    if (pages.length) out.push('', '## Eerst lezen', '', ...pages.map(p => `- ${p}`));
    out.push('');
  }

  const inMeta = hits.filter(h => h.inMeta).length;
  out.push(`## Gesprekken: ${hits.length}${resolved.length ? ` (${inMeta} op metadata, ${hits.length - inMeta} alleen in de tekst)` : ''}`, '');
  if (!hits.length) {
    out.push('_Geen treffers._ Probeer een andere schrijfwijze, een breder (hoofd)onderwerp of minder filters; de namen staan in INDEX.md.');
  } else {
    out.push(
      '| Score | Datum | Type | Gesprek | Waarom |',
      '|---:|---|---|---|---|',
      ...shown.map(h => `| ${h.score} | ${h.conv.datum} | ${h.conv.type} | ${cell(h.conv.rel)} | ${cell(h.reasons.join('; ') || '—')} |`),
    );
    if (shown.length < hits.length) out.push('', `_… en ${hits.length - shown.length} meer met een lagere score: --max=0 toont alles._`);
  }
  console.log(out.join('\n'));
}

main();
