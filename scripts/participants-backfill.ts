import * as fs from 'node:fs';
import { config } from '../src/config.js';
import { getAccessTokenSilent, tryGetAccessTokenSilent } from '../src/graph-auth.js';
import { Calendar } from '../src/calendar.js';
import { Teams } from '../src/teams.js';
import { frontmatterValue, markdownFiles } from '../src/archive.js';
import { backfillParticipants, ParticipantResolver } from '../src/participants-backfill.js';

// One-off: adds the calendar participants (organizer + invitees) to the frontmatter of the
// transcripts already in the archive. Only the frontmatter changes; path and text stay the same.
//   npm run transcripts:deelnemers            → dry run, counts only
//   npm run transcripts:deelnemers -- --apply → write the frontmatter
const APPLY = process.argv.includes('--apply');
const DAY = 864e5;

async function main(): Promise<void> {
  const dates = [...markdownFiles(config.transcripts.dir)]
    .map(f => Date.parse(frontmatterValue(fs.readFileSync(f, 'utf-8'), 'date') ?? ''))
    .filter(Number.isFinite);
  if (dates.length === 0) {
    console.log('Geen transcripten in het archief.');
    return;
  }
  const calendar = new Calendar(await getAccessTokenSilent());
  const events = await calendar.getAllEventsInRange(
    new Date(Math.min(...dates) - DAY).toISOString(),
    new Date(Math.max(...dates) + 2 * DAY).toISOString(),
  );
  const teamsToken = await tryGetAccessTokenSilent([...config.graph.scopes, ...config.graph.teamsScopes]);
  const teams = teamsToken ? new Teams(teamsToken) : null;
  const resolver = new ParticipantResolver(events, async id => {
    try {
      return (await teams?.getMeeting(id))?.chatInfo?.threadId;
    } catch {
      return undefined;
    }
  });

  const r = await backfillParticipants({ dir: config.transcripts.dir, resolver, internalDomains: config.internalDomains, apply: APPLY });
  const line = (label: string, value: string | number) => console.log(`  ${label.padEnd(38)}${value}`);
  console.log(`Transcripten in het archief: ${r.files}`);
  line('met deelnemers uit de agenda:', r.withParticipants);
  line('zonder afspraak (veld weggelaten):', r.files - r.withParticipants);
  line(APPLY ? 'bijgewerkt:' : 'bij te werken:', r.changed);
  line(`deelnemers intern (${config.internalDomains.join(', ')}) / extern:`, `${r.entriesInternal} / ${r.entriesExternal}`);
  line('unieke adressen intern / extern:', `${r.addressesInternal} / ${r.addressesExternal}`);
  if (!APPLY) console.log('\nDry run — er is niets gewijzigd. Uitvoeren: npm run transcripts:deelnemers -- --apply');
}

main().catch(err => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
