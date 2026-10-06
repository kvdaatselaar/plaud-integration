import { state } from './state.js';
import type { OneNote } from './onenote.js';
import { buildTeamsPageHtml } from './html.js';
import { writeTeamsTranscript } from './transcripts.js';
import { ensureWeek, refreshOverview } from './weeks.js';
import { isoWeekInfo } from './week.js';
import {
  GraphError,
  threadIdFromMeetingId,
  type MeetingTranscript,
  type OnlineMeeting,
  type Teams,
  type TeamsMeetingCandidate,
} from './teams.js';

const DAY = 864e5;

/** Transcript creation time, normalised. Unchanged when Microsoft re-issues the transcript id. */
export function transcriptKey(t: MeetingTranscript): string | undefined {
  const ms = Date.parse(t.createdDateTime ?? '');
  return Number.isFinite(ms) ? new Date(ms).toISOString() : undefined;
}

export interface TeamsWorkItem {
  transcriptId: string;
  /** Stable identity across Microsoft's transcript-id changes. */
  key: string;
  meetingId: string;
  subject: string;
  startMs: number;
  endMs: number;
  eventId?: string;
}

export interface TeamsNoAccess {
  subject: string;
  reason: string;
}

/** Calendar occurrences grouped by meeting thread, so a series maps to all its dates. */
export class OccurrenceIndex {
  private byThread = new Map<string, TeamsMeetingCandidate[]>();

  constructor(calendar: TeamsMeetingCandidate[]) {
    for (const c of calendar) {
      if (!c.threadId) continue;
      const list = this.byThread.get(c.threadId) ?? [];
      list.push(c);
      this.byThread.set(c.threadId, list);
    }
  }

  /**
   * The occurrence a transcript belongs to. A recurring series shares one
   * onlineMeeting, so the transcript's own timestamps pick the date.
   */
  match(threadId: string | undefined, createdMs: number, endMs: number): TeamsMeetingCandidate | undefined {
    if (!threadId) return undefined;
    const MARGIN = 30 * 60_000;
    let best: { occ: TeamsMeetingCandidate; overlap: number; delta: number } | undefined;
    for (const occ of this.byThread.get(threadId) ?? []) {
      const overlap = Math.max(0, Math.min(endMs, occ.endMs + MARGIN) - Math.max(createdMs, occ.startMs - MARGIN));
      const delta = Math.abs(createdMs - occ.startMs);
      if (overlap === 0 && delta > 2 * 60 * 60_000) continue;
      if (!best || overlap > best.overlap || (overlap === best.overlap && delta < best.delta)) {
        best = { occ, overlap, delta };
      }
    }
    return best?.occ;
  }
}

/** Turns a transcript into a dated work item, using the calendar for title and scheduled time. */
export async function toWorkItem(
  teams: Teams,
  t: MeetingTranscript,
  occurrences: OccurrenceIndex,
  meetingCache: Map<string, OnlineMeeting | null>,
): Promise<TeamsWorkItem | null> {
  const createdMs = Date.parse(t.createdDateTime ?? '');
  if (!Number.isFinite(createdMs)) return null;
  const endMs = Date.parse(t.endDateTime ?? '') || createdMs + 60 * 60_000;

  let meeting = meetingCache.get(t.meetingId);
  if (meeting === undefined) {
    try {
      meeting = await teams.getMeeting(t.meetingId);
    } catch {
      meeting = null;
    }
    meetingCache.set(t.meetingId, meeting);
  }
  const threadId = meeting?.chatInfo?.threadId ?? threadIdFromMeetingId(t.meetingId);
  const occ = occurrences.match(threadId, createdMs, endMs);
  return {
    transcriptId: t.id,
    key: transcriptKey(t)!,
    meetingId: t.meetingId,
    subject: occ?.subject ?? meeting?.subject ?? 'Teams meeting',
    startMs: occ?.startMs ?? createdMs,
    endMs: occ?.endMs ?? endMs,
    eventId: occ?.eventId,
  };
}

function describeNoAccess(err: GraphError, c: TeamsMeetingCandidate, homeDomains: Set<string>): string {
  const domain = c.organizerEmail?.split('@')[1]?.toLowerCase();
  if (domain && homeDomains.size > 0 && !homeDomains.has(domain)) {
    return `georganiseerd door ${domain}; Graph geeft geen toegang tot transcripts van andere organisaties`;
  }
  if (err.message.includes('3003')) {
    return 'Graph ziet je niet als deelnemer (bv. uitgenodigd via een groep of town hall)';
  }
  if (err.status === 404) return 'meeting niet gevonden via Graph';
  return `geen toegang (${err.code})`;
}

/**
 * Everything transcribed in [since, until]:
 *  1. meetings you organized: one getAllTranscripts call, including series exceptions
 *  2. meetings organized by others: resolved per series through the join URL
 * Meetings Graph can't reach end up in `noAccess` instead of failing the run.
 */
export async function collectTeamsTranscripts(
  teams: Teams,
  sinceMs: number,
  untilMs: number,
): Promise<{ items: TeamsWorkItem[]; noAccess: TeamsNoAccess[]; errors: string[] }> {
  const calendar = await teams.listMeetingsFromCalendar(sinceMs - DAY, untilMs + DAY);
  const occurrences = new OccurrenceIndex(calendar);
  const homeDomains = new Set(
    calendar
      .filter(c => c.isOrganizer)
      .map(c => c.organizerEmail?.split('@')[1]?.toLowerCase())
      .filter((d): d is string => !!d),
  );

  const found = new Map<string, MeetingTranscript>();
  const meetingCache = new Map<string, OnlineMeeting | null>();
  const noAccess: TeamsNoAccess[] = [];
  const errors: string[] = [];
  const inWindow = (t: MeetingTranscript) => {
    const created = Date.parse(t.createdDateTime ?? '');
    return created >= sinceMs && created <= untilMs;
  };

  const myId = await teams.getMyId();
  for (const t of await teams.listOrganizerTranscripts(myId, sinceMs, untilMs)) {
    if (inWindow(t)) found.set(t.id, t);
  }

  const attendeeSeries = new Map<string, TeamsMeetingCandidate>();
  for (const c of calendar) {
    if (c.isOrganizer || !c.threadId || attendeeSeries.has(c.threadId)) continue;
    if (c.startMs < sinceMs || c.startMs > untilMs) continue;
    attendeeSeries.set(c.threadId, c);
  }
  for (const c of attendeeSeries.values()) {
    try {
      const meeting = await teams.resolveMeeting(c.joinUrl);
      if (!meeting) {
        noAccess.push({ subject: c.subject, reason: 'meeting niet gevonden via Graph' });
        continue;
      }
      meetingCache.set(meeting.id, meeting);
      for (const t of await teams.listTranscripts(meeting.id)) {
        if (inWindow(t)) found.set(t.id, t);
      }
    } catch (err) {
      if (err instanceof GraphError && (err.status === 403 || err.status === 404)) {
        noAccess.push({ subject: c.subject, reason: describeNoAccess(err, c, homeDomains) });
      } else {
        errors.push(`"${c.subject}": ${(err as Error).message}`);
      }
    }
  }

  const items: TeamsWorkItem[] = [];
  for (const t of found.values()) {
    const item = await toWorkItem(teams, t, occurrences, meetingCache);
    if (item) items.push(item);
  }
  items.sort((a, b) => a.startMs - b.startMs);
  return { items, noAccess, errors };
}

/** Create the OneNote page, update the week overview, write the markdown, and mark it synced. */
export async function addTeamsTranscript(
  onenote: OneNote,
  notebookId: string,
  item: TeamsWorkItem,
  transcript: string,
  log: (m: string) => void,
): Promise<{ title: string; mdPath: string | null }> {
  const week = isoWeekInfo(new Date(item.startMs));
  const weekState = await ensureWeek(onenote, notebookId, week, log);

  const { title, html } = buildTeamsPageHtml({
    subject: item.subject,
    startMs: item.startMs,
    endMs: item.endMs,
    onlineMeetingId: item.meetingId,
    transcript,
  });
  const page = await onenote.createPage(weekState.sectionId, html);

  weekState.teamsMeetings = [
    ...(weekState.teamsMeetings ?? []),
    {
      onlineMeetingId: item.meetingId,
      transcriptId: item.transcriptId,
      transcriptKey: item.key,
      eventId: item.eventId,
      pageId: page.id,
      title,
      startTime: item.startMs,
      durationMs: Math.max(0, item.endMs - item.startMs),
      clientUrl: page.links?.oneNoteClientUrl?.href,
      webUrl: page.links?.oneNoteWebUrl?.href,
    },
  ];
  state.setWeek(week.key, weekState);
  await refreshOverview(onenote, week, weekState);

  const mdPath = writeTeamsTranscript(week.label, title, {
    onlineMeetingId: item.meetingId,
    transcriptId: item.transcriptId,
    startMs: item.startMs,
    endMs: item.endMs,
  }, transcript);

  state.markTeamsSynced(item.transcriptId, item.key);
  return { title, mdPath };
}
