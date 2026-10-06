import { PlaudAuth, PlaudClient, PlaudConfig } from './plaud/index.js';
import { config } from './config.js';
import { state } from './state.js';
import { getAccessTokenSilent, tryGetAccessTokenSilent } from './graph-auth.js';
import { OneNote } from './onenote.js';
import { Calendar, matchEvent } from './calendar.js';
import type { CalendarEvent } from './calendar.js';
import { buildPageHtml } from './html.js';
import { writeTranscript } from './transcripts.js';
import { ensureAudio } from './audio-archive.js';
import { Teams, GraphError } from './teams.js';
import { collectTeamsTranscripts, addTeamsTranscript } from './teams-sync.js';
import { ensureNotebook, ensureWeek, refreshOverview } from './weeks.js';
import { vttToTranscript } from './vtt.js';
import { isoWeekInfo } from './week.js';

function log(msg: string): void {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
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

  const notebookId = await ensureNotebook(onenote, log);

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
      const weekState = await ensureWeek(onenote, notebookId, week, log);

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

      await refreshOverview(onenote, week, weekState);

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
  log(`Teams: transcripts vanaf ${new Date(since).toISOString().slice(0, 10)} → nu`);

  let noAccess: { subject: string; reason: string }[] = [];
  try {
    const collected = await collectTeamsTranscripts(teams, since, until);
    noAccess = collected.noAccess;
    for (const e of collected.errors) {
      teamsFailed++;
      log(`   ✗ ${e}`);
    }
    const todo = collected.items.filter(i => !state.hasSyncedTeams(i.transcriptId, i.key));
    log(`Teams: ${collected.items.length} transcript(s) gevonden, ${todo.length} nieuw`);

    for (const item of todo) {
      try {
        log(`→ Teams "${item.subject}" (${new Date(item.startMs).toISOString().slice(0, 16).replace('T', ' ')})`);
        let vtt: string;
        try {
          vtt = await teams.getTranscriptVtt(item.meetingId, item.transcriptId);
        } catch (err) {
          if (err instanceof GraphError && err.status === 404) {
            log('   ⏭ transcript niet (meer) beschikbaar bij Microsoft');
            teamsSkipped++;
            continue;
          }
          throw err;
        }
        const transcript = vttToTranscript(vtt);
        if (!transcript) {
          log('   ⏭ transcript is leeg (Teams verwerkt hem mogelijk nog; volgende run opnieuw)');
          teamsSkipped++;
          continue;
        }
        const { title, mdPath } = await addTeamsTranscript(onenote, notebookId, item, transcript, log);
        if (mdPath) log(`   📄 ${mdPath}`);
        teamsOk++;
        log(`   ✓ ${title}`);
      } catch (err) {
        teamsFailed++;
        log(`   ✗ Teams "${item.subject}": ${(err as Error).message}`);
      }
    }
  } catch (err) {
    teamsFailed++;
    log(`Teams-fase afgebroken: ${(err as Error).message}`);
  }

  if (noAccess.length > 0) {
    log(`Teams: ${noAccess.length} meeting(s) niet bereikbaar via Microsoft Graph:`);
    for (const n of noAccess) log(`   – "${n.subject}": ${n.reason}`);
  }

  log(`Teams done. Synced ${teamsOk}, skipped ${teamsSkipped}, no access ${noAccess.length}, failed ${teamsFailed}`);

  if (failed > 0 || teamsFailed > 0) process.exit(1);
}

main().catch(err => {
  console.error('[fatal]', err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
