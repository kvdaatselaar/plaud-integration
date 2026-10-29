import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isRoomSpeaker, parseVtt, vttToTranscript } from '../src/vtt.js';

// Synthetic fixtures in the shape Graph returns for .../transcripts/{id}/content?$format=text/vtt.
function vtt(cues: [string, string, string][]): string {
  const ts = (s: string) => `00:${s}.000`;
  return ['WEBVTT', '', ...cues.flatMap(([from, to, text]) => [`${ts(from)} --> ${ts(to)}`, text, ''])].join('\r\n');
}

test('parseVtt reads <v Name>, <v Name | Organisation> and Teams Room speakers', () => {
  const cues = parseVtt(vtt([
    ['00:01', '00:04', '<v Anna Test>Goedemorgen.</v>'],
    ['00:05', '00:09', '<v Bob Voorbeeld | Voorbeeld BV>Hallo.</v>'],
    ['00:10', '00:14', '<v 1.10 Vergaderzaal>Wij zijn er ook.</v>'],
  ]));
  assert.deepEqual(cues.map(c => c.speaker), ['Anna Test', 'Bob Voorbeeld | Voorbeeld BV', '1.10 Vergaderzaal']);
  assert.deepEqual(cues.map(c => c.text), ['Goedemorgen.', 'Hallo.', 'Wij zijn er ook.']);
});

test('isRoomSpeaker recognises room-numbered accounts only', () => {
  assert.equal(isRoomSpeaker('1.10 Vergaderzaal'), true);
  assert.equal(isRoomSpeaker('2.42 Grote zaal'), true);
  assert.equal(isRoomSpeaker('1.27 Kantine (Extern)'), true);
  assert.equal(isRoomSpeaker('Anna Test'), false);
  assert.equal(isRoomSpeaker('Speaker 1'), false);
  assert.equal(isRoomSpeaker(undefined), false);
});

test('consecutive cues of one person merge into one turn', () => {
  const out = vttToTranscript(vtt([
    ['00:01', '00:03', '<v Anna Test>Eerste zin.</v>'],
    ['00:03', '00:06', '<v Anna Test>Tweede zin.</v>'],
    ['00:07', '00:09', '<v Bob Voorbeeld>Antwoord.</v>'],
    ['00:10', '00:12', '<v Anna Test>Weer Anna.</v>'],
  ]));
  assert.equal(out, [
    '[0:01] Anna Test: Eerste zin. Tweede zin.',
    '[0:07] Bob Voorbeeld: Antwoord.',
    '[0:10] Anna Test: Weer Anna.',
  ].join('\n\n'));
});

test('cues without a speaker are never merged', () => {
  const out = vttToTranscript(vtt([
    ['00:01', '00:03', 'Zonder spreker een.'],
    ['00:04', '00:06', 'Zonder spreker twee.'],
    ['00:07', '00:09', '<v Anna Test>Met spreker.</v>'],
  ]));
  assert.equal(out, ['[0:01] Zonder spreker een.', '[0:04] Zonder spreker twee.', '[0:07] Anna Test: Met spreker.'].join('\n\n'));
});

test('cues from a meeting room stay separate lines', () => {
  const out = vttToTranscript(vtt([
    ['00:01', '00:05', '<v 1.10 Vergaderzaal>Vraag uit de zaal.</v>'],
    ['00:06', '00:09', '<v 1.10 Vergaderzaal>Antwoord uit de zaal.</v>'],
    ['00:10', '00:12', '<v Anna Test>Online.</v>'],
  ]));
  assert.equal(out.split('\n\n').length, 3);
  assert.match(out, /^\[0:06\] 1\.10 Vergaderzaal: Antwoord uit de zaal\.$/m);
});

test('one speaker for a whole meeting does not become one block', () => {
  const cues: [string, string, string][] = [];
  for (let s = 0; s < 600; s += 20) {
    const at = (x: number) => `${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`;
    cues.push([at(s), at(s + 19), `<v Anna Test>Zin op ${s}.</v>`]);
  }
  const lines = vttToTranscript(vtt(cues)).split('\n\n');
  assert.equal(lines.length, 5);
  assert.ok(lines.every(l => l.startsWith('[') && l.includes('] Anna Test: ')));
  assert.deepEqual(lines.map(l => l.slice(0, 6)), ['[0:00]', '[2:00]', '[4:00]', '[6:00]', '[8:00]']);
});
