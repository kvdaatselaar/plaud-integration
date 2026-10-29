import * as fs from 'node:fs';
import { frontmatterValue, markdownFiles } from './archive.js';
import { matchEvent, type CalendarEvent } from './calendar.js';
import { isInternal, participantsFromEvent, setParticipants, type Participant } from './participants.js';
import { threadIdFromJoinUrl, threadIdFromMeetingId, type TeamsMeetingCandidate } from './teams.js';
import { OccurrenceIndex, occurrenceParticipants } from './teams-sync.js';

const MARGIN = 30 * 60_000;

export interface ArchivedMeeting {
  source: 'plaud' | 'teams';
  startMs: number;
  durationMs: number;
  onlineMeetingId?: string;
}

/** Start (UTC, as the sync writes it), duration and Teams meeting id from a transcript's frontmatter. */
export function archivedMeeting(md: string): ArchivedMeeting | null {
  const source = frontmatterValue(md, 'source');
  if (source !== 'plaud' && source !== 'teams') return null;
  const startMs = Date.parse(`${frontmatterValue(md, 'date')}T${frontmatterValue(md, 'time')}:00Z`);
  if (!Number.isFinite(startMs)) return null;
  const durationMs = Number(frontmatterValue(md, 'duration_min') ?? 0) * 60_000;
  return { source, startMs, durationMs, onlineMeetingId: frontmatterValue(md, 'online_meeting_id') };
}

/** Calendar events with a Teams link, in the shape the Teams sync matches transcripts against. */
export function teamsCandidates(events: CalendarEvent[]): TeamsMeetingCandidate[] {
  return events
    .filter(e => !e.isCancelled && e.onlineMeeting?.joinUrl)
    .map(e => ({
      eventId: e.id,
      subject: e.subject,
      joinUrl: e.onlineMeeting!.joinUrl!,
      threadId: threadIdFromJoinUrl(e.onlineMeeting!.joinUrl!),
      startMs: Date.parse(e.start.dateTime.endsWith('Z') ? e.start.dateTime : `${e.start.dateTime}Z`),
      endMs: Date.parse(e.end.dateTime.endsWith('Z') ? e.end.dateTime : `${e.end.dateTime}Z`),
      isOrganizer: false,
      organizerEmail: e.organizer?.emailAddress?.address,
      organizerName: e.organizer?.emailAddress?.name,
      attendees: e.attendees,
    }));
}

export class ParticipantResolver {
  private occurrences: OccurrenceIndex;

  constructor(
    private events: CalendarEvent[],
    /** Thread id of a Teams meeting whose id doesn't carry one (Graph lookup). */
    private threadIdOf: (onlineMeetingId: string) => Promise<string | undefined> = async () => undefined,
  ) {
    this.occurrences = new OccurrenceIndex(teamsCandidates(events));
  }

  /** The participants of the calendar event a transcript belongs to; null when none matches. */
  async resolve(m: ArchivedMeeting): Promise<Participant[] | null> {
    const endMs = m.startMs + m.durationMs;
    if (m.source === 'teams') {
      if (!m.onlineMeetingId) return null;
      const threadId = threadIdFromMeetingId(m.onlineMeetingId) ?? await this.threadIdOf(m.onlineMeetingId);
      const occ = this.occurrences.match(threadId, m.startMs, endMs);
      return occ ? occurrenceParticipants(occ) : null;
    }
    const around = this.events.filter(e => {
      const s = Date.parse(`${e.start.dateTime.replace(/Z$/, '')}Z`);
      const t = Date.parse(`${e.end.dateTime.replace(/Z$/, '')}Z`);
      return t >= m.startMs - MARGIN && s <= endMs + MARGIN;
    });
    const event = matchEvent(m.startMs, m.durationMs, around);
    return event ? participantsFromEvent(event) : null;
  }
}

export interface BackfillResult {
  files: number;
  /** Files for which a calendar event with participants was found. */
  withParticipants: number;
  changed: number;
  /** Participant entries over all files, and distinct addresses. */
  entriesInternal: number;
  entriesExternal: number;
  addressesInternal: number;
  addressesExternal: number;
}

/** Adds `deelnemers` to the frontmatter of archived transcripts; only the frontmatter changes. */
export async function backfillParticipants(opts: {
  dir: string;
  resolver: ParticipantResolver;
  internalDomains: string[];
  apply?: boolean;
}): Promise<BackfillResult> {
  const r: BackfillResult = {
    files: 0, withParticipants: 0, changed: 0,
    entriesInternal: 0, entriesExternal: 0, addressesInternal: 0, addressesExternal: 0,
  };
  const addresses = new Set<string>();
  for (const file of markdownFiles(opts.dir)) {
    const md = fs.readFileSync(file, 'utf-8');
    const meeting = archivedMeeting(md);
    if (!meeting) continue;
    r.files++;
    const list = await opts.resolver.resolve(meeting);
    if (!list?.length) continue;
    r.withParticipants++;
    for (const p of list) {
      if (isInternal(p.email, opts.internalDomains)) r.entriesInternal++;
      else r.entriesExternal++;
      addresses.add(p.email);
    }
    const updated = setParticipants(md, list);
    if (!updated || updated === md) continue;
    r.changed++;
    if (opts.apply) fs.writeFileSync(file, updated);
  }
  for (const a of addresses) {
    if (isInternal(a, opts.internalDomains)) r.addressesInternal++;
    else r.addressesExternal++;
  }
  return r;
}
