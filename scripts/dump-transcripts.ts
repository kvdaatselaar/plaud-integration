import { config } from '../src/config.js';
import { state } from '../src/state.js';
import { PlaudAuth, PlaudClient, PlaudConfig } from '../src/plaud/index.js';
import { writeTranscript } from '../src/transcripts.js';
import { isoWeekInfo } from '../src/week.js';

async function main(): Promise<void> {
  if (!config.transcripts.enabled) {
    console.error('TRANSCRIPTS=off — niets te doen. Verwijder de env var of zet TRANSCRIPTS=on.');
    process.exit(1);
  }

  const plaudConfig = new PlaudConfig();
  const creds = plaudConfig.getCredentials();
  const region = creds?.region ?? 'eu';
  const plaud = new PlaudClient(new PlaudAuth(plaudConfig), region);

  const weeks = state.getOnenote().weeks ?? {};
  const recs = Object.values(weeks).flatMap(w => w.recordings);
  if (recs.length === 0) {
    console.log('Geen synced opnames in state. Run eerst: npm run sync');
    return;
  }
  console.log(`→ ${recs.length} opname(s) verwerken naar ${config.transcripts.dir}\n`);

  let ok = 0;
  let failed = 0;
  for (const r of recs) {
    try {
      const week = isoWeekInfo(new Date(r.startTime));
      const detail = await plaud.getRecording(r.plaudId);
      // Build a PlaudRecording-shaped object for writeTranscript using state info
      const recShape = {
        id: r.plaudId,
        filename: '',
        fullname: '',
        filesize: 0,
        duration: r.durationMs,
        start_time: r.startTime,
        end_time: r.startTime + r.durationMs,
        is_trash: false,
        is_trans: true,
        is_summary: !!detail.summary,
        keywords: [],
        serial_number: '',
      };
      const filePath = writeTranscript(week.label, r.title, recShape, detail);
      if (filePath) {
        console.log(`✓ ${filePath}`);
        ok++;
      }
    } catch (err) {
      failed++;
      console.error(`✗ ${r.plaudId} (${r.title}): ${(err as Error).message}`);
    }
  }
  console.log(`\nDone. Written: ${ok}, failed: ${failed}`);
}

main().catch(err => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
