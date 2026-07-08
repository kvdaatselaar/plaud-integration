import { PlaudAuth, PlaudClient, PlaudConfig } from './plaud/index.js';
import { config } from './config.js';
import { state } from './state.js';
import type { WeekState } from './state.js';
import { getAccessTokenSilent, tryGetAccessTokenSilent } from './graph-auth.js';
import { OneNote } from './onenote.js';
import { Calendar, matchEvent } from './calendar.js';
import type { CalendarEvent } from './calendar.js';
import { buildPageHtml, buildTeamsPageHtml, buildOverviewPageHtml, buildOverviewBody } from './html.js';
import { writeTranscript, writeTeamsTranscript } from './transcripts.js';
import { ensureAudio } from './audio-archive.js';
import { Teams } from './teams.js';
import { vttToTranscript } from './vtt.js';
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

      const transcriptPath = writeTranscript(week.label, title, rec, detail);
      if (transcriptPath) log(`   📄 ${transcriptPath}`);

      try {
        const audio = await ensureAudio(plaud, rec.id, week.label, title);
        if (audio.status === 'wrote') log(`   🎧 ${audio.path}`);
      } catch (err) {
        log(`   ⚠ Audio download failed: ${(err as Error).message}`);
      }

      ok++;
      log(`   ✓ ${title}`);
    } catch (err) {
      failed++;
      log(`   ✗ Failed: ${(err as Error).message}`);
    }
  }

  log(`Plaud done. Synced ${ok}, skipped ${skipped}, failed ${failed}, total recordings ${recordings.length}`);

  // ── Teams meetings phase ─────────────────────────────────────────────
  let teamsOk = 0;
  let teamsSkipped = 0;
  let teamsFailed = 0;
  const teamsToken = await tryGetAccessTokenSilent([...config.graph.scopes, ...config.graph.teamsScopes]);
  if (!teamsToken) {
    log('Teams: overgeslagen — OnlineMeetings.Read / OnlineMeetingTranscript.Read.All');
    log('       niet consented. Vraag admin-consent aan en run: npm run graph:login');
    log(`Done. Plaud synced ${ok}, skipped ${skipped}, failed ${failed}.`);
    if (failed > 0) process.exit(1);
    return;
  }
  const teams = new Teams(teamsToken);
  const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const until = Date.now();
  log(`Teams: fetching online meetings from ${new Date(since).toISOString().slice(0, 10)} → now`);

  try {
    const candidates = await teams.listMeetingsFromCalendar(since, until);
    log(`Teams: ${candidates.length} online meeting candidate(s)`);

    for (const cand of candidates) {
      try {
        const meeting = await teams.resolveMeeting(cand.joinUrl);
        if (!meeting) {
          log(`   ⏭ Meeting object niet gevonden: "${cand.subject}"`);
          teamsSkipped++;
          continue;
        }
        const transcripts = await teams.listTranscripts(meeting.id);
        if (transcripts.length === 0) {
          teamsSkipped++;
          continue;
        }
        for (const t of transcripts) {
          if (state.hasSyncedTeams(t.id)) continue;
          log(`→ Teams "${cand.subject}" transcript ${t.id.slice(0, 8)}…`);
          const vtt = await teams.getTranscriptVtt(meeting.id, t.id);
          const transcript = vttToTranscript(vtt);
          if (!transcript) {
            log(`   ⏭ VTT was leeg`);
            teamsSkipped++;
            continue;
          }

          const week = isoWeekInfo(new Date(cand.startMs));
          const weekState = await ensureWeek(onenote, notebookId, week.key, week.label, week);

          const { title, html } = buildTeamsPageHtml({
            subject: cand.subject,
            startMs: cand.startMs,
            endMs: cand.endMs,
            onlineMeetingId: meeting.id,
            transcript,
          });
          const page = await onenote.createPage(weekState.sectionId, html);

          const record = {
            onlineMeetingId: meeting.id,
            transcriptId: t.id,
            eventId: cand.eventId,
            pageId: page.id,
            title,
            startTime: cand.startMs,
            durationMs: Math.max(0, cand.endMs - cand.startMs),
            clientUrl: page.links?.oneNoteClientUrl?.href,
            webUrl: page.links?.oneNoteWebUrl?.href,
          };
          weekState.teamsMeetings = [...(weekState.teamsMeetings ?? []), record];
          state.setWeek(week.key, weekState);

          await onenote.replacePageBody(
            weekState.overviewPageId,
            buildOverviewBody(week, weekState.recordings, weekState.teamsMeetings),
          );

          const mdPath = writeTeamsTranscript(week.label, title, {
            onlineMeetingId: meeting.id,
            transcriptId: t.id,
            startMs: cand.startMs,
            endMs: cand.endMs,
          }, transcript);
          if (mdPath) log(`   📄 ${mdPath}`);

          state.markTeamsSynced(t.id);
          teamsOk++;
          log(`   ✓ ${title}`);
        }
      } catch (err) {
        const msg = (err as Error).message;
        if (msg.includes('403') && msg.includes('does not have access')) {
          log(`   ⏭ "${cand.subject}": geen transcript-rechten (waarschijnlijk niet-organizer)`);
          teamsSkipped++;
        } else {
          teamsFailed++;
          log(`   ✗ Teams meeting "${cand.subject}": ${msg}`);
        }
      }
    }
  } catch (err) {
    log(`Teams-fase overgeslagen: ${(err as Error).message}`);
    log('  (controleer of Calendars.Read, OnlineMeetings.Read en OnlineMeetingTranscript.Read.All');
    log('   consent hebben; run "npm run graph:login" opnieuw na admin-consent.)');
  }

  log(`Teams done. Synced ${teamsOk}, skipped ${teamsSkipped}, failed ${teamsFailed}`);

  if (failed > 0 || teamsFailed > 0) process.exit(1);
}

main().catch(err => {
  console.error('[fatal]', err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
