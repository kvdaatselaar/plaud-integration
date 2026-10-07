import * as fs from 'node:fs';
import * as path from 'node:path';
import { kbConfig, GENERATED_MARKER } from './config.js';
import { listMarkdown, monthLabel, slugify, writeIfChanged } from './files.js';
import { parseConversationFile } from './conversation.js';
import type { Vocabulary } from './vocabulary.js';

export interface Action {
  done: boolean;
  owner?: string;
  text: string;
}

export interface IndexedConversation {
  /** Path relative to the knowledge-base root. */
  rel: string;
  id: string;
  titel: string;
  datum: string;
  tijd: string;
  type: string;
  reeks?: string;
  over?: string;
  personen: string[];
  hoofdonderwerpen: string[];
  onderwerpen: string[];
  organisaties: string[];
  besluiten: string[];
  acties: Action[];
  vragen: string[];
}

const PAGE_MARKER = `<!-- ${GENERATED_MARKER} (kb:index) — niet handmatig bewerken, wordt overschreven -->`;

function sections(body: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const part of body.split(/^## /m).slice(1)) {
    const nl = part.indexOf('\n');
    out.set(part.slice(0, nl).trim(), part.slice(nl + 1).trim());
  }
  return out;
}

const bulletItems = (text = '') => text.split('\n').filter(l => l.startsWith('- ')).map(l => l.slice(2).trim());

export function loadConversations(): IndexedConversation[] {
  const out: IndexedConversation[] = [];
  for (const file of listMarkdown(kbConfig.conversationsDir)) {
    const parsed = parseConversationFile(fs.readFileSync(file, 'utf-8'));
    if (!parsed) continue;
    const m = parsed.meta;
    const s = sections(parsed.body);
    const list = (v: unknown) => (Array.isArray(v) ? v.map(String) : []);
    out.push({
      rel: path.relative(kbConfig.dir, file).split(path.sep).join('/'),
      id: String(m.id ?? ''),
      titel: String(m.titel ?? path.basename(file, '.md')),
      datum: String(m.datum ?? ''),
      tijd: String(m.tijd ?? ''),
      type: String(m.type ?? 'overig'),
      reeks: m.reeks ? String(m.reeks) : undefined,
      over: m.over ? String(m.over) : undefined,
      personen: list(m.personen),
      hoofdonderwerpen: list(m.hoofdonderwerpen),
      onderwerpen: list(m.onderwerpen),
      organisaties: list(m.organisaties),
      besluiten: bulletItems(s.get('Besluiten')),
      vragen: bulletItems(s.get('Open vragen')),
      acties: (s.get('Actiepunten') ?? '').split('\n').flatMap(line => {
        const a = line.match(/^- \[([ xX])\] (?:\*\*(.+?):\*\* )?(.*)$/);
        return a ? [{ done: a[1] !== ' ', owner: a[2], text: a[3] }] : [];
      }),
    });
  }
  return out.sort((a, b) => `${b.datum} ${b.tijd}`.localeCompare(`${a.datum} ${a.tijd}`));
}

const cell = (s: string) => s.replace(/\|/g, '\\|');
/** Angle-bracket destinations keep paths with spaces readable (CommonMark). */
const convLink = (c: IndexedConversation, prefix: string) => `[${c.titel}](<${prefix}${c.rel}>)`;
const pageLink = (dir: string) => (name: string, prefix: string) => `[${name}](${prefix}${dir}/${slugify(name)}.md)`;
const personLink = pageLink('personen');
const topicLink = pageLink('onderwerpen');
const orgLink = pageLink('organisaties');
const seriesLink = pageLink('reeksen');

function countBy(items: string[]): [string, number][] {
  const m = new Map<string, number>();
  for (const i of items) m.set(i, (m.get(i) ?? 0) + 1);
  return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'nl'));
}

function groupBy(convs: IndexedConversation[], keys: (c: IndexedConversation) => string[]): Map<string, IndexedConversation[]> {
  const out = new Map<string, IndexedConversation[]>();
  for (const c of convs) for (const k of keys(c)) out.set(k, [...(out.get(k) ?? []), c]);
  return out;
}

function actionLine(a: Action, c: IndexedConversation, prefix: string): string {
  return `- [ ] ${a.owner ? `**${a.owner}:** ` : ''}${a.text} — ${convLink(c, prefix)} (${c.datum})`;
}

function conversationTable(convs: IndexedConversation[], prefix: string): string[] {
  if (convs.length === 0) return ['_Geen._'];
  return [
    '| Datum | Gesprek | Type | Onderwerpen |',
    '|---|---|---|---|',
    ...convs.map(c => `| ${c.datum} | ${cell(convLink(c, prefix))} | ${c.type} | ${cell(c.onderwerpen.join(', '))} |`),
  ];
}

function span(convs: IndexedConversation[]): string {
  return `**Gesprekken:** ${convs.length} · eerste ${convs[convs.length - 1].datum}, laatste ${convs[0].datum}`;
}

const listOrNone = (items: string[], max = Infinity) => (items.length ? items.slice(0, max) : ['_Geen._']);
const counted = (pairs: [string, number][], link: (n: string, p: string) => string, max: number) =>
  listOrNone(pairs.slice(0, max).map(([n, k]) => `- ${link(n, '../')} (${k})`));

function personPage(name: string, convs: IndexedConversation[], vocab: Vocabulary): string {
  const v = vocab.matchPerson(name);
  const facts = [
    v?.organisatie && `**Organisatie:** ${v.organisatie}`,
    v?.rol && `**Rol:** ${v.rol}`,
    v?.aliassen.length && `**Ook bekend als:** ${v.aliassen.join(', ')}`,
  ].filter(Boolean).join(' · ');
  const about = convs.filter(c => c.over === name);
  const other = convs.filter(c => c.over !== name);
  const open = convs.flatMap(c => c.acties.filter(a => !a.done && a.owner === name).map(a => actionLine(a, c, '../')));
  return [
    PAGE_MARKER,
    `# ${name}`,
    '',
    ...(facts ? [`${facts}  `] : []),
    span(convs),
    '',
    '## Openstaande actiepunten',
    '',
    ...listOrNone(open),
    '',
    `## Gesprekken over ${name}`,
    '',
    '_1-op-1\'s, ontwikkelgesprekken en andere gesprekken die over deze persoon gaan._',
    '',
    ...conversationTable(about, '../'),
    '',
    '## Andere gesprekken',
    '',
    ...conversationTable(other, '../'),
    '',
    '## Onderwerpen',
    '',
    ...counted(countBy(convs.flatMap(c => c.onderwerpen)), topicLink, 30),
    '',
    '## Vaak samen met',
    '',
    ...counted(countBy(convs.flatMap(c => c.personen.filter(p => p !== name))), personLink, 15),
    '',
  ].join('\n');
}

function topicPage(name: string, convs: IndexedConversation[], vocab: Vocabulary): string {
  const v = vocab.matchTopic(name);
  const subs = vocab.topics.filter(t => t.parent === name);
  const facts = [
    v?.parent && `**Onderdeel van:** ${topicLink(v.parent, '../')}`,
    v?.omschrijving,
    v?.aliassen.length && `**Ook bekend als:** ${v.aliassen.join(', ')}`,
  ].filter(Boolean).join(' · ');
  const subCounts = subs.map(s => [s.naam, convs.filter(c => c.onderwerpen.includes(s.naam)).length] as [string, number]);
  const decisions = convs.flatMap(c => c.besluiten.map(b => `- ${c.datum} · ${b} — ${convLink(c, '../')}`));
  const questions = convs.flatMap(c => c.vragen.map(q => `- ${c.datum} · ${q} — ${convLink(c, '../')}`));
  const open = convs.flatMap(c => c.acties.filter(a => !a.done).map(a => actionLine(a, c, '../')));
  return [
    PAGE_MARKER,
    `# ${name}`,
    '',
    ...(facts ? [`${facts}  `] : []),
    span(convs),
    '',
    ...(subs.length ? ['## Subonderwerpen', '', ...subCounts.map(([n, k]) => `- ${topicLink(n, '../')} (${k})`), ''] : []),
    '## Besluiten',
    '',
    '_Uit gesprekken over dit onderwerp, nieuwste eerst._',
    '',
    ...listOrNone(decisions, 60),
    '',
    '## Open vragen',
    '',
    ...listOrNone(questions, 40),
    '',
    '## Openstaande actiepunten',
    '',
    ...listOrNone(open, 40),
    '',
    '## Gesprekken',
    '',
    ...conversationTable(convs, '../'),
    '',
    '## Organisaties',
    '',
    ...counted(countBy(convs.flatMap(c => c.organisaties)), orgLink, 20),
    '',
    '## Betrokken personen',
    '',
    ...counted(countBy(convs.flatMap(c => c.personen)), personLink, 20),
    '',
  ].join('\n');
}

function organisationPage(name: string, convs: IndexedConversation[], vocab: Vocabulary): string {
  const v = vocab.matchOrganisation(name);
  const facts = [v?.soort && `**Soort:** ${v.soort}`, v?.aliassen.length && `**Ook bekend als:** ${v.aliassen.join(', ')}`]
    .filter(Boolean).join(' · ');
  const open = convs.flatMap(c => c.acties.filter(a => !a.done).map(a => actionLine(a, c, '../')));
  const decisions = convs.flatMap(c => c.besluiten.map(b => `- ${c.datum} · ${b} — ${convLink(c, '../')}`));
  return [
    PAGE_MARKER,
    `# ${name}`,
    '',
    ...(facts ? [`${facts}  `] : []),
    span(convs),
    '',
    '## Besluiten',
    '',
    ...listOrNone(decisions, 40),
    '',
    '## Openstaande actiepunten',
    '',
    ...listOrNone(open, 40),
    '',
    '## Gesprekken',
    '',
    ...conversationTable(convs, '../'),
    '',
    '## Onderwerpen',
    '',
    ...counted(countBy(convs.flatMap(c => c.onderwerpen)), topicLink, 20),
    '',
    '## Betrokken personen',
    '',
    ...counted(countBy(convs.flatMap(c => c.personen)), personLink, 20),
    '',
  ].join('\n');
}

function seriesPage(name: string, convs: IndexedConversation[]): string {
  const open = convs.flatMap(c => c.acties.filter(a => !a.done).map(a => actionLine(a, c, '../')));
  const about = [...new Set(convs.map(c => c.over).filter((x): x is string => !!x))];
  return [
    PAGE_MARKER,
    `# Reeks: ${name}`,
    '',
    ...(about.length ? [`**Over:** ${about.map(p => personLink(p, '../')).join(', ')}  `] : []),
    span(convs),
    '',
    '## Openstaande actiepunten',
    '',
    ...listOrNone(open, 40),
    '',
    '## Tijdlijn (nieuwste eerst)',
    '',
    ...convs.flatMap(c => [
      `### ${c.datum} — ${convLink(c, '../')}`,
      '',
      ...(c.besluiten.length ? c.besluiten.map(b => `- Besluit: ${b}`) : ['- _Geen besluiten._']),
      '',
    ]),
  ].join('\n');
}

function indexPage(
  convs: IndexedConversation[],
  pages: { persons: Map<string, IndexedConversation[]>; topics: Map<string, IndexedConversation[]>; orgs: Map<string, IndexedConversation[]>; series: Map<string, IndexedConversation[]> },
  vocab: Vocabulary,
): string {
  const cutoff = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const recentOpen = convs.filter(c => c.datum >= cutoff).flatMap(c => c.acties.filter(a => !a.done).map(a => actionLine(a, c, '')));
  const byMonth = groupBy(convs, c => [c.datum.slice(0, 7)]);
  const range = convs.length ? `${convs[convs.length - 1].datum} – ${convs[0].datum}` : '—';
  const count = (m: Map<string, IndexedConversation[]>, k: string) => m.get(k)?.length ?? 0;
  const last = (m: Map<string, IndexedConversation[]>, k: string) => m.get(k)?.[0]?.datum ?? '—';

  // Main topics in vocabulary order, with their used sub-topics; then topics outside the hierarchy.
  const mains = vocab.topics.filter(t => !t.parent && pages.topics.has(t.naam));
  const known = new Set(vocab.topics.map(t => t.naam));
  const topicLines = [
    ...mains.flatMap(m => [
      `- ${topicLink(m.naam, '')} (${count(pages.topics, m.naam)}, laatst ${last(pages.topics, m.naam)})`,
      ...vocab.topics.filter(t => t.parent === m.naam && pages.topics.has(t.naam))
        .map(t => `  - ${topicLink(t.naam, '')} (${count(pages.topics, t.naam)})`),
    ]),
    ...[...pages.topics.keys()].filter(t => !known.has(t)).map(t => `- ${topicLink(t, '')} (${count(pages.topics, t)})`),
  ];

  return [
    PAGE_MARKER,
    '# Kennisbank gesprekken',
    '',
    `_Bijgewerkt ${new Date().toISOString().slice(0, 10)} · ${convs.length} gesprekken (${range}) · ${pages.topics.size} onderwerpen · ${pages.orgs.size} organisaties · ${pages.persons.size} personen · ${pages.series.size} reeksen_`,
    '',
    'Hoe je deze kennisbank bevraagt staat in [CLAUDE.md](CLAUDE.md).',
    '',
    '## Openstaande actiepunten (laatste 30 dagen)',
    '',
    ...listOrNone(recentOpen, 50),
    '',
    '## Onderwerpen',
    '',
    ...listOrNone(topicLines),
    '',
    '## Organisaties',
    '',
    '| Organisatie | Soort | Gesprekken | Laatst |',
    '|---|---|---:|---|',
    ...[...pages.orgs].sort((a, b) => b[1].length - a[1].length)
      .map(([o, cs]) => `| ${cell(orgLink(o, ''))} | ${vocab.matchOrganisation(o)?.soort ?? ''} | ${cs.length} | ${cs[0].datum} |`),
    '',
    '## Personen',
    '',
    '| Persoon | Organisatie | Gesprekken | Waarvan over | Laatst |',
    '|---|---|---:|---:|---|',
    ...[...pages.persons].sort((a, b) => b[1].length - a[1].length)
      .map(([p, cs]) => `| ${cell(personLink(p, ''))} | ${cell(vocab.matchPerson(p)?.organisatie ?? '')} | ${cs.length} | ${cs.filter(c => c.over === p).length} | ${cs[0].datum} |`),
    '',
    '## Reeksen',
    '',
    ...listOrNone([...pages.series].sort((a, b) => b[1].length - a[1].length)
      .map(([s, cs]) => `- ${seriesLink(s, '')} (${cs.length}×, laatst ${cs[0].datum})`)),
    '',
    '## Gesprekken per maand',
    '',
    ...[...byMonth].flatMap(([month, cs]) => [
      `### ${monthLabel(month)}`,
      '',
      ...cs.map(c => `- ${c.datum} ${c.tijd} · ${c.type} · ${convLink(c, '')}${c.onderwerpen.length ? ` — ${c.onderwerpen.join(', ')}` : ''}`),
      '',
    ]),
  ].join('\n');
}

/** Rewrite generated pages in `dir`; remove generated pages that are no longer produced. */
function syncDir(dir: string, pages: Map<string, string>): { written: number; removed: number } {
  let written = 0;
  let removed = 0;
  for (const [file, content] of pages) if (writeIfChanged(path.join(dir, file), content)) written++;
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.md') || pages.has(f)) continue;
      const p = path.join(dir, f);
      if (fs.readFileSync(p, 'utf-8').startsWith(PAGE_MARKER.slice(0, 40))) {
        fs.unlinkSync(p);
        removed++;
      }
    }
  }
  return { written, removed };
}

const pageFiles = <T>(m: Map<string, T>, render: (name: string, v: T) => string) =>
  new Map([...m].map(([name, v]) => [`${slugify(name)}.md`, render(name, v)]));

export function buildIndex(vocab: Vocabulary): { conversations: number; persons: number; topics: number; organisations: number; series: number; written: number; removed: number } {
  const convs = loadConversations();
  const pages = {
    persons: groupBy(convs, c => c.personen),
    // A main-topic page covers all its sub-topics.
    topics: groupBy(convs, c => [...new Set([...c.onderwerpen, ...c.hoofdonderwerpen])]),
    orgs: groupBy(convs, c => c.organisaties),
    series: groupBy(convs, c => (c.reeks ? [c.reeks] : [])),
  };

  const results = [
    syncDir(kbConfig.personsDir, pageFiles(pages.persons, (n, cs) => personPage(n, cs, vocab))),
    syncDir(kbConfig.topicsDir, pageFiles(pages.topics, (n, cs) => topicPage(n, cs, vocab))),
    syncDir(kbConfig.organisationsDir, pageFiles(pages.orgs, (n, cs) => organisationPage(n, cs, vocab))),
    syncDir(kbConfig.seriesDir, pageFiles(pages.series, (n, cs) => seriesPage(n, cs))),
  ];
  const index = writeIfChanged(path.join(kbConfig.dir, 'INDEX.md'), indexPage(convs, pages, vocab)) ? 1 : 0;

  return {
    conversations: convs.length,
    persons: pages.persons.size,
    topics: pages.topics.size,
    organisations: pages.orgs.size,
    series: pages.series.size,
    written: results.reduce((n, r) => n + r.written, 0) + index,
    removed: results.reduce((n, r) => n + r.removed, 0),
  };
}
