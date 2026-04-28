const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

export interface CalendarEvent {
  id: string;
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  isAllDay: boolean;
  isCancelled?: boolean;
  responseStatus?: { response?: string };
  organizer?: { emailAddress?: { address?: string; name?: string } };
  attendees?: Array<{
    emailAddress?: { address?: string; name?: string };
    type?: 'required' | 'optional' | 'resource';
  }>;
}

function hasOtherAttendees(e: CalendarEvent): boolean {
  const organizerEmail = e.organizer?.emailAddress?.address?.toLowerCase();
  const others = (e.attendees ?? []).filter(a => {
    const addr = a.emailAddress?.address?.toLowerCase();
    if (!addr) return false;
    if (organizerEmail && addr === organizerEmail) return false;
    return true;
  });
  return others.length >= 1;
}

export class Calendar {
  constructor(private token: string) {}

  async getEventsInRange(startIso: string, endIso: string): Promise<CalendarEvent[]> {
    const qs = new URLSearchParams({
      startDateTime: startIso,
      endDateTime: endIso,
      $select: 'id,subject,start,end,isAllDay,isCancelled,responseStatus,organizer,attendees',
      $top: '50',
    });
    const res = await fetch(`${GRAPH_BASE}/me/calendarView?${qs}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/json',
        Prefer: 'outlook.timezone="UTC"',
      },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Calendar ${res.status}: ${body.slice(0, 200)}`);
    }
    const data: any = await res.json();
    return data.value ?? [];
  }
}

/**
 * Find the calendar event that best matches a recording.
 * Preference order:
 *  1. Greatest overlap (in ms) between recording and event.
 *  2. Smallest delta between recording.start_time and event.start.
 * Events that are all-day, cancelled, or explicitly declined are skipped.
 * Returns null if no candidate has meaningful overlap or its start is >30 min away.
 */
export function matchEvent(
  recStartMs: number,
  recDurationMs: number,
  events: CalendarEvent[],
): CalendarEvent | null {
  const recEndMs = recStartMs + recDurationMs;
  const TOLERANCE_MS = 30 * 60_000;

  const scored = events
    .filter(e => !e.isAllDay && !e.isCancelled)
    .filter(e => e.responseStatus?.response !== 'declined')
    .filter(e => hasOtherAttendees(e))
    .map(e => {
      const evStart = Date.parse(e.start.dateTime.endsWith('Z') ? e.start.dateTime : `${e.start.dateTime}Z`);
      const evEnd = Date.parse(e.end.dateTime.endsWith('Z') ? e.end.dateTime : `${e.end.dateTime}Z`);
      const overlap = Math.max(0, Math.min(recEndMs, evEnd) - Math.max(recStartMs, evStart));
      const startDelta = Math.abs(recStartMs - evStart);
      return { event: e, overlap, startDelta };
    })
    .filter(c => c.overlap > 0 || c.startDelta <= TOLERANCE_MS)
    .sort((a, b) => (b.overlap - a.overlap) || (a.startDelta - b.startDelta));

  return scored[0]?.event ?? null;
}
