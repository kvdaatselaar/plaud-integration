import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  collectColleagues,
  internalParticipantEmails,
  refreshDue,
  writeColleaguesFile,
  type GraphGet,
} from '../src/colleagues.js';
import { participantsYaml } from '../src/participants.js';

// Synthetic directory: example.nl is "internal".
const users: Record<string, any> = {
  'anna@example.nl': { id: 'u1', displayName: 'Anna Test', mail: 'anna@example.nl', jobTitle: 'Developer', department: 'Product', officeLocation: 'Kantoor A' },
  'baas@example.nl': { id: 'u2', displayName: 'De Baas', mail: 'Baas@example.nl', jobTitle: 'Directeur', department: null, officeLocation: null },
};
const aliases: Record<string, string> = { 'a.test@example.nl': 'anna@example.nl' };
const managers: Record<string, string> = { u1: 'baas@example.nl' };

const calls: string[] = [];
const get: GraphGet = async p => {
  calls.push(p);
  const direct = p.match(/^\/users\/([^/?]+)\?/);
  if (direct) return users[decodeURIComponent(direct[1])] ?? null;
  const byMail = decodeURIComponent(p).match(/\$filter=mail eq '([^']+)'/);
  if (byMail) return { value: aliases[byMail[1]] ? [users[aliases[byMail[1]]]] : [] };
  const mgr = p.match(/^\/users\/(u\d)\/manager/);
  if (mgr) return managers[mgr[1]] ? users[managers[mgr[1]]] : null;
  throw new Error(`unexpected ${p}`);
};

test('internalParticipantEmails: distinct internal addresses from the frontmatter', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'colleagues-'));
  const md = (list: { naam: string; email: string }[]) =>
    ['---', 'title: "x"', 'source: plaud', ...participantsYaml(list), '---', '', '## Transcript', '', '[0:01] Anna Test: alfa', ''].join('\n');
  fs.writeFileSync(path.join(dir, 'a.md'), md([{ naam: 'Anna Test', email: 'anna@example.nl' }, { naam: 'Bob', email: 'bob@klant.example.com' }]));
  fs.writeFileSync(path.join(dir, 'b.md'), md([{ naam: 'Anna Test', email: 'anna@example.nl' }, { naam: 'Baas', email: 'baas@example.nl' }]));
  fs.writeFileSync(path.join(dir, 'c.md'), md([]));
  assert.deepEqual(internalParticipantEmails(dir, ['example.nl']), ['anna@example.nl', 'baas@example.nl']);
});

test('collectColleagues: profile, manager, alias lookup, unknown addresses counted', async () => {
  const r = await collectColleagues(get, ['anna@example.nl', 'a.test@example.nl', 'baas@example.nl', 'weg@example.nl'], new Date('2026-01-05T06:00:00Z'));
  assert.deepEqual({ ...r, file: undefined }, { addresses: 4, found: 3, withManager: 2, notFound: 1, file: undefined });
  assert.deepEqual(r.file.collegas['anna@example.nl'], {
    email: 'anna@example.nl',
    displayName: 'Anna Test',
    jobTitle: 'Developer',
    department: 'Product',
    officeLocation: 'Kantoor A',
    manager: { naam: 'De Baas', email: 'baas@example.nl' },
  });
  assert.equal(r.file.collegas['a.test@example.nl'].displayName, 'Anna Test');
  assert.equal(r.file.collegas['baas@example.nl'].manager, null);
  assert.equal(r.file.bijgewerkt, '2026-01-05T06:00:00.000Z');
});

test('writeColleaguesFile writes readable JSON and leaves no temp file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'brein-'));
  const file = path.join(dir, '_brein', 'collegas.json');
  writeColleaguesFile(file, { bijgewerkt: '2026-01-05T06:00:00.000Z', collegas: {} });
  assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf-8')), { bijgewerkt: '2026-01-05T06:00:00.000Z', collegas: {} });
  assert.deepEqual(fs.readdirSync(path.dirname(file)), ['collegas.json']);
});

test('refreshDue: once a week', () => {
  const day = 864e5;
  assert.equal(refreshDue(undefined, 10 * day), true);
  assert.equal(refreshDue(4 * day, 10 * day), false);
  assert.equal(refreshDue(3 * day, 10 * day), true);
});
