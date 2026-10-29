import * as fs from 'node:fs';
import { frontmatterValue, markdownFiles, replaceTranscript } from './archive.js';

// Speakers are named in the Plaud app (tags, voice profiles), often after the recording was synced.
// Archived transcripts that still say "Speaker N" are fetched again until the names arrive.

const GENERIC_SPEAKER = /^\[[0-9:]+\] (Speaker|Spreker) \d+:/gm;

export function countGenericSpeakers(transcript: string): number {
  return transcript.match(GENERIC_SPEAKER)?.length ?? 0;
}

export interface ArchivedPlaud {
  path: string;
  plaudId: string;
  /** "YYYY-MM-DD HH:MM" from the frontmatter, for newest-first ordering. */
  when: string;
  generic: number;
}

/** Plaud transcripts in the archive that still contain generic speaker labels. */
export function findGenericPlaudTranscripts(dir: string): ArchivedPlaud[] {
  const out: ArchivedPlaud[] = [];
  for (const file of markdownFiles(dir)) {
    const md = fs.readFileSync(file, 'utf-8');
    if (frontmatterValue(md, 'source') !== 'plaud') continue;
    const plaudId = frontmatterValue(md, 'plaud_id');
    const generic = countGenericSpeakers(md);
    if (!plaudId || generic === 0) continue;
    const when = `${frontmatterValue(md, 'date') ?? ''} ${frontmatterValue(md, 'time') ?? ''}`.trim();
    out.push({ path: file, plaudId, when, generic });
  }
  return out;
}

/**
 * Least recently checked first, so every recording gets its turn; among those never checked
 * (or checked at the same time), the newest first.
 */
export function pickRechecks(
  found: ArchivedPlaud[],
  lastChecked: Record<string, number>,
  max: number,
): ArchivedPlaud[] {
  return [...found]
    .sort((a, b) => (lastChecked[a.plaudId] ?? 0) - (lastChecked[b.plaudId] ?? 0) || b.when.localeCompare(a.when))
    .slice(0, Math.max(0, max));
}

export interface RecheckResult {
  /** Archived Plaud transcripts with generic labels. */
  candidates: number;
  checked: number;
  improved: number;
  failed: number;
  /** plaud ids checked this run (successfully), to store as checked. */
  checkedIds: string[];
}

export async function recheckSpeakers(opts: {
  dir: string;
  fetchTranscript: (plaudId: string) => Promise<string>;
  lastChecked: Record<string, number>;
  max: number;
  dryRun?: boolean;
}): Promise<RecheckResult> {
  const found = findGenericPlaudTranscripts(opts.dir);
  const result: RecheckResult = { candidates: found.length, checked: 0, improved: 0, failed: 0, checkedIds: [] };
  for (const item of pickRechecks(found, opts.lastChecked, opts.max)) {
    try {
      const transcript = await opts.fetchTranscript(item.plaudId);
      result.checked++;
      result.checkedIds.push(item.plaudId);
      if (!transcript.trim() || countGenericSpeakers(transcript) >= item.generic) continue;
      const md = replaceTranscript(fs.readFileSync(item.path, 'utf-8'), transcript);
      if (!md) continue;
      result.improved++;
      if (!opts.dryRun) fs.writeFileSync(item.path, md);
    } catch {
      result.failed++;
    }
  }
  return result;
}
