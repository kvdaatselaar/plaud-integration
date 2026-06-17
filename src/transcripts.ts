import * as fs from 'node:fs';
import * as path from 'node:path';
import { config } from './config.js';
import type { PlaudRecording, PlaudRecordingDetail } from './plaud/index.js';

/**
 * Sanitize a string for filesystem use. Strips path separators and reserved
 * characters; preserves spaces, parens, hyphens, dots. Caps at 200 chars.
 */
function sanitize(name: string): string {
  return name
    .replace(/[\/\\:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
}

export function buildTranscriptMarkdown(
  rec: PlaudRecording,
  detail: PlaudRecordingDetail,
  title: string,
): string {
  const date = new Date(rec.start_time);
  const dateStr = date.toISOString().slice(0, 10);
  const timeStr = date.toISOString().slice(11, 16);
  const durationMin = Math.round((rec.duration ?? 0) / 60000);

  const parts: string[] = [];
  // YAML frontmatter for tooling (Obsidian, grep, etc.)
  parts.push('---');
  parts.push(`title: "${title.replace(/"/g, '\\"')}"`);
  parts.push(`date: ${dateStr}`);
  parts.push(`time: "${timeStr}"`);
  parts.push(`duration_min: ${durationMin}`);
  parts.push(`plaud_id: ${rec.id}`);
  parts.push('source: plaud');
  parts.push('---');
  parts.push('');
  parts.push(`# ${title}`);
  parts.push('');
  parts.push(`- **Datum:** ${dateStr} ${timeStr}`);
  parts.push(`- **Duur:** ${durationMin} min`);
  parts.push('');

  if (detail.transcript?.trim()) {
    parts.push('## Transcript');
    parts.push('');
    parts.push(detail.transcript.trim());
    parts.push('');
  } else {
    parts.push('_(Geen transcript beschikbaar)_');
    parts.push('');
  }

  return parts.join('\n');
}

/**
 * Write a transcript markdown file to <transcripts dir>/<weekLabel>/<title>.md.
 * No-op (returns null) when TRANSCRIPTS=off. Filenames are sanitized; an
 * existing file at the same path is overwritten.
 */
export function writeTranscript(
  weekLabel: string,
  title: string,
  rec: PlaudRecording,
  detail: PlaudRecordingDetail,
): string | null {
  if (!config.transcripts.enabled) return null;
  const weekDir = path.join(config.transcripts.dir, sanitize(weekLabel));
  fs.mkdirSync(weekDir, { recursive: true });
  const fileBase = sanitize(title);
  const filePath = path.join(weekDir, `${fileBase}.md`);
  fs.writeFileSync(filePath, buildTranscriptMarkdown(rec, detail, title));
  return filePath;
}
