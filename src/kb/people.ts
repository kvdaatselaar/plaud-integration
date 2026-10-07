import type { SourceTranscript } from './sources.js';

const GRAPH = 'https://graph.microsoft.com/v1.0';

export interface Attendee {
  name: string;
  address: string;
}

export interface CalendarPeople {
  me: { name: string; address: string; domain: string };
  /** Per conversation (relPath): attendees of the calendar meeting it was recorded in. */
  attendeesBy: Map<string, Attendee[]>;
}

async function graph<T>(token: string, url: string): Promise<T> {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Prefer: 'outlook.timezone="UTC"' } });
  if (!res.ok) throw new Error(`Graph ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json() as Promise<T>;
}

const ms = (dt: string) => Date.parse(dt.endsWith('Z') ? dt : `${dt}Z`);

/** Links each recording to the calendar meeting it overlaps most, and returns that meeting's attendees. */
export async function calendarPeople(token: string, sources: SourceTranscript[]): Promise<CalendarPeople> {
  const me = await graph<{ displayName: string; mail?: string; userPrincipalName: string }>(token, `${GRAPH}/me?$select=displayName,mail,userPrincipalName`);
  const address = (me.mail ?? me.userPrincipalName).toLowerCase();
  const attendeesBy = new Map<string, Attendee[]>();
  if (sources.length === 0) return { me: { name: me.displayName, address, domain: address.split('@')[1] }, attendeesBy };

  const from = Math.min(...sources.map(s => s.startMs)) - 864e5;
  const to = Math.max(...sources.map(s => s.startMs)) + 2 * 864e5;
  const events: { startMs: number; endMs: number; attendees: Attendee[] }[] = [];
  let next: string | undefined = `${GRAPH}/me/calendarView?${new URLSearchParams({
    startDateTime: new Date(from).toISOString(),
    endDateTime: new Date(to).toISOString(),
    $select: 'start,end,attendees,organizer,isCancelled',
    $top: '250',
  })}`;
  while (next) {
    const page: { value: any[]; '@odata.nextLink'?: string } = await graph(token, next);
    for (const e of page.value) {
      if (e.isCancelled) continue;
      const people = [...(e.attendees ?? []).filter((a: any) => a.type !== 'resource'), { emailAddress: e.organizer?.emailAddress }]
        .map((a: any) => ({ name: String(a.emailAddress?.name ?? '').trim(), address: String(a.emailAddress?.address ?? '').toLowerCase() }))
        .filter(a => a.name && a.address.includes('@'));
      events.push({ startMs: ms(e.start.dateTime), endMs: ms(e.end.dateTime), attendees: [...new Map(people.map(p => [p.address, p])).values()] });
    }
    next = page['@odata.nextLink'];
  }

  for (const s of sources) {
    const end = s.startMs + s.durationMin * 60_000;
    const best = events
      .map(e => ({ e, overlap: Math.min(end, e.endMs) - Math.max(s.startMs, e.startMs) }))
      .filter(x => x.overlap > 5 * 60_000 && x.e.attendees.length > 0)
      .sort((a, b) => b.overlap - a.overlap)[0];
    if (best) attendeesBy.set(s.relPath, best.e.attendees);
  }
  return { me: { name: me.displayName, address, domain: address.split('@')[1] }, attendeesBy };
}
