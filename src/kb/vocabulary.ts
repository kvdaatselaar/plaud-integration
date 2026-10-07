import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { kbConfig } from './config.js';

export interface VocabEntry {
  naam: string;
  aliassen: string[];
  organisatie?: string;
  rol?: string;
  omschrijving?: string;
  /** Organisations: klant, partner, leverancier, … */
  soort?: string;
  /** Topics: name of the main topic this sub-topic belongs to. */
  parent?: string;
}

export interface TypeDef {
  naam: string;
  omschrijving?: string;
  /** Words or phrases in the meeting title that fix this type (first matching type wins). */
  titel: string[];
  /** For 1-op-1's and the like: record which person the conversation is about. */
  overPersoon: boolean;
}

/** The `beheer:` section of vocabulaire.yml: how kb:beheer maintains the automatic layer. */
export interface MaintenancePolicy {
  /** Include attendees from other organisations as persons. */
  externePersonen: boolean;
  /** A name the model mentions must occur in this many conversations to become an organisation. */
  minGesprekkenOrganisatie: number;
  /** A new theme must occur in this many conversations to become a sub-topic. */
  minGesprekkenOnderwerp: number;
  /** `voorstel`: new sub-topics only go to wijzigingen.md; `automatisch`: they are added. */
  nieuweOnderwerpen: 'automatisch' | 'voorstel';
  /** Organisation kinds that are kept out of the knowledge base. */
  uitsluitenSoorten: string[];
}

/** How an organisation relates to the owner's organisation. Used by enrichment and by kb:beheer. */
export const ORG_KINDS: Record<string, string> = {
  klant: 'Zig levert software of diensten aan hen; meestal een woningcorporatie, vastgoedbeheerder of andere afnemer',
  partner: 'werkt samen met Zig richting klanten: implementatie-, integratie-, consultancy- of verkooppartner, of een bedrijf waarmee samen een product wordt ontwikkeld',
  leverancier: 'Zig koopt iets van hen: een tool, platform, dienst of advies voor eigen gebruik (bijv. HR-, CRM- of financiële software, detachering)',
  groep: 'onderdeel van de Zig-groep: dochterbedrijf, overgenomen bedrijf of eigen product',
  investeerder: 'aandeelhouder of investeringsmaatschappij van Zig (bijv. private equity); zit vaak in de RvC of board',
  overheid: 'overheid, toezichthouder of brancheorganisatie',
  technologie: 'algemene technologiegigant of -product dat iedereen gebruikt, zoals Microsoft, Azure, AWS, Google, GitHub of OpenAI',
  overig: 'geen organisatie, of past nergens anders',
};

export const DEFAULT_POLICY: MaintenancePolicy = {
  externePersonen: true,
  minGesprekkenOrganisatie: 3,
  minGesprekkenOnderwerp: 5,
  nieuweOnderwerpen: 'automatisch',
  uitsluitenSoorten: ['technologie', 'overig'],
};

export interface Vocabulary {
  /** Names (and aliases) that never enter the knowledge base. */
  ignored(name: string): boolean;
  policy: MaintenancePolicy;
  /** The knowledge-base owner; "about" never points to them. */
  owner?: VocabEntry;
  persons: VocabEntry[];
  /** Main topics and sub-topics, flattened; sub-topics carry `parent`. */
  topics: VocabEntry[];
  organisations: VocabEntry[];
  typeDefs: TypeDef[];
  types: string[];
  matchPerson(raw: string): VocabEntry | undefined;
  matchTopic(raw: string): VocabEntry | undefined;
  /** Splits "Main topic: term" (models sometimes write the tree path) into the known prefix and the term. */
  topicTerm(raw: string): { term: string; prefix?: VocabEntry };
  matchOrganisation(raw: string): VocabEntry | undefined;
  /** Persons whose name or alias occurs in a text (e.g. a meeting title). */
  personsIn(text: string): VocabEntry[];
  typeFromTitle(title: string): TypeDef | undefined;
}

export const DEFAULT_TYPES = ['overleg', '1-op-1', 'klantgesprek', 'stuurgroep', 'workshop', 'presentatie', 'sollicitatie', 'overig'];

const TEMPLATE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'knowledge', 'vocabulaire.template.yml');

/** Case-, accent- and punctuation-insensitive key, so "Vries, J. de" variants line up. */
export function normalizeKey(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Whole-word, case-insensitive occurrence test. */
export function wordPattern(phrase: string): RegExp {
  return new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(phrase.trim())}(?![\\p{L}\\p{N}])`, 'iu');
}

const strings = (v: unknown) => (Array.isArray(v) ? v.map(String).map(s => s.trim()).filter(Boolean) : []);

function toEntries(raw: unknown, kind: string, parent?: string): VocabEntry[] {
  return toEntriesWith(raw, kind, item => parent ?? (item.parent ? String(item.parent) : undefined));
}

function toEntriesWith(raw: unknown, kind: string, parentOf: (item: Record<string, unknown>) => string | undefined): VocabEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: VocabEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item.naam !== 'string' || !item.naam.trim()) {
      console.warn(`⚠ vocabulaire: ${kind} zonder 'naam' overgeslagen`);
      continue;
    }
    out.push({
      naam: item.naam.trim(),
      aliassen: strings(item.aliassen),
      organisatie: item.organisatie ? String(item.organisatie) : undefined,
      rol: item.rol ? String(item.rol) : undefined,
      omschrijving: item.omschrijving ? String(item.omschrijving) : undefined,
      soort: item.soort ? String(item.soort) : undefined,
      parent: parentOf(item),
    });
  }
  return out;
}

/** Main topics with an optional `sub:` list, flattened with parent links. */
function toTopics(raw: unknown): VocabEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: VocabEntry[] = [];
  for (const item of raw) {
    const [main] = toEntries([item], 'onderwerp');
    if (!main) continue;
    out.push(main);
    out.push(...toEntries(item.sub, `subonderwerp van ${main.naam}`, main.naam));
  }
  return out;
}

function toTypes(raw: unknown): TypeDef[] {
  const list: unknown[] = Array.isArray(raw) && raw.length > 0 ? raw : DEFAULT_TYPES;
  const defs: TypeDef[] = list.map(t => {
    if (typeof t === 'string') return { naam: t, titel: [], overPersoon: false };
    const o = t as Record<string, unknown>;
    return {
      naam: String(o.naam),
      omschrijving: o.omschrijving ? String(o.omschrijving) : undefined,
      titel: strings(o.titel),
      overPersoon: o.over_persoon === true,
    };
  });
  return defs.some(d => d.naam === 'overig') ? defs : [...defs, { naam: 'overig', titel: [], overPersoon: false }];
}

function buildMatcher(entries: VocabEntry[], kind: string): (raw: string) => VocabEntry | undefined {
  const byKey = new Map<string, VocabEntry>();
  for (const e of entries) {
    for (const variant of [e.naam, ...e.aliassen]) {
      const key = normalizeKey(variant);
      const existing = byKey.get(key);
      if (existing && existing !== e) {
        console.warn(`⚠ vocabulaire: "${variant}" hoort bij zowel "${existing.naam}" als "${e.naam}" (${kind}); eerste wint`);
        continue;
      }
      byKey.set(key, e);
    }
  }
  return (raw: string) => byKey.get(normalizeKey(raw));
}

function readYaml(file: string): Record<string, unknown> {
  return fs.existsSync(file) ? ((parse(fs.readFileSync(file, 'utf-8')) ?? {}) as Record<string, unknown>) : {};
}

const variantsOf = (e: VocabEntry) => [e.naam, ...e.aliassen].map(normalizeKey);

/**
 * Manual entries win. An automatic entry that shares a name or alias with a manual one
 * only adds its aliases and fills empty fields; the rest are added as they are.
 */
function mergeEntries(manual: VocabEntry[], auto: VocabEntry[], ignored: (n: string) => boolean): VocabEntry[] {
  const out = manual.map(e => ({ ...e, aliassen: [...e.aliassen] }));
  for (const a of auto) {
    const keys = new Set(variantsOf(a));
    const target = out.find(m => variantsOf(m).some(k => keys.has(k)));
    if (!target) {
      out.push({ ...a, aliassen: [...a.aliassen] });
      continue;
    }
    for (const alias of [a.naam, ...a.aliassen]) {
      if (!variantsOf(target).includes(normalizeKey(alias))) target.aliassen.push(alias);
    }
    target.organisatie ??= a.organisatie;
    target.rol ??= a.rol;
    target.soort ??= a.soort;
    target.omschrijving ??= a.omschrijving;
  }
  return out
    .filter(e => !ignored(e.naam))
    .map(e => ({ ...e, aliassen: e.aliassen.filter(a => !ignored(a)) }));
}

/** Topics: automatic entries either add aliases to an existing topic or are new sub-topics of a manual main topic. */
function mergeTopics(manual: VocabEntry[], auto: VocabEntry[], ignored: (n: string) => boolean): VocabEntry[] {
  const out = manual.map(e => ({ ...e, aliassen: [...e.aliassen] }));
  const mains = new Set(manual.filter(t => !t.parent).map(t => t.naam));
  for (const a of auto) {
    const target = out.find(m => normalizeKey(m.naam) === normalizeKey(a.naam));
    if (target) {
      for (const alias of a.aliassen) if (!variantsOf(target).includes(normalizeKey(alias))) target.aliassen.push(alias);
    } else if (a.parent && mains.has(a.parent)) {
      out.push({ ...a, aliassen: [...a.aliassen] });
    }
  }
  return out
    .filter(e => !ignored(e.naam))
    .map(e => ({ ...e, aliassen: e.aliassen.filter(a => !ignored(a)) }));
}

function toPolicy(raw: unknown): MaintenancePolicy {
  const o = (raw ?? {}) as Record<string, unknown>;
  const num = (v: unknown, d: number) => (typeof v === 'number' && v > 0 ? v : d);
  return {
    externePersonen: o.externe_personen !== false && o.externe_personen !== 'uit',
    minGesprekkenOrganisatie: num(o.min_gesprekken_organisatie, DEFAULT_POLICY.minGesprekkenOrganisatie),
    minGesprekkenOnderwerp: num(o.min_gesprekken_onderwerp, DEFAULT_POLICY.minGesprekkenOnderwerp),
    nieuweOnderwerpen: o.nieuwe_onderwerpen === 'voorstel' ? 'voorstel' : 'automatisch',
    uitsluitenSoorten: Array.isArray(o.uitsluiten_soorten) ? strings(o.uitsluiten_soorten) : DEFAULT_POLICY.uitsluitenSoorten,
  };
}

/**
 * Loads the fixed list: _beheer/vocabulaire.yml (yours) merged over
 * _beheer/vocabulaire.auto.yml (maintained by kb:beheer). Creates the manual file
 * from the template on first use. `auto: false` gives the manual layer alone.
 */
export function loadVocabulary(options: { file?: string; autoFile?: string; auto?: boolean } | string = {}): Vocabulary {
  const opts = typeof options === 'string' ? { file: options } : options;
  const file = opts.file ?? kbConfig.vocabularyFile;
  if (!fs.existsSync(file)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.copyFileSync(TEMPLATE, file);
  }
  const doc = readYaml(file);
  const autoDoc = opts.auto === false ? {} : readYaml(opts.autoFile ?? kbConfig.autoVocabularyFile);
  const ignoreSet = new Set(strings(doc.negeren).map(normalizeKey));
  const ignored = (n: string) => ignoreSet.has(normalizeKey(n));

  const persons = mergeEntries(toEntries(doc.personen, 'persoon'), toEntries(autoDoc.personen, 'persoon (auto)'), ignored);
  const topics = mergeTopics(toTopics(doc.onderwerpen), toEntries(autoDoc.onderwerpen, 'onderwerp (auto)'), ignored);
  const policy = toPolicy(doc.beheer);
  const organisations = mergeEntries(toEntries(doc.organisaties, 'organisatie'), toEntries(autoDoc.organisaties, 'organisatie (auto)'), ignored)
    .filter(o => !o.soort || !policy.uitsluitenSoorten.includes(o.soort));
  const typeDefs = toTypes(doc.types);
  const matchPerson = buildMatcher(persons, 'personen');

  const personPatterns = persons.flatMap(p =>
    [p.naam, ...p.aliassen].filter(v => v.length >= 3).map(v => ({ p, re: new RegExp(wordPattern(v).source, 'giu') })));
  /** Longest match wins: "Peter Jan" in a title doesn't also count as a "Jan". */
  const personsIn = (text: string) => {
    const hits = personPatterns.flatMap(({ p, re }) => [...text.matchAll(re)].map(m => ({ p, from: m.index!, to: m.index! + m[0].length })));
    const kept = hits.filter(h => !hits.some(o => o !== h && o.from <= h.from && o.to >= h.to && o.to - o.from > h.to - h.from));
    return [...new Set(kept.map(h => h.p))];
  };
  const typePatterns = typeDefs.map(d => ({ d, res: d.titel.map(wordPattern) }));
  const directTopic = buildMatcher(topics, 'onderwerpen');
  const topicTerm = (raw: string) => {
    const m = raw.match(/^(.+?)\s*(?::|>|\/|–|—| - )\s*(.+)$/);
    const prefix = m ? directTopic(m[1]) : undefined;
    return prefix ? { term: m![2].trim(), prefix } : { term: raw };
  };

  return {
    ignored,
    policy,
    owner: typeof doc.eigenaar === 'string' ? matchPerson(doc.eigenaar) : undefined,
    persons,
    topics,
    organisations,
    typeDefs,
    types: typeDefs.map(d => d.naam),
    matchPerson,
    matchTopic: (raw: string) => directTopic(raw) ?? (t => (t.prefix ? directTopic(t.term) : undefined))(topicTerm(raw)),
    topicTerm,
    matchOrganisation: buildMatcher(organisations, 'organisaties'),
    personsIn,
    typeFromTitle: (title: string) => typePatterns.find(t => t.res.some(re => re.test(title)))?.d,
  };
}
