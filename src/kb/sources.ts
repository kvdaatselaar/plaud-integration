import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse } from 'yaml';
import { kbConfig } from './config.js';
import { sha1, splitFrontmatter } from './files.js';

export interface SourceTranscript {
  source: 'plaud' | 'teams';
  /** Title without the "yyyy-mm-dd hh:mm — " prefix. */
  title: string;
  /** Start moment (raw files store UTC date + time). */
  startMs: number;
  durationMin: number;
  /** Path relative to the transcript archive, e.g. "Week 41 (…)/….md". */
  relPath: string;
  transcript: string;
  /** Content hash — the cache key, stable across id or title changes. */
  hash: string;
  /** Speaker labels from Teams transcripts ("[0:04] Name: …"). Empty for Plaud. */
  speakers: string[];
}

function speakersOf(transcript: string): string[] {
  const names = new Set<string>();
  for (const m of transcript.matchAll(/^\[[\d:]+\] ([^:\n]{2,60}): /gm)) names.add(m[1].trim());
  return [...names];
}

/** Every raw transcript in the week folders. Only reads; never writes there. */
export function scanSources(): SourceTranscript[] {
  const root = kbConfig.sourceDir;
  if (!fs.existsSync(root)) throw new Error(`Transcriptarchief niet gevonden: ${root}`);
  const out: SourceTranscript[] = [];
  for (const week of fs.readdirSync(root, { withFileTypes: true })) {
    if (!week.isDirectory() || !week.name.startsWith('Week ')) continue;
    for (const file of fs.readdirSync(path.join(root, week.name))) {
      if (!file.endsWith('.md')) continue;
      const relPath = path.join(week.name, file);
      const parts = splitFrontmatter(fs.readFileSync(path.join(root, relPath), 'utf-8'));
      if (!parts) continue;
      const meta = (parse(parts.yaml) ?? {}) as Record<string, unknown>;
      const source = meta.source === 'teams' ? 'teams' : meta.source === 'plaud' ? 'plaud' : null;
      const transcript = parts.body.split(/^## Transcript\s*$/m)[1]?.trim() ?? '';
      if (!source || !transcript || !meta.date) continue;
      const startMs = Date.parse(`${meta.date}T${meta.time ?? '00:00'}:00Z`);
      if (!Number.isFinite(startMs)) continue;
      out.push({
        source,
        title: String(meta.title ?? file).replace(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2} — /, '').trim(),
        startMs,
        durationMin: Number(meta.duration_min ?? 0),
        relPath,
        transcript,
        hash: sha1(transcript),
        speakers: source === 'teams' ? speakersOf(transcript) : [],
      });
    }
  }
  return out.sort((a, b) => a.startMs - b.startMs);
}
