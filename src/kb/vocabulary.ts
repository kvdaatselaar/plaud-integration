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
}

export interface Vocabulary {
  persons: VocabEntry[];
  topics: VocabEntry[];
  types: string[];
  matchPerson(raw: string): VocabEntry | undefined;
  matchTopic(raw: string): VocabEntry | undefined;
}

export const DEFAULT_TYPES = ['overleg', '1-op-1', 'klantgesprek', 'stuurgroep', 'workshop', 'presentatie', 'sollicitatie', 'overig'];

const TEMPLATE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'knowledge', 'vocabulaire.template.yml');

/** Case-, accent- and punctuation-insensitive key, so "Vries, J. de" variants line up. */
export function normalizeKey(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function toEntries(raw: unknown, kind: string): VocabEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: VocabEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item.naam !== 'string' || !item.naam.trim()) {
      console.warn(`⚠ vocabulaire: ${kind} zonder 'naam' overgeslagen`);
      continue;
    }
    out.push({
      naam: item.naam.trim(),
      aliassen: Array.isArray(item.aliassen) ? item.aliassen.map(String).filter(Boolean) : [],
      organisatie: item.organisatie ? String(item.organisatie) : undefined,
      rol: item.rol ? String(item.rol) : undefined,
      omschrijving: item.omschrijving ? String(item.omschrijving) : undefined,
    });
  }
  return out;
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
export function loadVocabulary(): Vocabulary {
  if (!fs.existsSync(kbConfig.vocabularyFile)) {
    fs.mkdirSync(path.dirname(kbConfig.vocabularyFile), { recursive: true });
    fs.copyFileSync(TEMPLATE, kbConfig.vocabularyFile);
  }
  const doc = (parse(fs.readFileSync(kbConfig.vocabularyFile, 'utf-8')) ?? {}) as Record<string, unknown>;
  const persons = toEntries(doc.personen, 'persoon');
  const topics = toEntries(doc.onderwerpen, 'onderwerp');
  const types = Array.isArray(doc.types) && doc.types.length > 0 ? doc.types.map(String) : DEFAULT_TYPES;
  return {
    persons,
    topics,
    types: types.includes('overig') ? types : [...types, 'overig'],
    matchPerson: buildMatcher(persons, 'personen'),
    matchTopic: buildMatcher(topics, 'onderwerpen'),
  };
}
