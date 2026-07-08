const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';
const GRAPH_BETA = 'https://graph.microsoft.com/beta';

export interface TeamsMeetingCandidate {
  eventId: string;
  subject: string;
  joinUrl: string;
  startMs: number;
  endMs: number;
  organizerEmail?: string;
}

export interface OnlineMeeting {
  id: string;
  subject?: string;
  joinWebUrl: string;
  startDateTime?: string;
  endDateTime?: string;
}

export interface MeetingTranscript {
  id: string;
  meetingId: string;
  createdDateTime?: string;
}

async function graphJson<T>(token: string, url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Graph ${res.status} ${res.statusText} ${url}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export class Teams {
  constructor(private token: string) {}

  /**
   * Recent online meetings from the calendar. We rely on calendarView to find
   * online meetings because /me/onlineMeetings itself can't be listed without
   * an ID; joinUrl is the anchor for later lookup.
   */
  async listMeetingsFromCalendar(sinceMs: number, untilMs: number): Promise<TeamsMeetingCandidate[]> {
    const qs = new URLSearchParams({
      startDateTime: new Date(sinceMs).toISOString(),
      endDateTime: new Date(untilMs).toISOString(),
      $select: 'id,subject,start,end,isOnlineMeeting,onlineMeeting,organizer,isCancelled',
      $top: '250',
    });
    const data = await graphJson<{ value: any[] }>(
      this.token,
      `${GRAPH_BASE}/me/calendarView?${qs}`,
    );
    const out: TeamsMeetingCandidate[] = [];
    for (const e of data.value ?? []) {
      if (!e.isOnlineMeeting || e.isCancelled) continue;
      const joinUrl = e.onlineMeeting?.joinUrl;
      if (!joinUrl) continue;
      const startMs = Date.parse((e.start.dateTime as string).endsWith('Z') ? e.start.dateTime : `${e.start.dateTime}Z`);
      const endMs = Date.parse((e.end.dateTime as string).endsWith('Z') ? e.end.dateTime : `${e.end.dateTime}Z`);
      out.push({
        eventId: e.id,
        subject: e.subject ?? '(zonder titel)',
        joinUrl,
        startMs,
        endMs,
        organizerEmail: e.organizer?.emailAddress?.address,
      });
    }
    return out;
  }

  /**
   * Resolve a joinWebUrl to the onlineMeeting object (needed for its `id`,
   * which transcripts hang off of). Graph requires the URL as-is; the filter
   * comparison is exact.
   */
  async resolveMeeting(joinUrl: string): Promise<OnlineMeeting | null> {
    // $filter with a URL containing '&' etc requires proper escaping via single-quote wrapping.
    const escaped = joinUrl.replace(/'/g, "''");
    const url = `${GRAPH_BASE}/me/onlineMeetings?$filter=JoinWebUrl%20eq%20'${encodeURIComponent(escaped)}'`;
    const data = await graphJson<{ value: OnlineMeeting[] }>(this.token, url);
    return data.value[0] ?? null;
  }

  async listTranscripts(meetingId: string): Promise<MeetingTranscript[]> {
    // Transcripts are still under /beta as of writing; fall back to v1.0 if beta 404s.
    const url = `${GRAPH_BETA}/me/onlineMeetings/${meetingId}/transcripts`;
    try {
      const data = await graphJson<{ value: MeetingTranscript[] }>(this.token, url);
      return data.value ?? [];
    } catch (err) {
      if (String(err).includes('404')) {
        const v1 = `${GRAPH_BASE}/me/onlineMeetings/${meetingId}/transcripts`;
        const data = await graphJson<{ value: MeetingTranscript[] }>(this.token, v1);
        return data.value ?? [];
      }
      throw err;
    }
  }

  async getTranscriptVtt(meetingId: string, transcriptId: string): Promise<string> {
    const url = `${GRAPH_BETA}/me/onlineMeetings/${meetingId}/transcripts/${transcriptId}/content?$format=text/vtt`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'text/vtt',
      },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Graph ${res.status} ${res.statusText} transcript content: ${body.slice(0, 200)}`);
    }
    return res.text();
  }
}
