import * as fs from 'node:fs';
import * as path from 'node:path';
import { config } from './config.js';
import type { PlaudClient } from './plaud/index.js';

function sanitize(name: string): string {
  return name
    .replace(/[\/\\:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
}

export function audioFilePath(weekLabel: string, title: string): string {
  return path.join(
    config.audio.dir,
    sanitize(weekLabel),
    `${sanitize(title)}.${config.audio.format}`,
  );
}

/**
 * Download the audio file for a recording if the archive is enabled and the
 * file isn't already on disk. Returns { path, status } — status is 'wrote',
 * 'exists', or 'disabled'. Throws on download errors so the caller can log.
 */
export async function ensureAudio(
  plaud: PlaudClient,
  plaudId: string,
  weekLabel: string,
  title: string,
): Promise<{ path: string; status: 'wrote' | 'exists' | 'disabled' }> {
  const dest = audioFilePath(weekLabel, title);
  if (!config.audio.enabled) {
    return { path: dest, status: 'disabled' };
  }
  if (fs.existsSync(dest)) {
    return { path: dest, status: 'exists' };
  }
  await plaud.downloadAudioToFile(plaudId, dest, config.audio.format === 'opus');
  return { path: dest, status: 'wrote' };
}
