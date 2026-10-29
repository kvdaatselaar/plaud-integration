import { config } from '../src/config.js';
import { getAccessTokenSilent } from '../src/graph-auth.js';
import { Teams } from '../src/teams.js';
import { reconvertTeamsArchive } from '../src/teams-reconvert.js';

// One-off: converts the Teams transcripts in the archive again from Graph, with the current
// VTT conversion (turns kept apart for meeting rooms). Same filenames and frontmatter.
//   npm run teams:reconvert            → dry run, counts only
//   npm run teams:reconvert -- --apply → overwrite the transcript sections
const APPLY = process.argv.includes('--apply');

async function main(): Promise<void> {
  const token = await getAccessTokenSilent([...config.graph.scopes, ...config.graph.teamsScopes]);
  const teams = new Teams(token);
  const r = await reconvertTeamsArchive({
    dir: config.transcripts.dir,
    fetchVtt: (meetingId, transcriptId) => teams.getTranscriptVtt(meetingId, transcriptId),
    apply: APPLY,
  });

  console.log(`Teams-transcripten in het archief: ${r.files}`);
  console.log(`  nog op te halen bij Microsoft:    ${r.fetched}`);
  console.log(`  niet meer beschikbaar (blijven):  ${r.unavailable}`);
  console.log(`  ${(APPLY ? 'herschreven:' : 'te herschrijven:').padEnd(34)}${r.changed}`);
  console.log(`  uitingen voor → na:               ${r.utterancesBefore} → ${r.utterancesAfter}`);
  console.log(`  hele meeting één blok, voor → na: ${r.singleBlockBefore} → ${r.singleBlockAfter}`);
  if (!APPLY) console.log('\nDry run — er is niets gewijzigd. Uitvoeren: npm run teams:reconvert -- --apply');
}

main().catch(err => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
