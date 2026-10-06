import * as fs from 'node:fs';
import { config } from '../src/config.js';
import { state } from '../src/state.js';
import type { TeamsMeetingRecord } from '../src/state.js';
import { getAccessTokenSilent } from '../src/graph-auth.js';
import { OneNote } from '../src/onenote.js';
import { Teams, GraphError } from '../src/teams.js';
import type { MeetingTranscript, OnlineMeeting } from '../src/teams.js';
import { OccurrenceIndex, toWorkItem, addTeamsTranscript, transcriptKey } from '../src/teams-sync.js';
import type { TeamsWorkItem } from '../src/teams-sync.js';
import { ensureNotebook, refreshOverview } from '../src/weeks.js';
import { buildTeamsPageHtml } from '../src/html.js';
import { teamsTranscriptPath, isTeamsTranscriptFile, writeTeamsTranscript } from '../src/transcripts.js';
import { vttToTranscript } from '../src/vtt.js';
import { isoWeekInfo } from '../src/week.js';

// Cleans up Teams pages created by older versions of the sync:
//  - duplicates: Microsoft re-issued transcript ids, so transcripts were synced twice
//  - misfiled: every transcript of a recurring series got the first occurrence's date
//   npm run teams:repair            → dry run, shows what would change
//   npm run teams:repair -- --apply → delete duplicates, recreate misfiled pages
const APPLY = process.argv.includes('--apply');
const DAY = 864e5;

const log = (m: string) => console.log(m);
const fmt = (ms: number) => new Date(ms).toISOString().slice(0, 16).replace('T', ' ');

function titleFor(item: TeamsWorkItem): string {
  return buildTeamsPageHtml({ ...item, onlineMeetingId: item.meetingId, transcript: '' }).title;
}

function existingMd(weekLabel: string, title: string, transcriptId: string): string | undefined {
  const p = teamsTranscriptPath(weekLabel, title, transcriptId);
  return fs.existsSync(p) && isTeamsTranscriptFile(p, transcriptId) ? p : undefined;
}

/** Drop a record from state, delete its OneNote page and its own markdown file. */
async function removeRecord(onenote: OneNote, weekKey: string, rec: TeamsMeetingRecord): Promise<void> {
  const w = state.getWeek(weekKey);
  if (w) {
    w.teamsMeetings = (w.teamsMeetings ?? []).filter(r => r.pageId !== rec.pageId);
    state.setWeek(weekKey, w);
  }
  try {
    await onenote.deletePage(rec.pageId);
  } catch (err) {
    if (!String(err).includes('404')) throw err;
  }
  const md = existingMd(isoWeekInfo(new Date(rec.startTime)).label, rec.title, rec.transcriptId);
  if (md) fs.unlinkSync(md);
}

interface Plan {
  weekKey: string;
  rec: TeamsMeetingRecord;
  item: TeamsWorkItem;
  newTitle: string;
}

async function main(): Promise<void> {
  const token = await getAccessTokenSilent([...config.graph.scopes, ...config.graph.teamsScopes]);
  const onenote = new OneNote(token);
  const teams = new Teams(token);

  const weeks = state.getOnenote().weeks ?? {};
  const records = Object.entries(weeks).flatMap(([weekKey, w]) => (w.teamsMeetings ?? []).map(rec => ({ weekKey, rec })));
  if (records.length === 0) {
    log('Geen Teams-pagina\'s in state — niets te repareren.');
    return;
  }

  const earliest = Math.min(...records.map(r => r.rec.startTime));
  const calendar = await teams.listMeetingsFromCalendar(earliest - 2 * DAY, Date.now() + DAY);
  const occurrences = new OccurrenceIndex(calendar);
  const meetingCache = new Map<string, OnlineMeeting | null>();

  const moves: Plan[] = [];
  const correct: Plan[] = [];
  const duplicates: { weekKey: string; rec: TeamsMeetingRecord }[] = [];
  const unknown: { weekKey: string; rec: TeamsMeetingRecord }[] = [];

  // Old transcript ids still resolve, and the response carries the canonical id.
  const groups = new Map<string, { weekKey: string; rec: TeamsMeetingRecord; t: MeetingTranscript }[]>();
  for (const { weekKey, rec } of records) {
    let t: MeetingTranscript | undefined;
    try {
      t = await teams.getTranscript(rec.onlineMeetingId, rec.transcriptId);
    } catch {
      t = undefined;
    }
    const key = t && transcriptKey(t);
    if (!t || !key) {
      unknown.push({ weekKey, rec });
      continue;
    }
    groups.set(key, [...(groups.get(key) ?? []), { weekKey, rec, t }]);
  }

  for (const members of groups.values()) {
    const item = await toWorkItem(teams, members[0].t, occurrences, meetingCache);
    if (!item) {
      unknown.push(...members);
      continue;
    }
    const newTitle = titleFor(item);
    const newWeek = isoWeekInfo(new Date(item.startMs)).key;
    const isRight = (m: { weekKey: string; rec: TeamsMeetingRecord }) => m.rec.title === newTitle && m.weekKey === newWeek;
    const keeper = members.find(isRight) ?? members[0];
    const plan = { weekKey: keeper.weekKey, rec: keeper.rec, item, newTitle };
    (isRight(keeper) ? correct : moves).push(plan);
    for (const m of members) if (m !== keeper) duplicates.push({ weekKey: m.weekKey, rec: m.rec });
  }

  // Misfiled siblings shared a markdown filename, so some correct pages lost their .md.
  const mdRestore = config.transcripts.enabled
    ? correct.filter(p => {
        const label = isoWeekInfo(new Date(p.rec.startTime)).label;
        const ours = existingMd(label, p.rec.title, p.rec.transcriptId);
        return !ours;
      })
    : [];

  log(`Teams-pagina's in state: ${records.length}`);
  log(`  ✓ correct:                       ${correct.length}`);
  log(`  ✗ dubbel (wordt verwijderd):      ${duplicates.length}`);
  log(`  ↻ verkeerde datum/week:           ${moves.length}`);
  log(`  ? onbekend bij Microsoft:         ${unknown.length} (blijven ongewijzigd)`);
  if (config.transcripts.enabled) log(`  📄 markdown te herstellen:       ${mdRestore.length}`);
  if (duplicates.length > 0) {
    log('\nDubbele pagina\'s (een exemplaar blijft staan):');
    for (const d of duplicates) log(`  ${d.rec.title}`);
  }
  if (moves.length > 0) {
    log('\nVerplaatsingen:');
    for (const m of moves) log(`  ${fmt(m.rec.startTime)} → ${fmt(m.item.startMs)}  ${m.item.subject.trim()}`);
  }

  if (!APPLY) {
    log('\nDry run — er is niets gewijzigd. Uitvoeren: npm run teams:repair -- --apply');
    log('Let op: --apply verwijdert dubbele en verkeerd gedateerde OneNote-pagina\'s (die laatste');
    log('worden opnieuw aangemaakt); eigen aantekeningen op die pagina\'s gaan verloren.');
    return;
  }

  const notebookId = await ensureNotebook(onenote, log);

  let removed = 0;
  for (const d of duplicates) {
    try {
      await removeRecord(onenote, d.weekKey, d.rec);
      removed++;
    } catch (err) {
      log(`✗ dubbel ${d.rec.title}: ${(err as Error).message}`);
    }
  }

  let moved = 0;
  let skipped = 0;
  for (const m of moves) {
    try {
      let vtt: string;
      try {
        vtt = await teams.getTranscriptVtt(m.item.meetingId, m.item.transcriptId);
      } catch (err) {
        if (err instanceof GraphError && err.status === 404) {
          log(`⏭ ${m.rec.title}: transcript niet meer beschikbaar, pagina blijft staan`);
          skipped++;
          continue;
        }
        throw err;
      }
      const transcript = vttToTranscript(vtt);
      if (!transcript) {
        log(`⏭ ${m.rec.title}: lege transcript, pagina blijft staan`);
        skipped++;
        continue;
      }

      // Create the correctly dated entry first, then remove the old one.
      const { title } = await addTeamsTranscript(onenote, notebookId, m.item, transcript, () => {});

      await removeRecord(onenote, m.weekKey, m.rec);

      moved++;
      log(`↻ ${m.rec.title}\n   → ${title}`);
    } catch (err) {
      log(`✗ ${m.rec.title}: ${(err as Error).message}`);
    }
  }

  for (const p of correct) {
    state.markTeamsSynced(p.item.transcriptId, p.item.key);
    const w = state.getWeek(p.weekKey)!;
    for (const r of w.teamsMeetings ?? []) if (r.pageId === p.rec.pageId) r.transcriptKey = p.item.key;
    state.setWeek(p.weekKey, w);
  }

  // Re-check after deletions: a duplicate may have owned the keeper's markdown filename.
  let restored = 0;
  for (const p of config.transcripts.enabled ? correct : []) {
    const label = isoWeekInfo(new Date(p.rec.startTime)).label;
    if (existingMd(label, p.rec.title, p.rec.transcriptId)) continue;
    try {
      const transcript = vttToTranscript(await teams.getTranscriptVtt(p.item.meetingId, p.item.transcriptId));
      if (!transcript) continue;
      writeTeamsTranscript(label, p.rec.title, {
        onlineMeetingId: p.item.meetingId,
        transcriptId: p.rec.transcriptId,
        startMs: p.rec.startTime,
        endMs: p.rec.startTime + p.rec.durationMs,
      }, transcript);
      restored++;
    } catch (err) {
      log(`✗ markdown ${p.rec.title}: ${(err as Error).message}`);
    }
  }

  // Overviews were also rebuilt without Teams items whenever a Plaud recording
  // landed in the same week — refresh every week once.
  for (const [weekKey, w] of Object.entries(state.getOnenote().weeks ?? {})) {
    const first = w.recordings[0]?.startTime ?? w.teamsMeetings?.[0]?.startTime;
    if (first === undefined) continue;
    try {
      await refreshOverview(onenote, isoWeekInfo(new Date(first)), w);
    } catch (err) {
      log(`✗ overzicht ${weekKey}: ${(err as Error).message}`);
    }
  }

  log(`\nKlaar. Dubbel verwijderd: ${removed}, verplaatst: ${moved}, overgeslagen: ${skipped}, markdown hersteld: ${restored}, overzichten ververst.`);
}

main().catch(err => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
