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

export interface Vocabulary {
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
      parent,
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

/** Loads _beheer/vocabulaire.yml, creating it from the template on first use. */
export function loadVocabulary(file = kbConfig.vocabularyFile): Vocabulary {
  if (!fs.existsSync(file)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.copyFileSync(TEMPLATE, file);
  }
  const doc = (parse(fs.readFileSync(file, 'utf-8')) ?? {}) as Record<string, unknown>;
  const persons = toEntries(doc.personen, 'persoon');
  const topics = toTopics(doc.onderwerpen);
  const organisations = toEntries(doc.organisaties, 'organisatie');
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

  return {
    owner: typeof doc.eigenaar === 'string' ? matchPerson(doc.eigenaar) : undefined,
    persons,
    topics,
    organisations,
    typeDefs,
    types: typeDefs.map(d => d.naam),
    matchPerson,
    matchTopic: buildMatcher(topics, 'onderwerpen'),
    matchOrganisation: buildMatcher(organisations, 'organisaties'),
    personsIn,
    typeFromTitle: (title: string) => typePatterns.find(t => t.res.some(re => re.test(title)))?.d,
  };
}
