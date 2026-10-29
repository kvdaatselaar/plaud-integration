import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { isInternal, participantsFromEvent, participantsYaml, setParticipants } from '../src/participants.js';
import { archivedMeeting, backfillParticipants, ParticipantResolver } from '../src/participants-backfill.js';
import { buildTeamsTranscriptMarkdown } from '../src/transcripts.js';
import type { CalendarEvent } from '../src/calendar.js';

// Synthetic people and meetings only (example.com / example.nl addresses).
const anna = { address: 'Anna@Example.nl', name: 'Anna Test' };
const bob = { address: 'bob@klant.example.com', name: 'Bob Voorbeeld' };
const zaal = { address: 'zaal-1.10@example.nl', name: 'Vergaderzaal 1.10' };

function event(id: string, startIso: string, endIso: string, extra: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id,
    subject: `Overleg ${id}`,
    start: { dateTime: startIso.replace(/Z$/, ''), timeZone: 'UTC' },
    end: { dateTime: endIso.replace(/Z$/, ''), timeZone: 'UTC' },
    isAllDay: false,
    organizer: { emailAddress: anna },
    attendees: [
      { emailAddress: anna, type: 'required' },
      { emailAddress: bob, type: 'optional' },
      { emailAddress: zaal, type: 'resource' },
    ],
    ...extra,
  };
}

test('participantsFromEvent: organizer first, no rooms, one entry per address', () => {
  assert.deepEqual(participantsFromEvent(event('a', '2026-01-05T09:00:00Z', '2026-01-05T10:00:00Z')), [
    { naam: 'Anna Test', email: 'anna@example.nl' },
    { naam: 'Bob Voorbeeld', email: 'bob@klant.example.com' },
  ]);
  assert.deepEqual(participantsFromEvent({ attendees: [{ emailAddress: { address: 'c@example.nl' } }] }), [
    { naam: 'c@example.nl', email: 'c@example.nl' },
  ]);
});

test('participantsYaml is valid YAML that reads back as the list', () => {
  const list = [{ naam: 'Anna "A" Test: één', email: 'anna@example.nl' }];
  const fm = parseYaml(['title: "x"', ...participantsYaml(list)].join('\n'));
  assert.deepEqual(fm.deelnemers, list);
  assert.deepEqual(participantsYaml([]), []);
});

test('isInternal matches the domain and its subdomains only', () => {
  assert.equal(isInternal('anna@example.nl', ['example.nl']), true);
  assert.equal(isInternal('a@team.example.nl', ['example.nl']), true);
  assert.equal(isInternal('bob@notexample.nl', ['example.nl']), false);
});

const TRANSCRIPT = '[0:01] Anna Test: alfa\n\n[0:05] Bob Voorbeeld: bravo';
const teamsMd = buildTeamsTranscriptMarkdown(
  { onlineMeetingId: 'meeting-1', transcriptId: 't-1', startMs: Date.parse('2026-01-05T09:00:00Z'), endMs: Date.parse('2026-01-05T10:00:00Z') },
  '2026-01-05 09:00 Overleg',
  TRANSCRIPT,
);

test('setParticipants changes only the frontmatter, and replaces an earlier field', () => {
  const list = [{ naam: 'Anna Test', email: 'anna@example.nl' }];
  const once = setParticipants(teamsMd, list)!;
  assert.equal(once.slice(once.indexOf('\n---\n\n')), teamsMd.slice(teamsMd.indexOf('\n---\n\n')));
  assert.equal(once.replace(/deelnemers:\n(?: {2}.*\n)+/, ''), teamsMd);
  const fm = parseYaml(once.split('---\n')[1]);
  assert.deepEqual(fm.deelnemers, list);
  assert.equal(fm.source, 'teams');

  const twice = setParticipants(once, [{ naam: 'Bob Voorbeeld', email: 'bob@klant.example.com' }])!;
  assert.deepEqual(parseYaml(twice.split('---\n')[1]).deelnemers, [{ naam: 'Bob Voorbeeld', email: 'bob@klant.example.com' }]);
  assert.equal(setParticipants(twice, parseYaml(twice.split('---\n')[1]).deelnemers), twice);
  assert.equal(setParticipants('geen frontmatter', list), null);
});

test('new transcripts carry the participants in their frontmatter', () => {
  const md = buildTeamsTranscriptMarkdown(
    { onlineMeetingId: 'm', transcriptId: 't', startMs: 0, endMs: 60_000 },
    'Titel',
    TRANSCRIPT,
    [{ naam: 'Anna Test', email: 'anna@example.nl' }],
  );
  assert.deepEqual(parseYaml(md.split('---\n')[1]).deelnemers, [{ naam: 'Anna Test', email: 'anna@example.nl' }]);
  assert.equal(parseYaml(teamsMd.split('---\n')[1]).deelnemers, undefined);
});

test('backfillParticipants: Plaud by time, Teams by meeting thread, unmatched left alone', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'participants-'));
  const plaud = (date: string, time: string) => [
    '---', `title: "${date} ${time} Opname"`, `date: ${date}`, `time: "${time}"`, 'duration_min: 50',
    'plaud_id: p1', 'source: plaud', '---', '', '# Opname', '', '## Transcript', '', TRANSCRIPT, '',
  ].join('\n');
  fs.writeFileSync(path.join(dir, 'plaud.md'), plaud('2026-01-06', '13:02'));
  fs.writeFileSync(path.join(dir, 'plaud-los.md'), plaud('2026-01-07', '20:00'));
  fs.writeFileSync(path.join(dir, 'teams.md'), teamsMd);

  const thread = '19:meeting_abc@thread.v2';
  const events = [
    event('plaud', '2026-01-06T13:00:00Z', '2026-01-06T14:00:00Z'),
    event('teams', '2026-01-05T09:00:00Z', '2026-01-05T10:00:00Z', {
      organizer: { emailAddress: bob },
      onlineMeeting: { joinUrl: `https://teams.example.com/l/meetup-join/${encodeURIComponent(thread)}/0` },
    }),
  ];
  const resolver = new ParticipantResolver(events, async id => (id === 'meeting-1' ? thread : undefined));
  assert.deepEqual(archivedMeeting(teamsMd), { source: 'teams', startMs: Date.parse('2026-01-05T09:00:00Z'), durationMs: 3_600_000, onlineMeetingId: 'meeting-1' });

  const before = Object.fromEntries(fs.readdirSync(dir).map(f => [f, fs.readFileSync(path.join(dir, f), 'utf-8')]));
  const dry = await backfillParticipants({ dir, resolver, internalDomains: ['example.nl'] });
  assert.deepEqual(dry, {
    files: 3, withParticipants: 2, changed: 2,
    entriesInternal: 2, entriesExternal: 2, addressesInternal: 1, addressesExternal: 1,
  });
  for (const [f, content] of Object.entries(before)) assert.equal(fs.readFileSync(path.join(dir, f), 'utf-8'), content);

  await backfillParticipants({ dir, resolver, internalDomains: ['example.nl'], apply: true });
  const fmOf = (f: string) => parseYaml(fs.readFileSync(path.join(dir, f), 'utf-8').split('---\n')[1]);
  assert.deepEqual(fmOf('plaud.md').deelnemers.map((p: { email: string }) => p.email), ['anna@example.nl', 'bob@klant.example.com']);
  assert.deepEqual(fmOf('teams.md').deelnemers.map((p: { email: string }) => p.email), ['bob@klant.example.com', 'anna@example.nl']);
  assert.equal(fs.readFileSync(path.join(dir, 'plaud-los.md'), 'utf-8'), before['plaud-los.md']);
  for (const f of ['plaud.md', 'teams.md']) {
    const after = fs.readFileSync(path.join(dir, f), 'utf-8');
    assert.equal(after.slice(after.indexOf('\n---\n\n')), before[f].slice(before[f].indexOf('\n---\n\n')));
  }
  assert.equal((await backfillParticipants({ dir, resolver, internalDomains: ['example.nl'] })).changed, 0);
});
