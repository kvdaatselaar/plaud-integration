import { Teams, GraphError, meetingIdFromRef, meetingRefFromLink } from '../src/teams.js';
import { getAccessTokenSilent } from '../src/graph-auth.js';
import { config } from '../src/config.js';
import { state } from '../src/state.js';
import { OneNote } from '../src/onenote.js';
import { ensureNotebook } from '../src/weeks.js';
import { OccurrenceIndex, addTeamsTranscript, toWorkItem } from '../src/teams-sync.js';
import { vttToTranscript } from '../src/vtt.js';

// Usage: npm run teams:import -- "<recap- of join-link>" [--apply]
// Imports the transcripts of one Teams meeting that the daily sync does not see: a meeting that is
// not in your calendar (recap shared with you), or a very old one. Everything else is the same as
// in the sync: a OneNote page, the markdown archive, and a mark in the state so it isn't repeated.
// Without --apply it only reports what it finds.
const DAY = 864e5;

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply');
  const link = process.argv.slice(2).find(a => !a.startsWith('--'));
  if (!link) throw new Error('Geef een Teams recap- of join-link mee: npm run teams:import -- "<link>" [--apply]');
  const ref = meetingRefFromLink(link);
  if (!ref) throw new Error('Geen thread-id en organisator-id gevonden in de link (werkt met recap-links en join-links met context)');
  const meetingId = meetingIdFromRef(ref);

  const token = await getAccessTokenSilent([...config.graph.scopes, ...config.graph.teamsScopes]);
  const teams = new Teams(token);

  let transcripts;
  try {
    transcripts = await teams.listTranscripts(meetingId);
  } catch (err) {
    if (err instanceof GraphError) {
      const why = err.status === 403 ? 'geen toegang: Graph ziet je niet als deelnemer of de organisator zit in een andere tenant'
        : err.status === 404 ? 'meeting niet gevonden via Graph'
        : `${err.status} ${err.code}`;
      throw new Error(`Transcripts niet op te halen (${why})`);
    }
    throw err;
  }
  if (transcripts.length === 0) {
    console.log('Geen transcript bij deze meeting (niet getranscribeerd, of nog niet verwerkt door Teams).');
    return;
  }

  const times = transcripts.map(t => Date.parse(t.createdDateTime ?? '')).filter(Number.isFinite);
  const calendar = await teams.listMeetingsFromCalendar(Math.min(...times) - DAY, Math.max(...times) + DAY);
  const occurrences = new OccurrenceIndex(calendar);
  const meetingCache = new Map();

  let onenote: OneNote | undefined;
  let notebookId: string | undefined;
  for (const t of transcripts) {
    const item = await toWorkItem(teams, t, occurrences, meetingCache);
    if (!item) continue;
    const when = new Date(item.startMs).toISOString().slice(0, 16).replace('T', ' ');
    if (state.hasSyncedTeams(item.transcriptId, item.key)) {
      console.log(`- ${when}  "${item.subject}": al gesynchroniseerd`);
      continue;
    }
    const transcript = vttToTranscript(await teams.getTranscriptVtt(meetingId, item.transcriptId));
    if (!transcript) {
      console.log(`- ${when}  "${item.subject}": transcript is leeg (Teams verwerkt hem mogelijk nog)`);
      continue;
    }
    if (!apply) {
      console.log(`- ${when}  "${item.subject}": ${transcript.split('\n').length} regels, nog niet geïmporteerd (draai met --apply)`);
      continue;
    }
    onenote ??= new OneNote(token);
    notebookId ??= await ensureNotebook(onenote, m => console.log(m));
    const { title, mdPath } = await addTeamsTranscript(onenote, notebookId, item, transcript, m => console.log(m));
    console.log(`- ${when}  ✓ ${title}${mdPath ? `\n  📄 ${mdPath}` : ''}`);
  }
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
