import * as fs from 'node:fs';
import * as path from 'node:path';

// Reading and rewriting transcript markdown files in the archive (TRANSCRIPTS_DIR).

const TRANSCRIPT_HEADING = '## Transcript\n\n';

export function frontmatterValue(md: string, key: string): string | undefined {
  const fm = md.match(/^---\n([\s\S]*?)\n---\n/)?.[1];
  const v = fm?.match(new RegExp(`^${key}: (.*)$`, 'm'))?.[1].trim();
  return v?.replace(/^"(.*)"$/, '$1');
}

export function* markdownFiles(dir: string): Generator<string> {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* markdownFiles(p);
    else if (entry.isFile() && entry.name.endsWith('.md')) yield p;
  }
}

/** The transcript section of an archived file, or null when it has none. */
export function transcriptSection(md: string): string | null {
  const at = md.indexOf(TRANSCRIPT_HEADING);
  return at < 0 ? null : md.slice(at + TRANSCRIPT_HEADING.length).trim();
}

/** The markdown with its transcript section replaced; everything above it stays as it was. */
export function replaceTranscript(md: string, transcript: string): string | null {
  const at = md.indexOf(TRANSCRIPT_HEADING);
  if (at < 0) return null;
  return `${md.slice(0, at + TRANSCRIPT_HEADING.length)}${transcript.trim()}\n`;
}

/** Utterances in a transcript: lines that start with a timestamp. */
export function countUtterances(transcript: string): number {
  return transcript.match(/^\[[0-9:]+\] /gm)?.length ?? 0;
}
