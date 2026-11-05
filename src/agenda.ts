import * as fs from 'node:fs';
import * as path from 'node:path';
import type { CalendarEvent } from './calendar.js';
import type { GraphGet } from './colleagues.js';

// Today's and tomorrow's appointments for the personal brain, which prepares each of them in the
// morning: <brein dir>/agenda.json, written by every sync run. The brain keeps only its
// preparation; the agenda itself is not stored there.

export const TIMEZONE = 'Europe/Amsterdam';
const TITLE_MAX = 200;

export interface AgendaPerson {
  naam: string;
  email: string;
}

export interface AgendaInvitee extends AgendaPerson {
  optioneel: boolean;
}

export interface AgendaAppointment {
  id: string;
  datum: string;
  begin: string;
  eind: string;
  titel: string;
  organisator: AgendaPerson | null;
  genodigden: AgendaInvitee[];
  online: boolean;
  locatie: string | null;
  reeks: boolean;
  hele_dag: boolean;
}

export interface AgendaFile {
  bijgewerkt: string;
  eigenaar: string;
  van: string;
  tot: string;
  afspraken: AgendaAppointment[];
}

export interface AgendaRange {
  van: string;
  tot: string;
  startIso: string;
  endIso: string;
}

export interface AgendaCounts {
  vandaag: number;
  morgen: number;
  metAnderen: number;
  heleDag: number;
  overgeslagen: number;
}

// ── Local time without a library: Intl gives the wall clock in the zone ──────────────────────

interface WallClock {
  y: number;
  m: number;
  d: number;
  h: number;
  mi: number;
  s: number;
}

function wallClock(at: Date, tz: string): WallClock {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(at);
  const n = (type: string) => Number(parts.find(p => p.type === type)?.value);
  return { y: n('year'), m: n('month'), d: n('day'), h: n('hour'), mi: n('minute'), s: n('second') };
}

/** Offset of the zone at `at`, in minutes east of UTC: 60 for CET, 120 for CEST. */
function offsetMinutes(at: Date, tz: string): number {
  const w = wallClock(at, tz);
  return Math.round((Date.UTC(w.y, w.m - 1, w.d, w.h, w.mi, w.s) - at.getTime()) / 60_000);
}

const pad = (n: number, width = 2) => String(n).padStart(width, '0');
const dateString = (y: number, m: number, d: number) => `${pad(y, 4)}-${pad(m)}-${pad(d)}`;

/** The local calendar date (YYYY-MM-DD) of an instant. */
export function localDate(at: Date, tz = TIMEZONE): string {
  const w = wallClock(at, tz);
  return dateString(w.y, w.m, w.d);
}

/** The instant as local wall clock with its offset, ISO 8601: 2026-11-04T09:00:00+01:00. */
export function localIso(at: Date, tz = TIMEZONE): string {
  const w = wallClock(at, tz);
  const off = offsetMinutes(at, tz);
  const abs = Math.abs(off);
  return `${dateString(w.y, w.m, w.d)}T${pad(w.h)}:${pad(w.mi)}:${pad(w.s)}${off < 0 ? '-' : '+'}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

/** Midnight at the start of the local date (y, m, d) as an instant; d may run past the month. */
function localMidnight(y: number, m: number, d: number, tz: string): Date {
  const guess = Date.UTC(y, m - 1, d);
  let at = new Date(guess - offsetMinutes(new Date(guess), tz) * 60_000);
  // Around a summer-time switch the offset at the guess differs from the one at midnight itself.
  const again = guess - offsetMinutes(at, tz) * 60_000;
  if (again !== at.getTime()) at = new Date(again);
  return at;
}

/**
 * Today and tomorrow as local dates, and the window for calendarView: local midnight today up to
 * local midnight the day after tomorrow, both in UTC.
 */
export function agendaRange(now: Date, tz = TIMEZONE): AgendaRange {
  const w = wallClock(now, tz);
  return {
    van: dateString(w.y, w.m, w.d),
    tot: new Date(Date.UTC(w.y, w.m - 1, w.d + 1)).toISOString().slice(0, 10),
    startIso: localMidnight(w.y, w.m, w.d, tz).toISOString(),
    endIso: localMidnight(w.y, w.m, w.d + 2, tz).toISOString(),
  };
}

// ── From Graph events to the file ───────────────────────────────────────────────────────────

/** Graph's dateTime (no zone designator, seven decimals) as an instant; UTC, as the calendar asks with Prefer. */
function instant(v: { dateTime: string; timeZone?: string } | undefined): Date | null {
  const s = v?.dateTime?.trim();
  if (!s) return null;
  const ms = Date.parse(/(?:[zZ]|[+-]\d\d:\d\d)$/.test(s) ? s : `${s.replace(/(\.\d{3})\d+$/, '$1')}Z`);
  return Number.isNaN(ms) ? null : new Date(ms);
}

function person(e?: { address?: string; name?: string }): AgendaPerson | null {
  const email = e?.address?.trim().toLowerCase();
  if (!email || !email.includes('@')) return null;
  return { naam: e?.name?.trim() || email, email };
}

function title(subject: string | undefined): string {
  const t = (subject ?? '').replace(/\s+/g, ' ').trim();
  if (!t) return '(geen titel)';
  return t.length > TITLE_MAX ? t.slice(0, TITLE_MAX).trimEnd() : t;
}

/**
 * One event as the brain reads it, or null when it does not belong in the file: cancelled,
 * declined, shown as free (focus blocks), or starting outside the window. The invitees are the
 * attendees without rooms, the owner and the organizer (who has a field of their own).
 */
export function appointmentFromEvent(e: CalendarEvent, owner: string, range: Pick<AgendaRange, 'van' | 'tot'>, tz = TIMEZONE): AgendaAppointment | null {
  if (e.isCancelled || e.responseStatus?.response === 'declined' || e.showAs === 'free') return null;
  const begin = instant(e.start);
  const eind = instant(e.end);
  if (!begin || !eind) return null;
  const datum = localDate(begin, tz);
  if (datum < range.van || datum > range.tot) return null;

  const organisator = person(e.organizer?.emailAddress);
  const seen = new Set<string>([owner.trim().toLowerCase(), ...(organisator ? [organisator.email] : [])]);
  const genodigden: AgendaInvitee[] = [];
  for (const a of e.attendees ?? []) {
    if (a.type === 'resource') continue;
    const p = person(a.emailAddress);
    if (!p || seen.has(p.email)) continue;
    seen.add(p.email);
    genodigden.push({ ...p, optioneel: a.type === 'optional' });
  }
  return {
    id: e.id,
    datum,
    begin: localIso(begin, tz),
    eind: localIso(eind, tz),
    titel: title(e.subject),
    organisator,
    genodigden,
    online: !!e.isOnlineMeeting,
    locatie: e.location?.displayName?.trim() || null,
    reeks: e.type === 'occurrence' || e.type === 'exception',
    hele_dag: !!e.isAllDay,
  };
}

/** The file for the window, sorted by start, one appointment per event id; deterministic and offline. */
export function agendaFromEvents(events: CalendarEvent[], owner: string, range: AgendaRange, now: Date, tz = TIMEZONE): { file: AgendaFile; counts: AgendaCounts } {
  const eigenaar = owner.trim().toLowerCase();
  const seen = new Set<string>();
  const afspraken: AgendaAppointment[] = [];
  let overgeslagen = 0;
  for (const e of events) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    const a = appointmentFromEvent(e, eigenaar, range, tz);
    if (a) afspraken.push(a);
    else overgeslagen++;
  }
  afspraken.sort((a, b) => Date.parse(a.begin) - Date.parse(b.begin) || a.titel.localeCompare(b.titel, 'nl'));
  const counts: AgendaCounts = {
    vandaag: afspraken.filter(a => a.datum === range.van).length,
    morgen: afspraken.filter(a => a.datum === range.tot).length,
    metAnderen: afspraken.filter(a => a.genodigden.length > 0 || (a.organisator !== null && a.organisator.email !== eigenaar)).length,
    heleDag: afspraken.filter(a => a.hele_dag).length,
    overgeslagen,
  };
  return { file: { bijgewerkt: now.toISOString(), eigenaar, van: range.van, tot: range.tot, afspraken }, counts };
}

/** Written next to the file first, then moved over it, so the brain never reads half a file. */
export function writeAgendaFile(file: string, content: AgendaFile): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(content, null, 2)}\n`);
  fs.renameSync(tmp, file);
}

// ── The step itself, shared by the daily sync and `npm run agenda` ───────────────────────────

export interface AgendaSource {
  getAllEventsInRange(startIso: string, endIso: string): Promise<CalendarEvent[]>;
}

/** The owner's address: the mailbox, or the sign-in name when Entra has no mail attribute. */
export async function ownerAddress(get: GraphGet): Promise<string> {
  const me = await get('/me?$select=mail,userPrincipalName');
  const address = String(me?.mail || me?.userPrincipalName || '').trim().toLowerCase();
  if (!address) throw new Error('eigenaar onbekend: /me geeft geen mail of userPrincipalName');
  return address;
}

export async function collectAgenda(calendar: AgendaSource, get: GraphGet, now = new Date(), tz = TIMEZONE): Promise<{ file: AgendaFile; counts: AgendaCounts }> {
  const owner = await ownerAddress(get);
  const range = agendaRange(now, tz);
  const events = await calendar.getAllEventsInRange(range.startIso, range.endIso);
  return agendaFromEvents(events, owner, range, now, tz);
}

/** One line for the log and the dry run: counts only, never titles or names. */
export function describeAgenda(file: AgendaFile, counts: AgendaCounts): string {
  const n = file.afspraken.length;
  return `${n} ${n === 1 ? 'afspraak' : 'afspraken'} voor vandaag en morgen (${counts.vandaag} vandaag, ${counts.morgen} morgen; `
    + `${counts.metAnderen} met anderen, ${counts.heleDag} hele dag, ${counts.overgeslagen} overgeslagen)`;
}
