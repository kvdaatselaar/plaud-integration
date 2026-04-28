import { PlaudAuth, PlaudClient, PlaudConfig } from './plaud/index.js';
import { config } from './config.js';
import { state } from './state.js';
import type { WeekState } from './state.js';
import { getAccessTokenSilent } from './graph-auth.js';
import { OneNote } from './onenote.js';
import { Calendar, matchEvent } from './calendar.js';
import type { CalendarEvent } from './calendar.js';
import { buildPageHtml, buildOverviewPageHtml, buildOverviewBody } from './html.js';
import { isoWeekInfo } from './week.js';

function log(msg: string): void {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
}

async function ensureNotebook(onenote: OneNote): Promise<string> {
  const current = state.getOnenote();
  if (current.notebookId) return current.notebookId;
  log(`Resolving notebook "${config.onenote.notebookName}"`);
  const nb = (await onenote.findNotebook(config.onenote.notebookName))
    ?? (await onenote.createNotebook(config.onenote.notebookName));
  state.setNotebookId(nb.id);
  return nb.id;
}

async function ensureWeek(
  onenote: OneNote,
  notebookId: string,
  weekKey: string,
  weekLabel: string,
  weekIso: { mondayIso: string; sundayIso: string; year: number; week: number; key: string; label: string },
): Promise<WeekState> {
  const existing = state.getWeek(weekKey);
  if (existing) return existing;

  log(`Creating week section "${weekLabel}"`);
  const section = (await onenote.findSection(notebookId, weekLabel))
    ?? (await onenote.createSection(notebookId, weekLabel));

  log(`Creating overview page for ${weekKey}`);
  const overview = await onenote.createPage(section.id, buildOverviewPageHtml(weekIso));

  const weekState: WeekState = {
    sectionId: section.id,
    overviewPageId: overview.id,
    recordings: [],
  };
  state.setWeek(weekKey, weekState);
  return weekState;
}

async function main(): Promise<void> {
  log('Plaud → OneNote sync starting');

  const plaudConfig = new PlaudConfig();
  const creds = plaudConfig.getCredentials();
  const plaudToken = plaudConfig.getToken();
  if (!creds && !plaudToken) {
    throw new Error('Plaud not logged in. Run `npm run plaud:browser-login` first.');
  }
  const region = creds?.region ?? 'eu';
  const plaud = new PlaudClient(new PlaudAuth(plaudConfig), region);

  const graphToken = await getAccessTokenSilent();
  const onenote = new OneNote(graphToken);
  const calendar = new Calendar(graphToken);

  const notebookId = await ensureNotebook(onenote);

  const recordings = await plaud.listRecordings();
  log(`Plaud returned ${recordings.length} recording(s)`);

  const todo = recordings.filter(r => !state.hasSynced(r.id));
  log(`${todo.length} new recording(s) to sync`);

  let ok = 0;
  let failed = 0;
  let skipped = 0;
  for (const rec of todo) {
    try {
      log(`→ ${rec.id} | ${rec.filename}`);

      if (!rec.is_trans) {
        log(`   ⏭ Overgeslagen — transcript nog niet gereed in Plaud (wordt opnieuw geprobeerd bij volgende sync)`);
        skipped++;
        continue;
      }

      const week = isoWeekInfo(new Date(rec.start_time));
      const weekState = await ensureWeek(onenote, notebookId, week.key, week.label, week);

      const detail = await plaud.getRecording(rec.id);

      if (!detail.transcript?.trim() && !detail.summary?.trim()) {
        log(`   ⏭ Overgeslagen — transcript/summary leeg in Plaud-detail (wordt opnieuw geprobeerd bij volgende sync)`);
        skipped++;
        continue;
      }

      // Match against calendar events around the recording window
      let matched: CalendarEvent | null = null;
      try {
        const recEnd = rec.start_time + (rec.duration ?? 0);
        const winStart = new Date(rec.start_time - 30 * 60_000).toISOString();
        const winEnd = new Date(recEnd + 30 * 60_000).toISOString();
        const events = await calendar.getEventsInRange(winStart, winEnd);
        matched = matchEvent(rec.start_time, rec.duration ?? 0, events);
        if (matched) log(`   📅 Calendar match: "${matched.subject}"`);
      } catch (err) {
        log(`   ⚠ Calendar lookup failed: ${(err as Error).message} (keeping Plaud title)`);
      }

      const { title, html } = buildPageHtml(rec, detail, matched?.subject);
      const page = await onenote.createPage(weekState.sectionId, html);

      weekState.recordings.push({
        plaudId: rec.id,
        pageId: page.id,
        title,
        startTime: rec.start_time,
        durationMs: rec.duration,
        clientUrl: page.links?.oneNoteClientUrl?.href,
        webUrl: page.links?.oneNoteWebUrl?.href,
      });
      state.setWeek(week.key, weekState);

      const overviewBody = buildOverviewBody(week, weekState.recordings);
      await onenote.replacePageBody(weekState.overviewPageId, overviewBody);

      state.markSynced(rec.id);
      ok++;
      log(`   ✓ ${title}`);
    } catch (err) {
      failed++;
      log(`   ✗ Failed: ${(err as Error).message}`);
    }
  }

  log(`Done. Synced ${ok}, skipped ${skipped}, failed ${failed}, total recordings ${recordings.length}`);
  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error('[fatal]', err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
