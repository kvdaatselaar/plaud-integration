import { state } from '../src/state.js';
import { getAccessTokenSilent } from '../src/graph-auth.js';
import { OneNote } from '../src/onenote.js';
import { Calendar, matchEvent } from '../src/calendar.js';
import { buildOverviewBody } from '../src/html.js';
import { isoWeekInfo } from '../src/week.js';

function formatTitle(startTime: number, base: string): string {
  const d = new Date(startTime);
  return `${d.toISOString().slice(0, 10)} ${d.toISOString().slice(11, 16)} — ${base.trim()}`;
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
        if (!matched?.subject) {
          unchanged++;
          continue;
        }
        const newTitle = formatTitle(rec.startTime, matched.subject);
        if (newTitle === rec.title) {
          unchanged++;
          continue;
        }
        console.log(`✎ ${rec.title}`);
        console.log(`  → ${newTitle}`);
        await onenote.replacePageTitle(rec.pageId, newTitle);
        rec.title = newTitle;
        weekChanged = true;
        changed++;
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

  console.log(`\nDone. Renamed: ${changed}, unchanged: ${unchanged}, failed: ${failed}`);
}

main().catch(err => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
