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
  personen: string[];
  onderwerpen: string[];
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
      personen: list(m.personen),
      onderwerpen: list(m.onderwerpen),
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
const personLink = (name: string, prefix: string) => `[${name}](${prefix}personen/${slugify(name)}.md)`;
const topicLink = (name: string, prefix: string) => `[${name}](${prefix}onderwerpen/${slugify(name)}.md)`;

function countBy(items: string[]): [string, number][] {
  const m = new Map<string, number>();
  for (const i of items) m.set(i, (m.get(i) ?? 0) + 1);
  return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'nl'));
}

function actionLine(a: Action, c: IndexedConversation, prefix: string): string {
  return `- [ ] ${a.owner ? `**${a.owner}:** ` : ''}${a.text} — ${convLink(c, prefix)} (${c.datum})`;
}

function conversationTable(convs: IndexedConversation[], prefix: string): string[] {
  return [
    '| Datum | Gesprek | Type | Onderwerpen |',
    '|---|---|---|---|',
    ...convs.map(c => `| ${c.datum} | ${cell(convLink(c, prefix))} | ${c.type} | ${cell(c.onderwerpen.join(', '))} |`),
  ];
}

function span(convs: IndexedConversation[]): string {
  return `**Gesprekken:** ${convs.length} · eerste ${convs[convs.length - 1].datum}, laatste ${convs[0].datum}`;
}

function personPage(name: string, convs: IndexedConversation[], vocab: Vocabulary): string {
  const v = vocab.matchPerson(name);
  const facts = [
    v?.organisatie && `**Organisatie:** ${v.organisatie}`,
    v?.rol && `**Rol:** ${v.rol}`,
    v?.aliassen.length && `**Ook bekend als:** ${v.aliassen.join(', ')}`,
  ].filter(Boolean).join(' · ');
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
    ...(open.length ? open : ['_Geen._']),
    '',
    '## Gesprekken',
    '',
    ...conversationTable(convs, '../'),
    '',
    '## Onderwerpen',
    '',
    ...countBy(convs.flatMap(c => c.onderwerpen)).map(([t, n]) => `- ${topicLink(t, '../')} (${n})`),
    '',
    '## Vaak samen met',
    '',
    ...countBy(convs.flatMap(c => c.personen.filter(p => p !== name))).slice(0, 15).map(([p, n]) => `- ${personLink(p, '../')} (${n})`),
    '',
  ].join('\n');
}

function topicPage(name: string, convs: IndexedConversation[], vocab: Vocabulary): string {
  const v = vocab.matchTopic(name);
  const facts = [v?.omschrijving, v?.aliassen.length && `**Ook bekend als:** ${v.aliassen.join(', ')}`].filter(Boolean).join(' · ');
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
    '## Besluiten',
    '',
    '_Uit gesprekken over dit onderwerp, nieuwste eerst._',
    '',
    ...(decisions.length ? decisions.slice(0, 60) : ['_Geen._']),
    '',
    '## Open vragen',
    '',
    ...(questions.length ? questions.slice(0, 40) : ['_Geen._']),
    '',
    '## Openstaande actiepunten',
    '',
    ...(open.length ? open.slice(0, 40) : ['_Geen._']),
    '',
    '## Gesprekken',
    '',
    ...conversationTable(convs, '../'),
    '',
    '## Betrokken personen',
    '',
    ...countBy(convs.flatMap(c => c.personen)).slice(0, 20).map(([p, n]) => `- ${personLink(p, '../')} (${n})`),
    '',
    '## Verwante onderwerpen',
    '',
    ...countBy(convs.flatMap(c => c.onderwerpen.filter(t => t !== name))).slice(0, 15).map(([t, n]) => `- ${topicLink(t, '../')} (${n})`),
    '',
  ].join('\n');
}

function indexPage(convs: IndexedConversation[], byPerson: Map<string, IndexedConversation[]>, byTopic: Map<string, IndexedConversation[]>, vocab: Vocabulary): string {
  const cutoff = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const recentOpen = convs.filter(c => c.datum >= cutoff).flatMap(c => c.acties.filter(a => !a.done).map(a => actionLine(a, c, '')));
  const byMonth = new Map<string, IndexedConversation[]>();
  for (const c of convs) byMonth.set(c.datum.slice(0, 7), [...(byMonth.get(c.datum.slice(0, 7)) ?? []), c]);
  const range = convs.length ? `${convs[convs.length - 1].datum} – ${convs[0].datum}` : '—';
  return [
    PAGE_MARKER,
    '# Kennisbank gesprekken',
    '',
    `_Bijgewerkt ${new Date().toISOString().slice(0, 10)} · ${convs.length} gesprekken (${range}) · ${byTopic.size} onderwerpen · ${byPerson.size} personen_`,
    '',
    'Hoe je deze kennisbank bevraagt staat in [CLAUDE.md](CLAUDE.md).',
    '',
    '## Openstaande actiepunten (laatste 30 dagen)',
    '',
    ...(recentOpen.length ? recentOpen.slice(0, 50) : ['_Geen._']),
    '',
    '## Onderwerpen',
    '',
    '| Onderwerp | Gesprekken | Laatst |',
    '|---|---:|---|',
    ...[...byTopic].sort((a, b) => b[1].length - a[1].length).map(([t, cs]) => `| ${cell(topicLink(t, ''))} | ${cs.length} | ${cs[0].datum} |`),
    '',
    '## Personen',
    '',
    '| Persoon | Organisatie | Gesprekken | Laatst |',
    '|---|---|---:|---|',
    ...[...byPerson].sort((a, b) => b[1].length - a[1].length).map(([p, cs]) => `| ${cell(personLink(p, ''))} | ${cell(vocab.matchPerson(p)?.organisatie ?? '')} | ${cs.length} | ${cs[0].datum} |`),
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

export function buildIndex(vocab: Vocabulary): { conversations: number; persons: number; topics: number; written: number; removed: number } {
  const convs = loadConversations();
  const byPerson = new Map<string, IndexedConversation[]>();
  const byTopic = new Map<string, IndexedConversation[]>();
  for (const c of convs) {
    for (const p of c.personen) byPerson.set(p, [...(byPerson.get(p) ?? []), c]);
    for (const t of c.onderwerpen) byTopic.set(t, [...(byTopic.get(t) ?? []), c]);
  }

  const persons = syncDir(kbConfig.personsDir, new Map([...byPerson].map(([p, cs]) => [`${slugify(p)}.md`, personPage(p, cs, vocab)])));
  const topics = syncDir(kbConfig.topicsDir, new Map([...byTopic].map(([t, cs]) => [`${slugify(t)}.md`, topicPage(t, cs, vocab)])));
  const index = writeIfChanged(path.join(kbConfig.dir, 'INDEX.md'), indexPage(convs, byPerson, byTopic, vocab)) ? 1 : 0;

  return {
    conversations: convs.length,
    persons: byPerson.size,
    topics: byTopic.size,
    written: persons.written + topics.written + index,
    removed: persons.removed + topics.removed,
  };
}
