const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';

export class GraphError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

export interface TeamsMeetingCandidate {
  eventId: string;
  subject: string;
  joinUrl: string;
  threadId?: string;
  startMs: number;
  endMs: number;
  isOrganizer: boolean;
  organizerEmail?: string;
}

export interface OnlineMeeting {
  id: string;
  subject?: string;
  joinWebUrl: string;
  chatInfo?: { threadId?: string };
}

export interface MeetingTranscript {
  id: string;
  meetingId: string;
  createdDateTime?: string;
  endDateTime?: string;
}

/** "19:meeting_…@thread.v2" — the stable key that links calendar events, meetings and transcripts. */
export function threadIdFromJoinUrl(joinUrl: string): string | undefined {
  let s = joinUrl;
  try { s = decodeURIComponent(decodeURIComponent(joinUrl)); } catch { /* keep raw */ }
  return s.match(/19:meeting_[^@/]+@thread\.v2/)?.[0];
}

/** onlineMeeting ids are base64 of "1*{organizerOid}*0**{threadId}" — used as a fallback only. */
export function threadIdFromMeetingId(meetingId: string): string | undefined {
  try {
    return Buffer.from(meetingId, 'base64').toString('utf-8').match(/19:meeting_[^@*]+@thread\.v2/)?.[0];
  } catch {
    return undefined;
  }
}

function parseGraphDate(dt: string): number {
  return Date.parse(dt.endsWith('Z') ? dt : `${dt}Z`);
}

function isoNoMillis(ms: number): string {
  return new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export class Teams {
  constructor(private token: string) {}

  private async request(url: string, accept = 'application/json'): Promise<Response> {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${this.token}`, Accept: accept, Prefer: 'outlook.timezone="UTC"' },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      let code = String(res.status);
      let message = body.slice(0, 200);
      try {
        const j = JSON.parse(body);
        code = j.error?.code ?? code;
        message = j.error?.message ?? message;
      } catch { /* non-JSON error body */ }
      throw new GraphError(res.status, code, `Graph ${res.status} ${code}: ${message}`);
    }
    return res;
  }

  private async getAllPages<T>(url: string): Promise<T[]> {
    const out: T[] = [];
    let next: string | undefined = url;
    while (next) {
      const j = await (await this.request(next)).json() as { value?: T[]; '@odata.nextLink'?: string };
      out.push(...(j.value ?? []));
      next = j['@odata.nextLink'];
    }
    return out;
  }

  async getMyId(): Promise<string> {
    const j = await (await this.request(`${GRAPH_BASE}/me?$select=id`)).json() as { id: string };
    return j.id;
  }

  /** Online-meeting occurrences from the calendar — used for titles and attendee-meeting discovery. */
  async listMeetingsFromCalendar(sinceMs: number, untilMs: number): Promise<TeamsMeetingCandidate[]> {
    const qs = new URLSearchParams({
      startDateTime: new Date(sinceMs).toISOString(),
      endDateTime: new Date(untilMs).toISOString(),
      $select: 'id,subject,start,end,isOnlineMeeting,onlineMeeting,organizer,isOrganizer,isCancelled',
      $top: '250',
    });
    const events = await this.getAllPages<any>(`${GRAPH_BASE}/me/calendarView?${qs}`);
    const out: TeamsMeetingCandidate[] = [];
    for (const e of events) {
      const joinUrl = e.onlineMeeting?.joinUrl;
      if (!e.isOnlineMeeting || e.isCancelled || !joinUrl) continue;
      out.push({
        eventId: e.id,
        subject: e.subject ?? '(zonder titel)',
        joinUrl,
        threadId: threadIdFromJoinUrl(joinUrl),
        startMs: parseGraphDate(e.start.dateTime),
        endMs: parseGraphDate(e.end.dateTime),
        isOrganizer: e.isOrganizer === true,
        organizerEmail: e.organizer?.emailAddress?.address,
      });
    }
    return out;
  }

  /** Resolve a join URL to its onlineMeeting. Works for meetings the user organized or attended directly. */
  async resolveMeeting(joinUrl: string): Promise<OnlineMeeting | null> {
    const escaped = joinUrl.replace(/'/g, "''");
    const url = `${GRAPH_BASE}/me/onlineMeetings?$filter=JoinWebUrl%20eq%20'${encodeURIComponent(escaped)}'`;
    const j = await (await this.request(url)).json() as { value: OnlineMeeting[] };
    return j.value[0] ?? null;
  }

  async getMeeting(meetingId: string): Promise<OnlineMeeting> {
    return await (await this.request(`${GRAPH_BASE}/me/onlineMeetings/${meetingId}`)).json() as OnlineMeeting;
  }

  /**
   * Every transcript of every meeting the user organized in the window, including
   * series exceptions that can't be resolved through their join URL.
   */
  async listOrganizerTranscripts(myId: string, sinceMs: number, untilMs: number): Promise<MeetingTranscript[]> {
    const fn = `getAllTranscripts(meetingOrganizerUserId='${myId}',startDateTime=${isoNoMillis(sinceMs)},endDateTime=${isoNoMillis(untilMs)})`;
    return this.getAllPages<MeetingTranscript>(`${GRAPH_BASE}/me/onlineMeetings/${fn}`);
  }

  /** All transcripts of one meeting. For a recurring series this spans every occurrence. */
  async listTranscripts(meetingId: string): Promise<MeetingTranscript[]> {
    return this.getAllPages<MeetingTranscript>(`${GRAPH_BASE}/me/onlineMeetings/${meetingId}/transcripts`);
  }

  /** Accepts current and older transcript ids; the response carries the canonical id. */
  async getTranscript(meetingId: string, transcriptId: string): Promise<MeetingTranscript> {
    return await (await this.request(`${GRAPH_BASE}/me/onlineMeetings/${meetingId}/transcripts/${transcriptId}`)).json() as MeetingTranscript;
  }

  async getTranscriptVtt(meetingId: string, transcriptId: string): Promise<string> {
    const url = `${GRAPH_BASE}/me/onlineMeetings/${meetingId}/transcripts/${transcriptId}/content?$format=text/vtt`;
    return (await this.request(url, 'text/vtt')).text();
  }
}
