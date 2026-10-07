import { normalizeKey } from './vocabulary.js';
import type { SourceTranscript } from './sources.js';

/** Rough Dutch/English sound key: spellings that sound alike collapse to one key ("Akme", "Ackme", "Acme"). */
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

/** Word pairs with a filler word ("proces en", "offer the") only produce false variants. */
const STOPWORDS = new Set(['and', 'are', 'but', 'een', 'for', 'het', 'hij', 'nee', 'not', 'ook', 'the', 'then', 'they', 'this', 'toe', 'van', 'was', 'wat', 'wel', 'die', 'dat', 'dan', 'met', 'naar', 'niet', 'nog', 'maar', 'that', 'with', 'you', 'zijn', 'heb', 'hebben', 'gaat', 'is', 'en', 'te', 'de', 'he', 'hè']);

/** Acronyms are spelled out letter by letter; a sound key only finds look-alike words ("CI/CD" ~ "zicht"). */
export const isAcronym = (s: string) => /[/&]/.test(s) || /^[\p{Lu}\p{N} .-]+$/u.test(s);

export interface VariantTarget {
  id: string;
  names: string[];
  /** Persons: match first and last names separately (they are misheard separately). */
  perPart: boolean;
}

export interface Variant {
  surface: string;
  /** For per-part targets: the name part this variant replaces. */
  part?: string;
  count: number;
  conversations: Set<string>;
  capitalized: number;
}

/** Words and word pairs in the transcripts that sound like a target name but are spelled differently. */
export function scanVariants(sources: SourceTranscript[], targets: VariantTarget[], minCount = 2): Map<string, Variant[]> {
  const byKey = new Map<string, { id: string; part?: string }[]>();
  const known = new Set<string>();
  const addKey = (key: string, id: string, part?: string) => {
    if (key.length < 4) return;
    const list = byKey.get(key) ?? [];
    if (!list.some(x => x.id === id)) list.push({ id, part });
    byKey.set(key, list);
  };
  for (const t of targets) {
    for (const name of t.names) {
      known.add(normalizeKey(name).replace(/ /g, ''));
      if (isAcronym(name)) continue;
      if (t.perPart) for (const part of name.split(/\s+/)) addKey(soundKey(part), t.id, part);
      else addKey(soundKey(name), t.id);
    }
  }

  const found = new Map<string, Map<string, Variant>>();
  for (const src of sources) {
    const words = src.transcript.replace(/^\[[\d:]+\] /gm, '').match(/\p{L}[\p{L}\p{N}'-]*/gu) ?? [];
    for (let i = 0; i < words.length; i++) {
      const pairOk = i + 1 < words.length && [words[i], words[i + 1]].every(w => w.length >= 3 && !STOPWORDS.has(w.toLowerCase()));
      for (const surface of [words[i], pairOk ? `${words[i]} ${words[i + 1]}` : '']) {
        if (!surface) continue;
        const hits = byKey.get(soundKey(surface));
        // Exact spellings of list names and keys shared by several targets are no evidence.
        if (!hits || hits.length !== 1 || known.has(normalizeKey(surface).replace(/ /g, ''))) continue;
        const per = found.get(hits[0].id) ?? new Map<string, Variant>();
        const key = surface.toLowerCase();
        const v = per.get(key) ?? { surface, part: hits[0].part, count: 0, conversations: new Set<string>(), capitalized: 0 };
        v.count++;
        v.conversations.add(src.relPath);
        if (/^\p{Lu}/u.test(surface)) v.capitalized++;
        per.set(key, v);
        found.set(hits[0].id, per);
      }
    }
  }
  return new Map([...found].map(([id, per]) => [
    id,
    [...per.values()].filter(v => v.count >= minCount).sort((a, b) => b.count - a.count),
  ] as [string, Variant[]]).filter(([, vs]) => vs.length > 0));
}
