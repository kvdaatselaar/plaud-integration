import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { state } from '../src/state.js';
import { PlaudAuth, PlaudClient, PlaudConfig } from '../src/plaud/index.js';
import { isoWeekInfo } from '../src/week.js';

const AUDIO_DIR = process.env.AUDIO_DIR ?? path.join(os.homedir(), 'Documents', 'PlaudAudio');
const USE_OPUS = (process.env.AUDIO_FORMAT ?? 'mp3').toLowerCase() === 'opus';
const EXT = USE_OPUS ? 'opus' : 'mp3';

function sanitize(name: string): string {
  return name
    .replace(/[\/\\:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
}

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

async function main(): Promise<void> {
  const plaudConfig = new PlaudConfig();
  const region = plaudConfig.getCredentials()?.region ?? 'eu';
  const plaud = new PlaudClient(new PlaudAuth(plaudConfig), region);

  const weeks = state.getOnenote().weeks ?? {};
  const items: { plaudId: string; title: string; weekLabel: string }[] = [];
  for (const w of Object.values(weeks)) {
    for (const r of w.recordings) {
      const week = isoWeekInfo(new Date(r.startTime));
      items.push({ plaudId: r.plaudId, title: r.title, weekLabel: week.label });
    }
  }

  if (items.length === 0) {
    console.log('Geen synced opnames in state. Run eerst: npm run sync');
    return;
  }

  console.log(`→ ${items.length} opname(s), formaat ${EXT}, doelmap ${AUDIO_DIR}\n`);

  let ok = 0;
  let skipped = 0;
  let failed = 0;
  for (const it of items) {
    const dir = path.join(AUDIO_DIR, sanitize(it.weekLabel));
    const dest = path.join(dir, `${sanitize(it.title)}.${EXT}`);
    if (fs.existsSync(dest)) {
      console.log(`⏭ ${dest}  (${fmtBytes(fs.statSync(dest).size)})`);
      skipped++;
      continue;
    }
    try {
      process.stdout.write(`→ ${dest} ... `);
      await plaud.downloadAudioToFile(it.plaudId, dest, USE_OPUS);
      console.log(`✓ ${fmtBytes(fs.statSync(dest).size)}`);
      ok++;
    } catch (err) {
      console.log(`✗`);
      console.error(`   ${(err as Error).message}`);
      failed++;
    }
  }
  console.log(`\nDone. Downloaded: ${ok}, skipped: ${skipped}, failed: ${failed}`);
}

main().catch(err => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
