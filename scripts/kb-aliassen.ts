import * as fs from 'node:fs';
import * as path from 'node:path';
import { isMap, isSeq, parseDocument, type Document, type YAMLMap } from 'yaml';
import { kbConfig } from '../src/kb/config.js';
import { loadVocabulary, normalizeKey, type VocabEntry } from '../src/kb/vocabulary.js';
import { scanSources } from '../src/kb/sources.js';
import { writeIfChanged } from '../src/kb/files.js';

// Finds how speech recognition spells the names on the fixed list ("unique",
// "uniek" for "Unik"; "Habi Sen" for "HabiCen") by comparing sound keys of words
// and word pairs in the transcripts. Read-only on the transcripts.
//   npm run kb:aliassen               report → _beheer/aliassen.voorstel.md
//   npm run kb:aliassen -- --toepassen also add found variants of organisations and topics to vocabulaire.yml
const APPLY = process.argv.includes('--toepassen');
const MIN_COUNT = 2;
/** Word pairs with a filler word ("proces en", "offer the") only produce false variants. */
const STOPWORDS = new Set(['and', 'are', 'but', 'een', 'for', 'het', 'hij', 'nee', 'not', 'ook', 'the', 'then', 'they', 'this', 'toe', 'van', 'was', 'wat', 'wel', 'die', 'dat', 'dan', 'met', 'naar', 'niet', 'nog', 'maar', 'that', 'with', 'you', 'zijn', 'heb', 'hebben', 'gaat', 'is', 'en', 'te', 'de', 'he', 'hè']);
/** Acronyms are spelled out letter by letter; a sound key only finds look-alike words ("CI/CD" ~ "zicht"). */
const isAcronym = (s: string) => /[\/&]/.test(s) || /^[\p{Lu}\p{N} .-]+$/u.test(s);

/** Rough Dutch/English sound key: spellings that sound alike collapse to one key. */
export function soundKey(text: string): string {
  let s = text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]/g, '');
  if (!s) return '';
  const rules: [RegExp, string][] = [
    [/sch/g, 's'], [/que/g, 'k'], [/qu/g, 'k'], [/q/g, 'k'], [/ck/g, 'k'],
    [/c(?=[eiy])/g, 's'], [/c/g, 'k'], [/x/g, 'ks'], [/ph/g, 'f'], [/th/g, 't'], [/dt/g, 't'],
    [/ij/g, 'ei'], [/y/g, 'i'], [/ie/g, 'i'], [/ee/g, 'e'], [/oo/g, 'o'], [/aa/g, 'a'], [/uu/g, 'u'],
    [/ou/g, 'au'], [/oe/g, 'u'], [/w/g, 'v'], [/z/g, 's'],
  ];
  for (const [re, to] of rules) s = s.replace(re, to);
  s = s[0] + s.slice(1).replace(/h/g, '');
  s = s.replace(/(.)\1+/g, '$1').replace(/d$/, 't');
  if (s.length > 3) s = s.replace(/e$/, '');
  return s;
}

interface Target { kind: 'organisatie' | 'onderwerp' | 'persoon'; entry: VocabEntry }
interface Variant { surface: string; count: number; conversations: Set<string>; capitalized: number }

async function main(): Promise<void> {
  const vocab = loadVocabulary();
  const targets: Target[] = [
    ...vocab.organisations.map(entry => ({ kind: 'organisatie' as const, entry })),
    ...vocab.topics.map(entry => ({ kind: 'onderwerp' as const, entry })),
    ...vocab.persons.map(entry => ({ kind: 'persoon' as const, entry })),
  ];

  // Sound key → the list entries it belongs to. Organisations and topics match on the
  // whole name; persons per name part (first and last names get misheard separately).
  const byKey = new Map<string, Target[]>();
  const known = new Set<string>();
  const addKey = (key: string, t: Target) => {
    if (key.length < 4) return;
    const list = byKey.get(key) ?? [];
    if (!list.includes(t)) list.push(t);
    byKey.set(key, list);
  };
  for (const t of targets) {
    for (const name of [t.entry.naam, ...t.entry.aliassen]) {
      known.add(normalizeKey(name).replace(/ /g, ''));
      if (isAcronym(name)) continue;
      if (t.kind === 'persoon') for (const part of name.split(/\s+/)) addKey(soundKey(part), t);
      else addKey(soundKey(name), t);
    }
  }

  const found = new Map<Target, Map<string, Variant>>();
  for (const src of scanSources()) {
    const words = src.transcript.replace(/^\[[\d:]+\] /gm, '').match(/\p{L}[\p{L}\p{N}'-]*/gu) ?? [];
    for (let i = 0; i < words.length; i++) {
      const pairOk = i + 1 < words.length && [words[i], words[i + 1]]
        .every(w => w.length >= 3 && !STOPWORDS.has(w.toLowerCase()));
      for (const surface of [words[i], pairOk ? `${words[i]} ${words[i + 1]}` : '']) {
        if (!surface) continue;
        const hits = byKey.get(soundKey(surface));
        // Skip exact spellings of list names and keys shared by several entries.
        if (!hits || hits.length !== 1 || known.has(normalizeKey(surface).replace(/ /g, ''))) continue;
        const per = found.get(hits[0]) ?? new Map<string, Variant>();
        const key = surface.toLowerCase();
        const v = per.get(key) ?? { surface, count: 0, conversations: new Set(), capitalized: 0 };
        v.count++;
        v.conversations.add(src.relPath);
        if (/^\p{Lu}/u.test(surface)) v.capitalized++;
        per.set(key, v);
        found.set(hits[0], per);
      }
    }
  }

  const rows = [...found].map(([t, per]) => ({
    t,
    variants: [...per.values()].filter(v => v.count >= MIN_COUNT).sort((a, b) => b.count - a.count),
  })).filter(r => r.variants.length > 0);

  const section = (kind: Target['kind'], title: string) => {
    const mine = rows.filter(r => r.t.kind === kind);
    return [
      `## ${title}`,
      '',
      ...(mine.length ? mine.flatMap(r => [
        `- **${r.t.entry.naam}**: ${r.variants.map(v => `${v.surface} (${v.count}× in ${v.conversations.size} gesprek${v.conversations.size === 1 ? '' : 'ken'}${v.capitalized === 0 ? ', altijd kleine letter' : `, ${Math.round((100 * v.capitalized) / v.count)}% hoofdletter`})`).join(', ')}`,
      ]) : ['_Geen._']),
      '',
    ];
  };
  writeIfChanged(path.join(kbConfig.adminDir, 'aliassen.voorstel.md'), [
    '# Schrijfvarianten uit de transcripten',
    '',
    `_Gevonden ${new Date().toISOString().slice(0, 10)}: woorden die klinken als een naam op de vaste lijst maar anders gespeld zijn (minimaal ${MIN_COUNT}×)._`,
    '_"Altijd kleine letter" wijst vaak op een gewoon woord in plaats van een verhaspelde naam; twijfel je, laat hem dan weg._',
    '',
    ...section('organisatie', 'Organisaties'),
    ...section('onderwerp', 'Onderwerpen'),
    ...section('persoon', 'Personen (per naamdeel)'),
  ].join('\n'));

  console.log(`Varianten: ${rows.filter(r => r.t.kind === 'organisatie').length} organisaties, ${rows.filter(r => r.t.kind === 'onderwerp').length} onderwerpen, ${rows.filter(r => r.t.kind === 'persoon').length} personen → _beheer/aliassen.voorstel.md`);

  if (!APPLY) return;
  // Add organisation and topic variants in place, keeping comments and layout.
  const doc: Document = parseDocument(fs.readFileSync(kbConfig.vocabularyFile, 'utf-8'));
  // Organisations are proper nouns: a variant that is mostly lowercase is usually an
  // ordinary word ("main" for "Maine"), so only mostly-capitalised variants are added.
  const add = new Map(rows.filter(r => r.t.kind !== 'persoon').map(r => [
    r.t.entry.naam,
    r.variants.filter(v => r.t.kind !== 'organisatie' || v.capitalized * 2 >= v.count).map(v => v.surface),
  ]));
  let added = 0;
  const visit = (items: unknown) => {
    if (!isSeq(items)) return;
    for (const item of items.items) {
      if (!isMap(item)) continue;
      const map = item as YAMLMap;
      const extra = add.get(String(map.get('naam')));
      if (extra) {
        const seq = map.get('aliassen', true);
        const current = isSeq(seq) ? seq.items.map(String) : [];
        const fresh = extra.filter(e => !current.some(c => normalizeKey(String(c)) === normalizeKey(e)));
        if (fresh.length) {
          if (isSeq(seq)) for (const f of fresh) seq.add(doc.createNode(f));
          else map.set('aliassen', doc.createNode(fresh, { flow: true }));
          added += fresh.length;
        }
      }
      visit(map.get('sub', true));
    }
  };
  visit(doc.get('organisaties', true));
  visit(doc.get('onderwerpen', true));
  fs.writeFileSync(kbConfig.vocabularyFile, doc.toString({ lineWidth: 0 }));
  console.log(`${added} alias(sen) toegevoegd aan organisaties en onderwerpen in vocabulaire.yml.`);
}

main().catch(err => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
