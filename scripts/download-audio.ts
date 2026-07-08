import * as fs from 'node:fs';
import { config } from '../src/config.js';
import { state } from '../src/state.js';
import { PlaudAuth, PlaudClient, PlaudConfig } from '../src/plaud/index.js';
import { ensureAudio, audioFilePath } from '../src/audio-archive.js';
import { isoWeekInfo } from '../src/week.js';

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

  console.log(`→ ${items.length} opname(s), formaat ${config.audio.format}, doelmap ${config.audio.dir}\n`);

  let ok = 0;
  let skipped = 0;
  let failed = 0;
  for (const it of items) {
    const dest = audioFilePath(it.weekLabel, it.title);
    try {
      process.stdout.write(`→ ${dest} ... `);
      const res = await ensureAudio(plaud, it.plaudId, it.weekLabel, it.title);
      if (res.status === 'exists') {
        console.log(`⏭ (${fmtBytes(fs.statSync(dest).size)})`);
        skipped++;
      } else if (res.status === 'disabled') {
        console.log(`⚠ AUDIO=off in .env — skipping`);
        skipped++;
      } else {
        console.log(`✓ ${fmtBytes(fs.statSync(dest).size)}`);
        ok++;
      }
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
