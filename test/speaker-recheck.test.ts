import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  countGenericSpeakers,
  findGenericPlaudTranscripts,
  pickRechecks,
  recheckSpeakers,
} from '../src/speaker-recheck.js';
import { replaceTranscript } from '../src/archive.js';

// Synthetic fixtures only: no real transcripts.
function plaudMd(id: string, date: string, transcript: string, source = 'plaud'): string {
  return [
    '---',
    `title: "${date} 10:00 Testoverleg ${id}"`,
    `date: ${date}`,
    'time: "10:00"',
    'duration_min: 5',
    `plaud_id: ${id}`,
    `source: ${source}`,
    '---',
    '',
    `# ${date} 10:00 Testoverleg ${id}`,
    '',
    `- **Datum:** ${date} 10:00`,
    '- **Duur:** 5 min',
    '',
    '## Transcript',
    '',
    transcript,
    '',
  ].join('\n');
}

const GENERIC = '[0:01] Speaker 1: alfa\n\n[0:05] Speaker 2: bravo\n\n[0:09] Speaker 1: charlie';
const NAMED = '[0:01] Anna Test: alfa\n\n[0:05] Bob Voorbeeld: bravo\n\n[0:09] Anna Test: charlie';
const PARTLY = '[0:01] Anna Test: alfa\n\n[0:05] Speaker 2: bravo\n\n[0:09] Anna Test: charlie';

function archive(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'speaker-recheck-'));
  for (const [rel, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), content);
  }
  return dir;
}

test('countGenericSpeakers counts Speaker N and Spreker N line labels only', () => {
  assert.equal(countGenericSpeakers(GENERIC), 3);
  assert.equal(countGenericSpeakers('[1:02:03] Spreker 4: delta'), 1);
  assert.equal(countGenericSpeakers(NAMED), 0);
  assert.equal(countGenericSpeakers('[0:01] Anna Test: zei Speaker 1: niets'), 0);
});

test('findGenericPlaudTranscripts skips Teams files and files without generic labels', () => {
  const dir = archive({
    'Week 1/a.md': plaudMd('a', '2026-01-01', GENERIC),
    'Week 1/b.md': plaudMd('b', '2026-01-02', NAMED),
    'Week 1/c.md': plaudMd('c', '2026-01-03', GENERIC, 'teams'),
  });
  const found = findGenericPlaudTranscripts(dir);
  assert.deepEqual(found.map(f => [f.plaudId, f.when, f.generic]), [['a', '2026-01-01 10:00', 3]]);
});

test('replaceTranscript keeps everything above the transcript section', () => {
  const before = plaudMd('a', '2026-01-01', GENERIC);
  const after = replaceTranscript(before, NAMED)!;
  assert.equal(after, plaudMd('a', '2026-01-01', NAMED));
  assert.equal(replaceTranscript('---\n---\n_(Geen transcript beschikbaar)_\n', NAMED), null);
});

test('pickRechecks: never checked first, newest first, at most max', () => {
  const f = (plaudId: string, when: string) => ({ path: '', plaudId, when, generic: 1 });
  const found = [f('old', '2026-01-01 09:00'), f('new', '2026-03-01 09:00'), f('mid', '2026-02-01 09:00')];
  assert.deepEqual(pickRechecks(found, {}, 2).map(x => x.plaudId), ['new', 'mid']);
  assert.deepEqual(pickRechecks(found, { new: 5, mid: 5 }, 2).map(x => x.plaudId), ['old', 'new']);
  assert.deepEqual(pickRechecks(found, {}, 0), []);
});

test('recheckSpeakers overwrites only when the new transcript has fewer generic labels', async () => {
  const dir = archive({
    'Week 1/named.md': plaudMd('named', '2026-01-04', GENERIC),
    'Week 1/partly.md': plaudMd('partly', '2026-01-03', GENERIC),
    'Week 1/same.md': plaudMd('same', '2026-01-02', GENERIC),
    'Week 1/empty.md': plaudMd('empty', '2026-01-01', GENERIC),
  });
  const fresh: Record<string, string> = { named: NAMED, partly: PARTLY, same: GENERIC, empty: '' };
  const r = await recheckSpeakers({ dir, fetchTranscript: async id => fresh[id], lastChecked: {}, max: 10 });

  assert.deepEqual({ ...r, checkedIds: r.checkedIds.length }, { candidates: 4, checked: 4, improved: 2, failed: 0, checkedIds: 4 });
  const read = (n: string) => fs.readFileSync(path.join(dir, 'Week 1', `${n}.md`), 'utf-8');
  assert.equal(read('named'), plaudMd('named', '2026-01-04', NAMED));
  assert.equal(read('partly'), plaudMd('partly', '2026-01-03', PARTLY));
  assert.equal(read('same'), plaudMd('same', '2026-01-02', GENERIC));
  assert.equal(read('empty'), plaudMd('empty', '2026-01-01', GENERIC));
  assert.deepEqual(fs.readdirSync(path.join(dir, 'Week 1')).sort(), ['empty.md', 'named.md', 'partly.md', 'same.md']);
});

test('recheckSpeakers respects max, dry run and fetch failures', async () => {
  const dir = archive({
    'W/a.md': plaudMd('a', '2026-01-03', GENERIC),
    'W/b.md': plaudMd('b', '2026-01-02', GENERIC),
    'W/c.md': plaudMd('c', '2026-01-01', GENERIC),
  });
  const calls: string[] = [];
  const r = await recheckSpeakers({
    dir,
    fetchTranscript: async id => {
      calls.push(id);
      if (id === 'b') throw new Error('Plaud API error: 500');
      return NAMED;
    },
    lastChecked: {},
    max: 2,
    dryRun: true,
  });
  assert.deepEqual(calls, ['a', 'b']);
  assert.deepEqual(r, { candidates: 3, checked: 1, improved: 1, failed: 1, checkedIds: ['a'] });
  assert.equal(fs.readFileSync(path.join(dir, 'W', 'a.md'), 'utf-8'), plaudMd('a', '2026-01-03', GENERIC));
});
