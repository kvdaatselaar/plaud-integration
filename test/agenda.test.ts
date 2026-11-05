import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  agendaFromEvents,
  agendaRange,
  appointmentFromEvent,
  collectAgenda,
  describeAgenda,
  localIso,
  writeAgendaFile,
} from '../src/agenda.js';
import type { CalendarEvent } from '../src/calendar.js';

// Synthetic people and meetings only (example.nl / example.com addresses); Anna owns the calendar.
const anna = { address: 'Anna@Example.nl', name: 'Anna Test' };
const bob = { address: 'bob@klant.example.com', name: 'Bob Voorbeeld' };
const cas = { address: 'cas@example.nl' };
const zaal = { address: 'zaal-1.10@example.nl', name: 'Vergaderzaal 1.10' };
const OWNER = 'anna@example.nl';

function event(id: string, startIso: string, endIso: string, extra: Partial<CalendarEvent> = {}): CalendarEvent {
  // As Graph answers with Prefer: outlook.timezone="UTC": no zone designator, seven decimals.
  const graph = (iso: string) => ({ dateTime: iso.replace(/Z$/, '.0000000'), timeZone: 'UTC' });
  return {
    id,
    subject: `Overleg ${id}`,
    start: graph(startIso),
    end: graph(endIso),
    isAllDay: false,
    isOnlineMeeting: true,
    type: 'singleInstance',
    showAs: 'busy',
    organizer: { emailAddress: anna },
    attendees: [
      { emailAddress: anna, type: 'required' },
      { emailAddress: bob, type: 'optional' },
      { emailAddress: zaal, type: 'resource' },
    ],
    ...extra,
  };
}

const range = agendaRange(new Date('2026-03-16T06:00:12Z'));

test('agendaRange: today and tomorrow in Amsterdam time, the window in UTC', () => {
  assert.deepEqual(range, {
    van: '2026-03-16', tot: '2026-03-17', startIso: '2026-03-15T23:00:00.000Z', endIso: '2026-03-17T23:00:00.000Z',
  });
  // 00:30 local time is already the next day
  assert.equal(agendaRange(new Date('2026-03-16T23:30:00Z')).van, '2026-03-17');
  // summer time starts on 29 March 2026: the window ends at 00:00 CEST
  assert.deepEqual(agendaRange(new Date('2026-03-28T12:00:00Z')), {
    van: '2026-03-28', tot: '2026-03-29', startIso: '2026-03-27T23:00:00.000Z', endIso: '2026-03-29T22:00:00.000Z',
  });
  // and ends on 25 October 2026: the window starts at 00:00 CEST and ends at 00:00 CET
  assert.deepEqual(agendaRange(new Date('2026-10-25T12:00:00Z')), {
    van: '2026-10-25', tot: '2026-10-26', startIso: '2026-10-24T22:00:00.000Z', endIso: '2026-10-26T23:00:00.000Z',
  });
  assert.equal(agendaRange(new Date('2026-10-31T10:00:00Z')).tot, '2026-11-01');
});

test('localIso: wall clock with its offset, winter and summer', () => {
  assert.equal(localIso(new Date('2026-03-16T08:00:00Z')), '2026-03-16T09:00:00+01:00');
  assert.equal(localIso(new Date('2026-07-01T08:00:00Z')), '2026-07-01T10:00:00+02:00');
  assert.equal(localIso(new Date('2026-03-16T08:00:00Z'), 'UTC'), '2026-03-16T08:00:00+00:00');
});

test("appointmentFromEvent: the brain's fields; rooms, the owner and the organizer are no invitees", () => {
  const a = appointmentFromEvent(event('a', '2026-03-16T08:00:00Z', '2026-03-16T08:30:00Z', {
    subject: '  Stuurgroep   Zonnebloem ', type: 'occurrence', location: { displayName: ' 2.14 Groot ' },
  }), OWNER, range);
  assert.deepEqual(a, {
    id: 'a',
    datum: '2026-03-16',
    begin: '2026-03-16T09:00:00+01:00',
    eind: '2026-03-16T09:30:00+01:00',
    titel: 'Stuurgroep Zonnebloem',
    organisator: { naam: 'Anna Test', email: 'anna@example.nl' },
    genodigden: [{ naam: 'Bob Voorbeeld', email: 'bob@klant.example.com', optioneel: true }],
    online: true,
    locatie: '2.14 Groot',
    reeks: true,
    hele_dag: false,
  });

  // Someone else organizes: in `organisator`, not again among the invitees; one entry per address;
  // an address without a display name keeps the address as its name.
  const b = appointmentFromEvent(event('b', '2026-03-17T12:00:00Z', '2026-03-17T13:00:00Z', {
    organizer: { emailAddress: bob },
    attendees: [
      { emailAddress: bob, type: 'required' },
      { emailAddress: anna, type: 'required' },
      { emailAddress: cas, type: 'required' },
      { emailAddress: { address: 'CAS@example.nl', name: 'Cas' } },
    ],
    isOnlineMeeting: false,
    type: 'exception',
    location: { displayName: '' },
  }), OWNER, range)!;
  assert.deepEqual(b.organisator, { naam: 'Bob Voorbeeld', email: 'bob@klant.example.com' });
  assert.deepEqual(b.genodigden, [{ naam: 'cas@example.nl', email: 'cas@example.nl', optioneel: false }]);
  assert.equal(b.datum, '2026-03-17');
  assert.equal(b.online, false);
  assert.equal(b.locatie, null);
  assert.equal(b.reeks, true);

  // Empty subject, a whole day, nobody else
  const c = appointmentFromEvent(event('c', '2026-03-16T00:00:00Z', '2026-03-17T00:00:00Z', {
    subject: '', isAllDay: true, organizer: undefined, attendees: [],
  }), OWNER, range)!;
  assert.equal(c.titel, '(geen titel)');
  assert.equal(c.hele_dag, true);
  assert.equal(c.datum, '2026-03-16');
  assert.equal(c.organisator, null);
  assert.deepEqual(c.genodigden, []);

  const long = appointmentFromEvent(event('d', '2026-03-16T08:00:00Z', '2026-03-16T09:00:00Z', { subject: 'x'.repeat(250) }), OWNER, range)!;
  assert.equal(long.titel.length, 200);
});

test('appointmentFromEvent: cancelled, declined, free and outside the window are left out', () => {
  const at = (extra: Partial<CalendarEvent>) =>
    appointmentFromEvent(event('x', '2026-03-16T08:00:00Z', '2026-03-16T09:00:00Z', extra), OWNER, range);
  assert.equal(at({ isCancelled: true }), null);
  assert.equal(at({ responseStatus: { response: 'declined' } }), null);
  assert.equal(at({ showAs: 'free' }), null);
  assert.notEqual(at({ showAs: 'tentative', responseStatus: { response: 'notResponded' } }), null);
  // 23:30 yesterday and 00:00 the day after tomorrow, local time
  assert.equal(appointmentFromEvent(event('y', '2026-03-15T22:30:00Z', '2026-03-15T23:30:00Z'), OWNER, range), null);
  assert.equal(appointmentFromEvent(event('z', '2026-03-17T23:00:00Z', '2026-03-18T00:00:00Z'), OWNER, range), null);
  assert.equal(appointmentFromEvent(event('w', 'nope', 'nope'), OWNER, range), null);
});

test('agendaFromEvents: sorted by start, one per id, header and counts', () => {
  const now = new Date('2026-03-16T06:00:12Z');
  const events = [
    event('later', '2026-03-16T13:00:00Z', '2026-03-16T14:00:00Z'),
    event('eerst', '2026-03-16T08:00:00Z', '2026-03-16T08:30:00Z'),
    event('eerst', '2026-03-16T08:00:00Z', '2026-03-16T08:30:00Z'),
    event('alleen', '2026-03-17T09:00:00Z', '2026-03-17T10:00:00Z', { attendees: [] }),
    event('weg', '2026-03-16T10:00:00Z', '2026-03-16T11:00:00Z', { isCancelled: true }),
    event('vrij', '2026-03-16T00:00:00Z', '2026-03-17T00:00:00Z', { isAllDay: true, showAs: 'free' }),
    event('thuis', '2026-03-17T00:00:00Z', '2026-03-18T00:00:00Z', { isAllDay: true, attendees: [] }),
  ];
  const { file, counts } = agendaFromEvents(events, 'Anna@Example.nl ', range, now);
  // the whole day of tomorrow starts at 00:00, before tomorrow's meeting
  assert.deepEqual(file.afspraken.map(a => a.id), ['eerst', 'later', 'thuis', 'alleen']);
  assert.deepEqual({ ...file, afspraken: undefined }, {
    bijgewerkt: '2026-03-16T06:00:12.000Z', eigenaar: 'anna@example.nl', van: '2026-03-16', tot: '2026-03-17', afspraken: undefined,
  });
  assert.deepEqual(counts, { vandaag: 2, morgen: 2, metAnderen: 2, heleDag: 1, overgeslagen: 2 });
  assert.equal(describeAgenda(file, counts), '4 afspraken voor vandaag en morgen (2 vandaag, 2 morgen; 2 met anderen, 1 hele dag, 2 overgeslagen)');
  assert.ok(!JSON.stringify(file).includes('zaal-1.10'));
  assert.equal(describeAgenda({ ...file, afspraken: [file.afspraken[0]] }, counts).slice(0, 10), '1 afspraak');
});

test('collectAgenda: owner from /me (mail, else the sign-in name), window handed to the calendar', async () => {
  const calls: string[][] = [];
  const calendar = {
    async getAllEventsInRange(s: string, e: string) {
      calls.push([s, e]);
      return [event('a', '2026-03-16T08:00:00Z', '2026-03-16T09:00:00Z')];
    },
  };
  const r = await collectAgenda(calendar, async () => ({ mail: null, userPrincipalName: 'Anna@Example.nl' }), new Date('2026-03-16T06:00:12Z'));
  assert.equal(r.file.eigenaar, 'anna@example.nl');
  assert.deepEqual(calls, [['2026-03-15T23:00:00.000Z', '2026-03-17T23:00:00.000Z']]);
  assert.deepEqual(r.file.afspraken[0].genodigden.map(g => g.email), ['bob@klant.example.com']);
  await assert.rejects(collectAgenda(calendar, async () => null, new Date()), /eigenaar onbekend/);
});

test('writeAgendaFile writes readable JSON and leaves no temp file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brein-'));
  const file = path.join(dir, '_brein', 'agenda.json');
  const content = { bijgewerkt: '2026-03-16T06:00:12.000Z', eigenaar: 'anna@example.nl', van: '2026-03-16', tot: '2026-03-17', afspraken: [] };
  writeAgendaFile(file, content);
  assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf-8')), content);
  assert.deepEqual(fs.readdirSync(path.dirname(file)), ['agenda.json']);
});
