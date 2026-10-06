import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { Teams, GraphError } from '../src/teams.js';
import { getAccessTokenSilent } from '../src/graph-auth.js';
import { config } from '../src/config.js';
import { state } from '../src/state.js';
import { collectTeamsTranscripts } from '../src/teams-sync.js';
import { parseVtt } from '../src/vtt.js';

// Usage: npm run teams:debug [-- --days=30] [-- --dump]
// --dump writes transcripts that parse to zero cues to the temp dir, for format debugging.
async function main(): Promise<void> {
  const days = Number(process.argv.find(a => a.startsWith('--days='))?.slice(7) ?? 30);
  const token = await getAccessTokenSilent([...config.graph.scopes, ...config.graph.teamsScopes]);
  const teams = new Teams(token);

  const until = Date.now();
  const since = until - days * 24 * 60 * 60 * 1000;
  const { items, noAccess, errors } = await collectTeamsTranscripts(teams, since, until);
  console.log(`# ${items.length} transcript(s) in de laatste ${days} dagen, ${noAccess.length} meeting(s) zonder toegang\n`);

  for (const it of items) {
    const synced = state.hasSyncedTeams(it.transcriptId, it.key) ? 'synced' : 'nieuw ';
    const when = new Date(it.startMs).toISOString().slice(0, 16).replace('T', ' ');
    let status: string;
    try {
      const vtt = await teams.getTranscriptVtt(it.meetingId, it.transcriptId);
      const cues = parseVtt(vtt).length;
      status = cues > 0 ? `✓ ${cues} cues` : `∅ 0 cues (${vtt.length}B)`;
      if (cues === 0 && process.argv.includes('--dump')) {
        const p = path.join(os.tmpdir(), `plaud-teams-${it.transcriptId.slice(0, 12)}.vtt`);
        fs.writeFileSync(p, vtt);
        status += ` → ${p}`;
      }
    } catch (err) {
      status = err instanceof GraphError ? `! ${err.status} ${err.code}` : `! ${(err as Error).message}`;
    }
    console.log(`- [${synced}] ${when}  "${it.subject}"  ${status}`);
  }

  if (noAccess.length > 0) {
    console.log('\n# Niet bereikbaar via Microsoft Graph');
    for (const n of noAccess) console.log(`- "${n.subject}": ${n.reason}`);
  }
  if (errors.length > 0) {
    console.log('\n# Fouten');
    for (const e of errors) console.log(`- ${e}`);
  }
}

main().catch(err => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
