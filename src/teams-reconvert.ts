import * as fs from 'node:fs';
import { countUtterances, frontmatterValue, markdownFiles, replaceTranscript, transcriptSection } from './archive.js';
import { vttToTranscript } from './vtt.js';

export interface ReconvertResult {
  /** Teams transcripts in the archive. */
  files: number;
  /** Whose VTT Graph still returned. */
  fetched: number;
  /** Graph no longer has them (404) or the request failed; these stay as they are. */
  unavailable: number;
  changed: number;
  /** Utterances in the fetched files, before and after converting again. */
  utterancesBefore: number;
  utterancesAfter: number;
  /** Fetched files that are a single utterance (the whole meeting in one block), before and after. */
  singleBlockBefore: number;
  singleBlockAfter: number;
}

/**
 * Converts archived Teams transcripts again from their VTT at Microsoft, in place: same path,
 * frontmatter and heading, only the transcript section changes.
 */
export async function reconvertTeamsArchive(opts: {
  dir: string;
  fetchVtt: (onlineMeetingId: string, transcriptId: string) => Promise<string>;
  apply?: boolean;
}): Promise<ReconvertResult> {
  const r: ReconvertResult = {
    files: 0, fetched: 0, unavailable: 0, changed: 0,
    utterancesBefore: 0, utterancesAfter: 0, singleBlockBefore: 0, singleBlockAfter: 0,
  };
  for (const file of markdownFiles(opts.dir)) {
    const md = fs.readFileSync(file, 'utf-8');
    if (frontmatterValue(md, 'source') !== 'teams') continue;
    const meetingId = frontmatterValue(md, 'online_meeting_id');
    const transcriptId = frontmatterValue(md, 'transcript_id');
    const before = transcriptSection(md);
    if (!meetingId || !transcriptId || before === null) continue;
    r.files++;

    let transcript: string;
    try {
      transcript = vttToTranscript(await opts.fetchVtt(meetingId, transcriptId));
    } catch {
      r.unavailable++;
      continue;
    }
    if (!transcript) {
      r.unavailable++;
      continue;
    }
    r.fetched++;
    const nBefore = countUtterances(before);
    const nAfter = countUtterances(transcript);
    r.utterancesBefore += nBefore;
    r.utterancesAfter += nAfter;
    if (nBefore === 1) r.singleBlockBefore++;
    if (nAfter === 1) r.singleBlockAfter++;

    const updated = replaceTranscript(md, transcript);
    if (!updated || updated === md) continue;
    r.changed++;
    if (opts.apply) fs.writeFileSync(file, updated);
  }
  return r;
}
