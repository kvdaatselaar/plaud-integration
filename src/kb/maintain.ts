import * as fs from 'node:fs';
import * as path from 'node:path';
import { kbConfig } from './config.js';
import type { OrgRelation } from './extract.js';
import { chatJson } from './llm.js';
import { readJson, writeJson } from './files.js';
import { isPrivateTerm } from './redact.js';
import { ORG_KINDS, normalizeKey, type VocabEntry, type Vocabulary } from './vocabulary.js';
import { scanVariants, soundKey } from './soundkey.js';
import type { CalendarPeople } from './people.js';
import type { SourceTranscript } from './sources.js';

// Builds the automatic layer of the fixed list (vocabulaire.auto.yml) from data that
// already exists: calendar attendees, what the model found in the conversations,
// spelling variants in the transcripts, and local-model judgement for the kind of
// organisation and for mapping new terms onto the topic tree. Your own
// vocabulaire.yml always wins; `negeren` keeps things out for good.

/** Large invites (all-hands, town halls) say little about who you actually work with. */
const MAX_ATTENDEES = 15;
const MIN_PERSON = 2;
const FREE_MAIL = new Set(['gmail.com', 'googlemail.com', 'hotmail.com', 'hotmail.nl', 'outlook.com', 'live.com', 'live.nl', 'icloud.com', 'me.com', 'yahoo.com', 'ziggo.nl', 'kpnmail.nl', 'planet.nl', 'xs4all.nl', 'home.nl', 'upcmail.nl', 'gmx.net', 'gmx.de', 'web.de', 'proton.me', 'protonmail.com']);
const PARTICLES = new Set(['van', 'de', 'der', 'den', 'ter', 'ten', 'het', 'in', 'op', 'von', 'du', 'le', 'la']);

const KINDS = ORG_KINDS;

/** Bump when KINDS or the classification prompt change: cached kinds are then decided again. */
const KIND_VERSION = 2;
/** Bump when the term-mapping prompt changes. */
const TERM_VERSION = 2;


interface Cache {
  soort: Record<string, { soort: string; reden: string; v?: number }>;
  labels: Record<string, { onderwerp: string; nieuw: string; hoofd: string; v?: number }>;
}

export interface Maintenance {
  persons: (VocabEntry & { toelichting: string })[];
  organisations: (VocabEntry & { toelichting: string })[];
  topics: (VocabEntry & { toelichting: string })[];
  /** Organisations kept out because of their kind. */
  excluded: { naam: string; soort: string; reden: string }[];
  /** New sub-topics held back because nieuwe_onderwerpen is 'voorstel'. */
  proposals: { naam: string; parent: string; gesprekken: number }[];
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const domainLabel = (domain: string) => capitalize(domain.split('.').slice(-2, -1)[0] ?? domain);
const flat = (s: string) => normalizeKey(s).replace(/ /g, '');

/**
 * Raw model output per conversation. Organisation names may come from any cache version;
 * topic terms only from versions whose prompts carry the privacy rules.
 */
const FIRST_PRIVATE_EXTRACT = 3;
const FIRST_PRIVATE_ANALYSIS = 2;

interface Mentions {
  orgs: string[];
  terms: string[];
  /** How the enrichment judged each organisation's relation in this conversation. */
  relations: OrgRelation[];
}

function modelMentions(sources: SourceTranscript[]): Map<string, Mentions> {
  const out = new Map<string, Mentions>();
  for (const s of sources) {
    const exEntry = readJson<{ version?: number; extraction?: { organisaties?: string[]; onderwerpen?: string[]; relaties?: OrgRelation[] } } | null>(
      path.join(kbConfig.cacheDir, 'extract', `${s.hash}.json`), null);
    const anEntry = readJson<{ version?: number; profile?: { organisaties?: string[]; themas?: string[] } } | null>(
      path.join(kbConfig.cacheDir, 'analyse', `${s.hash}.json`), null);
    const ex = exEntry?.extraction;
    const an = anEntry?.profile;
    const orgs = [...new Set([...(ex?.organisaties ?? []), ...(an?.organisaties ?? [])])];
    const terms = [...new Set([
      ...((exEntry?.version ?? 0) >= FIRST_PRIVATE_EXTRACT ? ex?.onderwerpen ?? [] : []),
      ...((anEntry?.version ?? 0) >= FIRST_PRIVATE_ANALYSIS ? an?.themas ?? [] : []),
    ])].filter(t => !isPrivateTerm(t));
    const relations = ex?.relaties ?? [];
    if (orgs.length || terms.length) out.set(s.relPath, { orgs, terms, relations });
  }
  return out;
}

async function classify(name: string, evidence: string, vocab: Vocabulary): Promise<{ soort: string; reden: string }> {
  const groupHints = vocab.topics.map(t => t.naam).join(', ');
  const raw = await chatJson<{ soort?: string; reden?: string }>(
    `Je deelt organisaties in voor de kennisbank van Zig, een softwareleverancier voor woningcorporaties.
Soorten:
${Object.entries(KINDS).map(([k, d]) => `- ${k}: ${d}`).join('\n')}
Onderwerpen en producten binnen Zig (namen die hierop lijken horen vaak bij de groep): ${groupHints}`,
    `Organisatie: "${name}"
${evidence}
Geef de soort en in één korte zin de reden.`,
    { type: 'object', properties: { soort: { type: 'string', enum: Object.keys(KINDS) }, reden: { type: 'string' } }, required: ['soort', 'reden'] },
    { soort: 'overig', reden: 'testmodus' },
  );
  return { soort: KINDS[String(raw.soort)] ? String(raw.soort) : 'overig', reden: String(raw.reden ?? '').trim() };
}

async function mapTerms(terms: string[], vocab: Vocabulary): Promise<Cache['labels']> {
  const names = vocab.topics.map(t => t.naam);
  const mains = vocab.topics.filter(t => !t.parent).map(t => t.naam);
  const tree = vocab.topics.filter(t => !t.parent).map(m => [
    `- ${m.naam}${m.omschrijving ? `: ${m.omschrijving}` : ''}`,
    ...vocab.topics.filter(t => t.parent === m.naam).map(t => `  - ${t.naam}${t.omschrijving ? `: ${t.omschrijving}` : ''}`),
  ].join('\n')).join('\n');
  const raw = await chatJson<{ items?: { term?: string; onderwerp?: string; zeker?: boolean; nieuw_onderwerp?: string; hoofdonderwerp?: string }[] }>(
    `Je koppelt termen uit gesprekssamenvattingen aan de onderwerpenboom van een kennisbank van Zig (softwareleverancier voor woningcorporaties).
Onderwerpenboom:
${tree}

Per term:
- onderwerp: alleen als de term een synoniem, vertaling of duidelijk onderdeel is van één (sub)onderwerp. Kies het meest specifieke subonderwerp; een hoofdonderwerp alleen als de term daar letterlijk een synoniem van is. Anders leeg.
- zeker: true alleen als je de koppeling zonder twijfel zou maken. Bij twijfel: false.
- Algemene woorden die geen onderwerp zijn ("presentatie", "event", "team", "tools", "data", "software", "vergadering", "afspraken") en persoonlijke of privé-zaken (gezondheid, privéleven, beloning of beoordeling van personen): alles leeg.
- Valt een inhoudelijk vakonderwerp nergens onder: nieuw_onderwerp (korte Nederlandse naam, 1-4 woorden, geen persoons- of klantnamen) en het hoofdonderwerp waaronder het hoort. Anders beide leeg.`,
    `Termen:\n${terms.map(t => `- ${t}`).join('\n')}`,
    {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              term: { type: 'string' },
              onderwerp: { type: 'string', enum: ['', ...names] },
              zeker: { type: 'boolean' },
              nieuw_onderwerp: { type: 'string' },
              hoofdonderwerp: { type: 'string', enum: ['', ...mains] },
            },
            required: ['term', 'onderwerp', 'zeker', 'nieuw_onderwerp', 'hoofdonderwerp'],
          },
        },
      },
      required: ['items'],
    },
    { items: [] },
  );
  const out: Cache['labels'] = {};
  for (const item of raw.items ?? []) {
    const term = String(item.term ?? '');
    if (!terms.some(t => normalizeKey(t) === normalizeKey(term))) continue;
    const nieuw = String(item.nieuw_onderwerp ?? '').trim();
    out[normalizeKey(term)] = {
      onderwerp: item.zeker === true && names.includes(String(item.onderwerp)) ? String(item.onderwerp) : '',
      nieuw: isPrivateTerm(nieuw) ? '' : nieuw,
      hoofd: mains.includes(String(item.hoofdonderwerp)) ? String(item.hoofdonderwerp) : '',
      v: TERM_VERSION,
    };
  }
  // Terms the model skipped get an empty decision, so they aren't asked again every run.
  for (const t of terms) out[normalizeKey(t)] ??= { onderwerp: '', nieuw: '', hoofd: '', v: TERM_VERSION };
  return out;
}

export async function maintain(
  manual: Vocabulary,
  sources: SourceTranscript[],
  calendar: CalendarPeople | undefined,
  llm: boolean,
  log: (m: string) => void,
): Promise<Maintenance> {
  const cacheFile = path.join(kbConfig.cacheDir, 'beheer.json');
  const cache = readJson<Cache>(cacheFile, { soort: {}, labels: {} });
  const policy = manual.policy;
  const titleOf = new Map(sources.map(s => [s.relPath, s.title]));
  const ownOrg = manual.owner?.organisatie ?? (calendar ? domainLabel(calendar.me.domain) : 'Zig');

  // ── Organisations: domains of external attendees + names the model mentions, merged by sound ──
  interface OrgGroup {
    spellings: Map<string, number>;
    conversations: Set<string>;
    domains: Set<string>;
    votes: Map<string, number>;
    /** The organisation in vocabulaire.yml this group belongs to: its name and aliases decide. */
    manual?: VocabEntry;
  }
  const groups = new Map<string, OrgGroup>();
  const manualBySound = new Map<string, VocabEntry>();
  for (const o of manual.organisations) {
    for (const n of [o.naam, ...o.aliassen]) {
      const k = soundKey(n);
      if (k.length >= 4 && !manualBySound.has(k)) manualBySound.set(k, o);
    }
  }
  const group = (name: string) => {
    const own = manual.matchOrganisation(name) ?? manualBySound.get(soundKey(name));
    const key = own ? `vocabulaire:${own.naam}` : soundKey(name) || flat(name);
    const g = groups.get(key) ?? { spellings: new Map(), conversations: new Set(), domains: new Set(), votes: new Map(), manual: own };
    groups.set(key, g);
    return g;
  };
  const mentions = modelMentions(sources);
  for (const [rel, m] of mentions) {
    for (const o of m.orgs) {
      if (!flat(o)) continue;
      const g = group(o);
      g.spellings.set(o, (g.spellings.get(o) ?? 0) + 1);
      g.conversations.add(rel);
    }
    for (const r of m.relations) {
      if (!flat(r.organisatie)) continue;
      const g = group(r.organisatie);
      g.votes.set(r.soort, (g.votes.get(r.soort) ?? 0) + 1);
    }
  }
  const domainConversations = new Map<string, Set<string>>();
  for (const [rel, attendees] of calendar?.attendeesBy ?? []) {
    for (const a of attendees) {
      const d = a.address.split('@')[1];
      if (!d || d === calendar!.me.domain || FREE_MAIL.has(d)) continue;
      domainConversations.set(d, new Set([...(domainConversations.get(d) ?? []), rel]));
    }
  }
  for (const [d, convs] of domainConversations) {
    if (convs.size < 2) continue;
    const g = group(domainLabel(d));
    g.domains.add(d);
    for (const c of convs) g.conversations.add(c);
  }

  const orgForDomain = new Map<string, string>();
  const organisations: Maintenance['organisations'] = [];
  const excluded: Maintenance['excluded'] = [];
  for (const g of groups.values()) {
    // Organisations you listed yourself need no minimum; others must recur.
    if (!g.manual && g.domains.size === 0 && g.conversations.size < policy.minGesprekkenOrganisatie) continue;
    const spellings = [...g.spellings].sort((a, b) => b[1] - a[1]).map(([s]) => s);
    const labels = [...g.domains].map(domainLabel);
    // Prefer the spelling that matches an e-mail domain ("Acme" over the misheard "Akme").
    const naam = g.manual?.naam
      ?? spellings.find(s => labels.some(l => flat(l) === flat(s)))
      ?? labels[0]
      ?? spellings.find(s => /^\p{Lu}/u.test(s))
      ?? spellings[0];
    if (manual.ignored(naam) || (!g.manual && (flat(naam) === flat(ownOrg) || manual.matchTopic(naam)))) continue;
    const known = [naam, ...(g.manual?.aliassen ?? [])].map(flat);
    const aliassen = [...new Set([...spellings, ...labels].filter(s => !known.includes(flat(s))))];
    for (const d of g.domains) orgForDomain.set(d, naam);

    const key = normalizeKey(naam);
    const fixed = manual.matchOrganisation(naam)?.soort;
    const cached = cache.soort[key]?.v === KIND_VERSION ? cache.soort[key] : undefined;
    // The enrichment read the whole conversation; a clear majority of its judgements decides.
    const votes = [...g.votes].sort((a, b) => b[1] - a[1]);
    const total = votes.reduce((n, [, c]) => n + c, 0);
    const voted = total >= 2 && votes[0][1] * 2 > total
      ? { soort: votes[0][0], reden: `zo beoordeeld in ${votes[0][1]} van ${total} verrijkte gesprekken` }
      : undefined;
    let kind = fixed ? { soort: fixed, reden: 'vastgelegd in vocabulaire.yml' } : voted ?? cached;
    if (!kind && llm) {
      const convs = [...g.conversations];
      const evidence = [
        `Komt voor in ${convs.length} gesprek(ken).`,
        g.domains.size ? `E-maildomein van deelnemers: ${[...g.domains].join(', ')}.` : '',
        `Titels van die gesprekken: ${convs.slice(0, 8).map(c => `"${titleOf.get(c)}"`).join('; ')}.`,
        `Typen: ${[...new Set(convs.map(c => manual.typeFromTitle(titleOf.get(c) ?? '')?.naam ?? 'onbekend'))].join(', ')}.`,
        `Termen in die gesprekken: ${[...new Set(convs.flatMap(c => mentions.get(c)?.terms ?? []))].slice(0, 12).join(', ')}.`,
        total ? `Oordeel per gesprek: ${votes.map(([k, n]) => `${k} ${n}×`).join(', ')}.` : '',
      ].filter(Boolean).join('\n');
      kind = await classify(naam, evidence, manual);
      cache.soort[key] = { ...kind, v: KIND_VERSION };
      log(`   soort ${naam}: ${kind.soort}`);
    }
    const toelichting = `${g.conversations.size} gesprekken${g.domains.size ? `, domein ${[...g.domains].join(', ')}` : ''}${kind ? `; ${kind.reden}` : ''}`;
    if (kind && policy.uitsluitenSoorten.includes(kind.soort)) {
      excluded.push({ naam, soort: kind.soort, reden: kind.reden });
      continue;
    }
    organisations.push({ naam, aliassen, soort: kind?.soort, toelichting });
  }

  // ── Persons: attendees of the (small) meetings that were recorded ──
  const seen = new Map<string, { name: string; count: number }>();
  const titleProof = new Map<string, Set<string>>();
  for (const [rel, attendees] of calendar?.attendeesBy ?? []) {
    if (attendees.length > MAX_ATTENDEES) continue;
    const title = titleOf.get(rel) ?? '';
    for (const a of attendees) {
      const e = seen.get(a.address) ?? { name: a.name, count: 0 };
      e.count++;
      seen.set(a.address, e);
      // Which "Ron" is meant in "MBR Ron & …": the one who attended.
      const first = a.name.split(/\s+/)[0];
      if (manual.typeFromTitle(title)?.overPersoon && a.address !== calendar!.me.address && first.length >= 3
        && new RegExp(`(?<![\\p{L}])${first.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}])`, 'iu').test(title)) {
        titleProof.set(normalizeKey(first), new Set([...(titleProof.get(normalizeKey(first)) ?? []), a.address]));
      }
    }
  }
  const people = [...seen]
    .map(([address, v]) => ({ ...v, address, domain: address.split('@')[1] }))
    .filter(p => (p.count >= MIN_PERSON || p.address === calendar?.me.address) && !manual.ignored(p.name))
    .filter(p => policy.externePersonen || p.domain === calendar?.me.domain)
    .sort((a, b) => b.count - a.count);
  const prefix = (name: string, n: number) => name.split(/\s+/).slice(0, n).join(' ');
  const unique = (candidate: string, n: number) => people.filter(p => normalizeKey(prefix(p.name, n)) === normalizeKey(candidate)).length === 1;
  const persons: Maintenance['persons'] = people.map(p => {
    const words = p.name.split(/\s+/);
    const aliassen: string[] = [];
    const proof = titleProof.get(normalizeKey(words[0]));
    if (words.length >= 2 && words[0].length >= 3 && (unique(words[0], 1) || (proof?.size === 1 && proof.has(p.address)))) aliassen.push(words[0]);
    if (words.length >= 3 && /^\p{Lu}/u.test(words[1]) && !PARTICLES.has(words[1].toLowerCase()) && unique(prefix(p.name, 2), 2)) aliassen.push(prefix(p.name, 2));
    const organisatie = p.domain === calendar?.me.domain ? ownOrg
      : orgForDomain.get(p.domain) ?? (FREE_MAIL.has(p.domain) ? undefined : domainLabel(p.domain));
    return { naam: p.name, aliassen, organisatie, toelichting: `${p.count} gesprekken` };
  });

  // ── Topics: new terms from the model, mapped onto the tree (or new sub-topics) ──
  const termCounts = new Map<string, { spelling: string; conversations: Set<string> }>();
  for (const [rel, m] of mentions) {
    for (const raw of m.terms) {
      if (manual.matchTopic(raw)) continue;
      const t = manual.topicTerm(raw).term;
      if (!normalizeKey(t) || manual.ignored(t)) continue;
      const e = termCounts.get(normalizeKey(t)) ?? { spelling: t, conversations: new Set() };
      e.conversations.add(rel);
      termCounts.set(normalizeKey(t), e);
    }
  }
  const unknown = [...termCounts.keys()].filter(k => cache.labels[k]?.v !== TERM_VERSION);
  if (llm && unknown.length) {
    log(`   ${unknown.length} nieuwe termen koppelen aan de onderwerpenboom`);
    for (let i = 0; i < unknown.length; i += 40) {
      Object.assign(cache.labels, await mapTerms(unknown.slice(i, i + 40).map(k => termCounts.get(k)!.spelling), manual));
      writeJson(cacheFile, cache);
    }
  }
  // A new sub-topic is never named after a person or organisation: they have their own pages.
  const names = [...persons, ...organisations].flatMap(e => [e.naam, ...e.aliassen]).map(normalizeKey).filter(n => n.length > 2);
  const namesSomeone = (text: string) => names.some(n => ` ${normalizeKey(text)} `.includes(` ${n} `));
  const topicAliases = new Map<string, Set<string>>();
  const newTopics = new Map<string, { parent: string; aliassen: Set<string>; conversations: Set<string> }>();
  for (const [key, e] of termCounts) {
    const d = cache.labels[key];
    if (!d || d.v !== TERM_VERSION) continue;
    if (d.onderwerp) {
      topicAliases.set(d.onderwerp, new Set([...(topicAliases.get(d.onderwerp) ?? []), e.spelling]));
    } else if (d.nieuw && d.hoofd && !manual.ignored(d.nieuw) && !namesSomeone(d.nieuw)) {
      const t = newTopics.get(normalizeKey(d.nieuw)) ?? { parent: d.hoofd, aliassen: new Set<string>([d.nieuw]), conversations: new Set<string>() };
      t.aliassen.add(e.spelling);
      for (const c of e.conversations) t.conversations.add(c);
      newTopics.set(normalizeKey(d.nieuw), t);
    }
  }
  const topics: Maintenance['topics'] = [...topicAliases].map(([naam, al]) => ({
    naam, aliassen: [...al], toelichting: 'termen die het model gebruikte',
  }));
  const proposals: Maintenance['proposals'] = [];
  for (const t of newTopics.values()) {
    const [naam, ...rest] = [...t.aliassen];
    if (t.conversations.size < policy.minGesprekkenOnderwerp) continue;
    if (policy.nieuweOnderwerpen === 'voorstel') {
      proposals.push({ naam, parent: t.parent, gesprekken: t.conversations.size });
      continue;
    }
    topics.push({ naam, parent: t.parent, aliassen: rest.filter(a => normalizeKey(a) !== normalizeKey(naam)), toelichting: `nieuw subonderwerp, ${t.conversations.size} gesprekken` });
  }

  // ── Spelling variants from the transcripts (speech recognition) ──
  const allTopics = [...manual.topics, ...topics.filter(t => t.parent)];
  const variants = scanVariants(sources, [
    ...persons.map(p => ({ id: `p:${p.naam}`, names: [p.naam, ...p.aliassen], perPart: true })),
    ...organisations.map(o => ({ id: `o:${o.naam}`, names: [o.naam, ...o.aliassen], perPart: false })),
    ...allTopics.map(t => ({ id: `t:${t.naam}`, names: [t.naam, ...t.aliassen], perPart: false })),
  ]);
  const mostlyCapital = (v: { capitalized: number; count: number }) => v.capitalized * 2 >= v.count;
  for (const p of persons) {
    for (const v of variants.get(`p:${p.naam}`) ?? []) {
      if (!mostlyCapital(v) || !v.part) continue;
      const alias = p.naam.replace(v.part, capitalize(v.surface));
      if (alias !== p.naam && !p.aliassen.includes(alias)) p.aliassen.push(alias);
    }
  }
  for (const o of organisations) {
    for (const v of variants.get(`o:${o.naam}`) ?? []) if (mostlyCapital(v) && !o.aliassen.includes(v.surface)) o.aliassen.push(v.surface);
  }
  for (const t of allTopics) {
    const found = (variants.get(`t:${t.naam}`) ?? []).map(v => v.surface);
    if (!found.length) continue;
    const carrier = topics.find(x => x.naam === t.naam) ?? (() => {
      const c = { naam: t.naam, aliassen: [] as string[], toelichting: 'schrijfvarianten uit de transcripten' };
      topics.push(c);
      return c;
    })();
    for (const f of found) if (!carrier.aliassen.includes(f)) carrier.aliassen.push(f);
  }

  writeJson(cacheFile, cache);
  return { persons, organisations, topics, excluded, proposals };
}

/** Lines describing what changed compared with the previous automatic layer. */
export function describeChanges(
  previous: Record<string, unknown>,
  next: Maintenance,
): string[] {
  const prev = (k: string) => (Array.isArray(previous[k]) ? previous[k] as Record<string, unknown>[] : []);
  const byName = (list: Record<string, unknown>[]) => new Map(list.map(e => [String(e.naam), e]));
  const lines: string[] = [];
  const diff = (label: string, before: Map<string, Record<string, unknown>>, after: (VocabEntry & { toelichting: string })[]) => {
    for (const e of after) {
      const old = before.get(e.naam);
      if (!old) {
        // A topic entry without parent only carries aliases for an existing topic.
        if (label === 'onderwerp' && !e.parent) {
          if (e.aliassen.length) lines.push(`+ alias ${e.aliassen.map(a => `"${a}"`).join(', ')} → onderwerp **${e.naam}**`);
        } else {
          lines.push(`+ ${label} **${e.naam}**${e.parent ? ` (nieuw subonderwerp onder ${e.parent})` : ''}${e.soort ? ` — ${e.soort}` : ''} · ${e.toelichting}`);
        }
        continue;
      }
      const oldAliases = new Set((Array.isArray(old.aliassen) ? old.aliassen : []).map(String));
      const added = e.aliassen.filter(a => !oldAliases.has(a));
      if (added.length) lines.push(`+ alias ${added.map(a => `"${a}"`).join(', ')} → ${label} **${e.naam}**`);
      if (old.soort && e.soort && old.soort !== e.soort) lines.push(`~ ${label} **${e.naam}**: soort ${old.soort} → ${e.soort}`);
    }
    const now = new Set(after.map(e => e.naam));
    for (const [n, old] of before) {
      if (now.has(n)) continue;
      lines.push(label === 'onderwerp' && !old.parent
        ? `− aliassen bij onderwerp **${n}** vervallen`
        : `− ${label} **${n}** (niet meer gevonden of uitgesloten)`);
    }
  };
  diff('persoon', byName(prev('personen')), next.persons);
  diff('organisatie', byName(prev('organisaties')), next.organisations);
  diff('onderwerp', byName(prev('onderwerpen')), next.topics);
  return lines;
}

/** Keep the change log short: newest run on top, at most 60 runs. */
export function appendChanges(lines: string[], extra: string[]): void {
  const date = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const old = fs.existsSync(kbConfig.changesFile) ? fs.readFileSync(kbConfig.changesFile, 'utf-8') : '';
  const runs = old.split(/^## /m).slice(1).slice(0, 59).map(r => `## ${r.trimEnd()}\n`);
  const header = [
    '# Wijzigingen in de vaste lijst',
    '',
    '_Wat `kb:beheer` automatisch heeft aangepast. Niet eens met iets? Zet het in `negeren:` of corrigeer het in',
    '`vocabulaire.yml`; jouw bestand wint altijd._',
    '',
  ].join('\n');
  const run = [`## ${date}`, '', ...(lines.length ? lines.map(l => `- ${l}`) : ['- Geen wijzigingen.']), ...extra, ''].join('\n');
  fs.writeFileSync(kbConfig.changesFile, `${header}\n${run}\n${runs.join('\n')}`);
}
