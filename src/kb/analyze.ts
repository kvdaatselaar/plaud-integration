import * as path from 'node:path';
import { kbConfig } from './config.js';
import { chatJson } from './llm.js';
import { readJson, writeJson } from './files.js';
import type { SourceTranscript } from './sources.js';
import type { Vocabulary } from './vocabulary.js';

// Discovery pass to design the fixed list: one cheap call per transcript that
// proposes free themes and a type, before the expensive full enrichment.

export const ANALYSIS_VERSION = 2;
const SAMPLE_CHARS = 10000;

export interface Profile {
  /** General themes, 1-3 words, without names of persons or organisations. */
  themas: string[];
  /** Organisations mentioned (customers, partners, suppliers). Report only. */
  organisaties: string[];
  /** Best fit from the current type list, and whether it fits well. */
  type_passend: string;
  type_past_goed: boolean;
  /** How the model would call this kind of meeting itself. */
  type_vrij: string;
}

/** Whole transcript when short; otherwise four windows spread over it (start, ⅓, ⅔, end). */
export function sample(text: string): string {
  if (text.length <= SAMPLE_CHARS) return text;
  const win = Math.floor(SAMPLE_CHARS / 4);
  const parts: string[] = [];
  for (let i = 0; i < 4; i++) {
    const at = Math.floor(((text.length - win) * i) / 3);
    const start = text.lastIndexOf('\n', at) + 1;
    parts.push(text.slice(start, start + win));
  }
  return parts.join('\n\n[…]\n\n');
}

function schema(types: string[]) {
  const list = (maxItems: number) => ({ type: 'array', items: { type: 'string' }, maxItems });
  return {
    type: 'object',
    properties: {
      themas: list(5),
      organisaties: list(8),
      type_passend: { type: 'string', enum: types },
      type_past_goed: { type: 'boolean' },
      type_vrij: { type: 'string' },
    },
    required: ['themas', 'organisaties', 'type_passend', 'type_past_goed', 'type_vrij'],
  };
}

const SYSTEM = `Je helpt een kennisbank van zakelijke gesprekken van Zig (softwareleverancier voor woningcorporaties) in te richten. Je krijgt (een steekproef uit) een automatisch transcript en typeert het gesprek.

Regels:
- themas: 2 tot 5 algemene thema's van 1-3 woorden: het vakgebied, product, proces of project waar het gesprek inhoudelijk over gaat. Gebruik GEEN namen van personen of organisaties in thema's.
- Maak geen thema van persoonlijke omstandigheden van individuen (gezondheid, privéleven, salaris of beoordeling van een persoon).
- organisaties: genoemde organisaties (klanten, partners, leveranciers), alleen de naam.
- type_vrij: hoe je dit soort gesprek zelf zou noemen, in 1-3 woorden, zonder namen.
- type_passend: daarna het best passende type uit de lijst.
- Baseer je alleen op het transcript; verzin niets.`;

function cachePath(hash: string): string {
  return path.join(kbConfig.cacheDir, 'analyse', `${hash}.json`);
}

export function cachedProfile(src: SourceTranscript): Profile | undefined {
  const entry = readJson<{ version: number; profile: Profile } | null>(cachePath(src.hash), null);
  return entry && entry.version === ANALYSIS_VERSION ? entry.profile : undefined;
}

export async function getProfile(src: SourceTranscript, vocab: Vocabulary, force = false): Promise<Profile> {
  const cached = force ? undefined : cachedProfile(src);
  if (cached) return cached;
  const when = new Date(src.startMs).toISOString().slice(0, 10);
  const raw = await chatJson<Partial<Profile>>(SYSTEM, `Gesprek: "${src.title}" (${when}, ${src.durationMin} min, bron: ${src.source}, ${src.speakers.length || 'onbekend aantal'} sprekers).
Typelijst: ${vocab.types.join(', ')}

Transcript${src.transcript.length > SAMPLE_CHARS ? ' (steekproef)' : ''}:
"""
${sample(src.transcript)}
"""`, schema(vocab.types), {
    themas: ['testthema'],
    organisaties: [],
    type_passend: 'overleg',
    type_past_goed: true,
    type_vrij: 'testoverleg',
  });
  const list = (v: unknown) => (Array.isArray(v) ? [...new Set(v.map(x => String(x).trim()).filter(Boolean))] : []);
  const profile: Profile = {
    themas: list(raw.themas).slice(0, 5),
    organisaties: list(raw.organisaties).slice(0, 8),
    type_passend: vocab.types.includes(String(raw.type_passend)) ? String(raw.type_passend) : 'overig',
    type_past_goed: raw.type_past_goed === true,
    type_vrij: String(raw.type_vrij ?? '').trim(),
  };
  if (kbConfig.llm.provider !== 'mock') {
    writeJson(cachePath(src.hash), { version: ANALYSIS_VERSION, model: kbConfig.llm.model, profile, createdAt: new Date().toISOString() });
  }
  return profile;
}
