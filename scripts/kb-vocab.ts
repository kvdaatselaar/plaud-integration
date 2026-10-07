import * as fs from 'node:fs';
import * as path from 'node:path';
import { kbConfig } from '../src/kb/config.js';
import { loadVocabulary, normalizeKey, wordPattern } from '../src/kb/vocabulary.js';
import { scanSources } from '../src/kb/sources.js';
import { readJson } from '../src/kb/files.js';
import { getAccessTokenSilent } from '../src/graph-auth.js';

// Proposes persons and organisations for the fixed list, from data that already
// exists: calendar attendees of the recorded meetings, and organisations the
// analysis pass found. Writes _beheer/vocabulaire.voorstel.yml; nothing is
// added to vocabulaire.yml automatically.
//   npm run kb:vocab               only names not yet in vocabulaire.yml
//   npm run kb:vocab -- --volledig full proposal, also for names already in the list
const GRAPH = 'https://graph.microsoft.com/v1.0';
const MIN_PERSON = 2;
const MIN_ORG = 3;
const FULL = process.argv.includes('--volledig');
/** Large invites (all-hands, town halls) say little about who you actually work with. */
const MAX_ATTENDEES = 15;

interface Attendee { name: string; address: string }

async function graph<T>(token: string, url: string): Promise<T> {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Prefer: 'outlook.timezone="UTC"' } });
  if (!res.ok) throw new Error(`Graph ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json() as Promise<T>;
}

const ms = (dt: string) => Date.parse(dt.endsWith('Z') ? dt : `${dt}Z`);
const q = (s: string) => JSON.stringify(s);
const orgLabel = (domain: string) => {
  const base = domain.split('.').slice(-2, -1)[0] ?? domain;
  return base.charAt(0).toUpperCase() + base.slice(1);
};

async function main(): Promise<void> {
  const vocab = loadVocabulary();
  const sources = scanSources();
  const token = await getAccessTokenSilent();
  const me = await graph<{ displayName: string; mail?: string; userPrincipalName: string }>(token, `${GRAPH}/me?$select=displayName,mail,userPrincipalName`);
  const homeDomain = (me.mail ?? me.userPrincipalName).split('@')[1].toLowerCase();

  // Calendar over the archive period, with attendees.
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
      events.push({ startMs: ms(e.start.dateTime), endMs: ms(e.end.dateTime), attendees: people });
    }
    next = page['@odata.nextLink'];
  }

  // Attendees of the meeting each recording belongs to (largest overlap).
  const seen = new Map<string, { name: string; count: number }>();
  /** First name in a 1-op-1 title → addresses of attendees with that first name. */
  const titleProof = new Map<string, Set<string>>();
  const myAddress = (me.mail ?? me.userPrincipalName).toLowerCase();
  let matched = 0;
  for (const s of sources) {
    const end = s.startMs + s.durationMin * 60_000;
    const best = events
      .map(e => ({ e, overlap: Math.min(end, e.endMs) - Math.max(s.startMs, e.startMs) }))
      .filter(x => x.overlap > 5 * 60_000 && x.e.attendees.length > 0)
      .sort((a, b) => b.overlap - a.overlap)[0];
    if (!best) continue;
    matched++;
    if (best.e.attendees.length > MAX_ATTENDEES) continue;
    const unique = new Map(best.e.attendees.map(a => [a.address, a]));
    if (vocab.typeFromTitle(s.title)?.overPersoon) {
      for (const a of unique.values()) {
        const first = a.name.split(/\s+/)[0];
        if (a.address === myAddress || first.length < 3 || !wordPattern(first).test(s.title)) continue;
        const key = normalizeKey(first);
        titleProof.set(key, new Set([...(titleProof.get(key) ?? []), a.address]));
      }
    }
    for (const a of unique.values()) {
      const entry = seen.get(a.address) ?? { name: a.name, count: 0 };
      entry.count++;
      seen.set(a.address, entry);
    }
  }

  const known = (name: string) => !FULL && !!vocab.matchPerson(name);
  const people = [...seen].map(([address, v]) => ({ ...v, address, domain: address.split('@')[1] }))
    .filter(p => p.count >= MIN_PERSON || p.name === me.displayName)
    .sort((a, b) => b.count - a.count);
  const internal = people.filter(p => p.domain === homeDomain && !known(p.name));
  const external = people.filter(p => p.domain !== homeDomain && !known(p.name));
  // Aliases: the first name when unique among colleagues, and a double first name
  // ("Peter Jan van de Put" → "Peter Jan") so titles like "MBR Peter Jan & …" resolve.
  const PARTICLES = new Set(['van', 'de', 'der', 'den', 'ter', 'ten', 'het', 'in', 'op', 'von', 'du', 'le', 'la']);
  const prefix = (name: string, n: number) => name.split(/\s+/).slice(0, n).join(' ');
  const unique = (candidate: string, n: number) =>
    internal.filter(p => normalizeKey(prefix(p.name, n)) === normalizeKey(candidate)).length === 1;
  // A shared first name still becomes an alias for the one person who attended
  // the 1-op-1's titled with it (two Rons, but only one in "MBR Ron & …").
  const provenBy = (first: string, address: string) => {
    const proof = titleProof.get(normalizeKey(first));
    return !!proof && proof.size === 1 && proof.has(address);
  };
  const alias = (name: string, address: string) => {
    const words = name.split(/\s+/);
    const out: string[] = [];
    if (words.length >= 2 && words[0].length >= 3 && (unique(words[0], 1) || provenBy(words[0], address))) out.push(words[0]);
    if (words.length >= 3 && /^\p{Lu}/u.test(words[1]) && !PARTICLES.has(words[1].toLowerCase()) && unique(prefix(name, 2), 2)) {
      out.push(prefix(name, 2));
    }
    return out;
  };

  // Organisations from the analysis pass, minus product/topic names and the own organisation.
  const orgCounts = new Map<string, Map<string, number>>();
  const analysisDir = path.join(kbConfig.cacheDir, 'analyse');
  for (const file of fs.existsSync(analysisDir) ? fs.readdirSync(analysisDir) : []) {
    const entry = readJson<{ profile?: { organisaties?: string[] } } | null>(path.join(analysisDir, file), null);
    for (const o of new Set(entry?.profile?.organisaties ?? [])) {
      const key = normalizeKey(o);
      if (!key) continue;
      const spellings = orgCounts.get(key) ?? new Map<string, number>();
      spellings.set(o, (spellings.get(o) ?? 0) + 1);
      orgCounts.set(key, spellings);
    }
  }
  const ownOrg = normalizeKey(orgLabel(homeDomain));
  const orgs = [...orgCounts]
    .map(([key, spellings]) => ({
      key,
      name: [...spellings].sort((a, b) => b[1] - a[1])[0][0],
      count: [...spellings.values()].reduce((a, b) => a + b, 0),
    }))
    .filter(o => o.count >= MIN_ORG && o.key !== ownOrg && !vocab.matchTopic(o.name) && (FULL || !vocab.matchOrganisation(o.name)))
    .sort((a, b) => b.count - a.count);

  const yaml = [
    `# Voorstel voor de vaste lijst, gegenereerd door kb:vocab op ${new Date().toISOString().slice(0, 10)}.`,
    '# Neem over wat klopt in vocabulaire.yml. Dit bestand wordt bij elke run overschreven.',
    '',
    `eigenaar: ${q(me.displayName)}`,
    '',
    'personen:',
    `  # Collega's (@${homeDomain}) in ≥${MIN_PERSON} opgenomen gesprekken met hoogstens ${MAX_ATTENDEES} deelnemers.`,
    ...internal.flatMap(p => [
      `  - naam: ${q(p.name)}   # ${p.count} gesprekken`,
      `    aliassen: ${JSON.stringify(alias(p.name, p.address))}`,
      `    organisatie: ${q(orgLabel(homeDomain))}`,
    ]),
    '  # Externe deelnemers staan uit. Haal de # weg om iemand op te nemen.',
    ...external.flatMap(p => [
      `  # - naam: ${q(p.name)}   # ${p.count} gesprekken, ${p.domain}`,
      `  #   organisatie: ${q(p.domain)}`,
    ]),
    '',
    'organisaties:',
    `  # Door het model genoemd in ≥${MIN_ORG} gesprekken. Vul soort in (klant, partner, leverancier, groep)`,
    '  # en verwijder wat geen organisatie is of niet in de kennisbank hoort.',
    ...orgs.flatMap(o => [`  - naam: ${q(o.name)}   # ${o.count} gesprekken`, '    soort: ""']),
    '',
  ].join('\n');
  const out = path.join(kbConfig.adminDir, 'vocabulaire.voorstel.yml');
  fs.writeFileSync(out, yaml);
  console.log(`Voorstel: ${internal.length} collega's, ${external.length} externen (uit), ${orgs.length} organisaties — ${matched}/${sources.length} gesprekken gekoppeld aan de agenda.`);
  console.log(`→ ${path.relative(kbConfig.dir, out)}`);
}

main().catch(err => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
