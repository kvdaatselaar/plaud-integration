import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { config } from '../src/config.js';
import { state } from '../src/state.js';
import { getAccessTokenSilent } from '../src/graph-auth.js';
import { OneNote } from '../src/onenote.js';
import { Calendar, matchEvent } from '../src/calendar.js';
import { buildOverviewBody } from '../src/html.js';
import { isoWeekInfo, type WeekInfo } from '../src/week.js';

function formatTitle(startTime: number, base: string): string {
  const d = new Date(startTime);
  return `${d.toISOString().slice(0, 10)} ${d.toISOString().slice(11, 16)} — ${base.trim()}`;
}

function sanitize(name: string): string {
  return name
    .replace(/[\/\\:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
}

/** Stable date-time prefix used by both transcripts and audio file names. */
function filenamePrefix(startTime: number): string {
  const d = new Date(startTime);
  return `${d.toISOString().slice(0, 10)} ${d.toISOString().slice(11, 16).replace(':', '-')}`;
}

const AUDIO_DIR = process.env.AUDIO_DIR ?? path.join(os.homedir(), 'Documents', 'PlaudAudio');
const AUDIO_EXT = (process.env.AUDIO_FORMAT ?? 'mp3').toLowerCase() === 'opus' ? 'opus' : 'mp3';

const ARCHIVES: Array<{ label: string; dir: string; ext: string }> = [
  { label: 'transcript', dir: config.transcripts.dir, ext: 'md' },
  { label: 'audio', dir: AUDIO_DIR, ext: AUDIO_EXT },
];

/**
 * Rename any file in <archive>/<weekLabel>/ whose name starts with the
 * recording's date-time prefix and ends with the expected extension, but
 * whose full name no longer matches the current title in state. Catches
 * both new retitle changes and old leftovers from before this logic existed.
 */
function reconcileArchives(week: WeekInfo, startTime: number, expectedTitle: string, log: (m: string) => void): void {
  const prefix = filenamePrefix(startTime);
  const expectedBase = sanitize(expectedTitle);
  const weekDirName = sanitize(week.label);

  for (const arch of ARCHIVES) {
    const weekDir = path.join(arch.dir, weekDirName);
    if (!fs.existsSync(weekDir)) continue;
    const expectedFile = `${expectedBase}.${arch.ext}`;
    const expectedPath = path.join(weekDir, expectedFile);

    let candidates: string[];
    try {
      candidates = fs.readdirSync(weekDir).filter(f =>
        f.startsWith(`${prefix} `) && f.toLowerCase().endsWith(`.${arch.ext}`)
      );
    } catch {
      continue;
    }

    for (const f of candidates) {
      if (f === expectedFile) continue;
      const oldPath = path.join(weekDir, f);
      if (fs.existsSync(expectedPath)) {
        log(`  ⚠ ${arch.label}: target exists, leaving '${f}' alone`);
        continue;
      }
      try {
        fs.renameSync(oldPath, expectedPath);
        log(`  📁 ${arch.label}: ${f} → ${expectedFile}`);
      } catch (err) {
        log(`  ⚠ ${arch.label}: rename failed for '${f}': ${(err as Error).message}`);
      }
    }
  }
}

async function main(): Promise<void> {
  const graphToken = await getAccessTokenSilent();
  const onenote = new OneNote(graphToken);
  const calendar = new Calendar(graphToken);

  const weeks = state.getOnenote().weeks ?? {};
  const keys = Object.keys(weeks);
  if (keys.length === 0) {
    console.log('Geen gesynchroniseerde weken. Run eerst: npm run sync');
    return;
  }

  let changed = 0;
  let unchanged = 0;
  let failed = 0;
  let reconciled = 0;

  for (const weekKey of keys) {
    const weekState = weeks[weekKey];
    if (weekState.recordings.length === 0) continue;
    const week = isoWeekInfo(new Date(weekState.recordings[0].startTime));
    let weekChanged = false;

    for (const rec of weekState.recordings) {
      try {
        const recEnd = rec.startTime + (rec.durationMs ?? 0);
        const winStart = new Date(rec.startTime - 30 * 60_000).toISOString();
        const winEnd = new Date(recEnd + 30 * 60_000).toISOString();
        const events = await calendar.getEventsInRange(winStart, winEnd);
        const matched = matchEvent(rec.startTime, rec.durationMs ?? 0, events);

        if (matched?.subject) {
          const newTitle = formatTitle(rec.startTime, matched.subject);
          if (newTitle !== rec.title) {
            console.log(`✎ ${rec.title}`);
            console.log(`  → ${newTitle}`);
            await onenote.replacePageTitle(rec.pageId, newTitle);
            rec.title = newTitle;
            weekChanged = true;
            changed++;
          } else {
            unchanged++;
          }
        } else {
          unchanged++;
        }

        // Always reconcile archive filenames against the current title —
        // catches retitle deltas from THIS run and leftover orphans from
        // previous runs / earlier code that didn't touch the filesystem.
        const before = reconciled;
        reconcileArchives(week, rec.startTime, rec.title, (m) => {
          console.log(m);
          reconciled++;
        });
        if (reconciled > before) {
          // (only logged inside reconcileArchives)
        }
      } catch (err) {
        failed++;
        console.error(`✗ ${rec.pageId}: ${(err as Error).message}`);
      }
    }

    if (weekChanged) {
      state.setWeek(weekKey, weekState);
      try {
        await onenote.replacePageBody(weekState.overviewPageId, buildOverviewBody(week, weekState.recordings));
      } catch (err) {
        console.error(`Overview update failed for ${weekKey}: ${(err as Error).message}`);
      }
    }
  }

  console.log(`\nDone. Renamed pages: ${changed}, unchanged: ${unchanged}, failed: ${failed}, archive files renamed: ${reconciled}`);
}

main().catch(err => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
