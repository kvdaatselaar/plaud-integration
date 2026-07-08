import { Teams } from '../src/teams.js';
import { getAccessTokenSilent } from '../src/graph-auth.js';
import { config } from '../src/config.js';
import { vttToTranscript, parseVtt } from '../src/vtt.js';

async function main(): Promise<void> {
  const token = await getAccessTokenSilent([...config.graph.scopes, ...config.graph.teamsScopes]);
  const teams = new Teams(token);

  const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const until = Date.now();
  const candidates = await teams.listMeetingsFromCalendar(since, until);
  console.log(`# ${candidates.length} online meeting candidate(s) laatste 30d\n`);

  for (const cand of candidates) {
    try {
      const meeting = await teams.resolveMeeting(cand.joinUrl);
      if (!meeting) {
        console.log(`- [-] "${cand.subject}"  (geen onlineMeeting object gevonden)`);
        continue;
      }
      const trs = await teams.listTranscripts(meeting.id);
      if (trs.length === 0) {
        console.log(`- [ ] "${cand.subject}"  (geen transcripts)`);
        continue;
      }
      for (const t of trs) {
        const vtt = await teams.getTranscriptVtt(meeting.id, t.id);
        const cues = parseVtt(vtt);
        const flat = vttToTranscript(vtt);
        const status = flat ? '✓' : '∅';
        console.log(`- [${status}] "${cand.subject}"  transcript ${t.id.slice(0, 8)}  ${cues.length} cue(s), ${vtt.length}B raw, ${flat.length}B parsed`);
        if (process.argv.includes('--raw') && !flat) {
          console.log('---RAW VTT (first 800 chars)---');
          console.log(vtt.slice(0, 800));
          console.log('---END---\n');
        }
      }
    } catch (err) {
      console.log(`- [!] "${cand.subject}"  ${(err as Error).message}`);
    }
  }
}

main().catch(err => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
