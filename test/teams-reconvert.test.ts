import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { reconvertTeamsArchive } from '../src/teams-reconvert.js';

// Synthetic fixtures only: no real transcripts.
function teamsMd(meetingId: string, transcriptId: string, transcript: string): string {
  return [
    '---',
    'title: "2026-01-05 09:00 Testoverleg"',
    'date: 2026-01-05',
    'time: "09:00"',
    'duration_min: 30',
    `online_meeting_id: ${meetingId}`,
    `transcript_id: ${transcriptId}`,
    'source: teams',
    '---',
    '',
    '# 2026-01-05 09:00 Testoverleg',
    '',
    '- **Datum:** 2026-01-05 09:00',
    '- **Duur:** 30 min',
    '',
    '## Transcript',
    '',
    transcript,
    '',
  ].join('\n');
}

const ROOM_VTT = [
  'WEBVTT', '',
  '00:00:01.000 --> 00:00:04.000', '<v 1.10 Vergaderzaal>Vraag uit de zaal.</v>', '',
  '00:00:05.000 --> 00:00:08.000', '<v 1.10 Vergaderzaal>Antwoord uit de zaal.</v>', '',
  '00:00:09.000 --> 00:00:12.000', '<v 1.10 Vergaderzaal>Afsluiting.</v>', '',
].join('\n');
const MERGED = '[0:01] 1.10 Vergaderzaal: Vraag uit de zaal. Antwoord uit de zaal. Afsluiting.';

test('reconvertTeamsArchive rewrites only the transcript section and skips what Graph no longer has', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'teams-reconvert-'));
  fs.mkdirSync(path.join(dir, 'Week 2'));
  const room = path.join(dir, 'Week 2', 'room.md');
  const gone = path.join(dir, 'Week 2', 'gone.md');
  const plaud = path.join(dir, 'Week 2', 'plaud.md');
  fs.writeFileSync(room, teamsMd('m1', 't1', MERGED));
  fs.writeFileSync(gone, teamsMd('m2', 't2', MERGED));
  fs.writeFileSync(plaud, '---\nsource: plaud\n---\n\n## Transcript\n\n[0:01] Speaker 1: x\n');

  const fetchVtt = async (meetingId: string) => {
    if (meetingId === 'm2') throw new Error('Graph 404 NotFound');
    return ROOM_VTT;
  };

  const dry = await reconvertTeamsArchive({ dir, fetchVtt });
  assert.deepEqual(dry, {
    files: 2, fetched: 1, unavailable: 1, changed: 1,
    utterancesBefore: 1, utterancesAfter: 3, singleBlockBefore: 1, singleBlockAfter: 0,
  });
  assert.equal(fs.readFileSync(room, 'utf-8'), teamsMd('m1', 't1', MERGED));

  const applied = await reconvertTeamsArchive({ dir, fetchVtt, apply: true });
  assert.equal(applied.changed, 1);
  assert.equal(fs.readFileSync(room, 'utf-8'), teamsMd('m1', 't1', [
    '[0:01] 1.10 Vergaderzaal: Vraag uit de zaal.',
    '[0:05] 1.10 Vergaderzaal: Antwoord uit de zaal.',
    '[0:09] 1.10 Vergaderzaal: Afsluiting.',
  ].join('\n\n')));
  assert.equal(fs.readFileSync(gone, 'utf-8'), teamsMd('m2', 't2', MERGED));

  const again = await reconvertTeamsArchive({ dir, fetchVtt, apply: true });
  assert.equal(again.changed, 0);
});
