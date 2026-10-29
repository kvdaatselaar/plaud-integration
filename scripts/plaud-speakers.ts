import { PlaudAuth, PlaudClient, PlaudConfig } from '../src/plaud/index.js';
import { config } from '../src/config.js';
import { state } from '../src/state.js';
import { recheckSpeakers } from '../src/speaker-recheck.js';

// Fetches archived Plaud transcripts that still say "Speaker N" again, as the daily sync does.
//   npm run plaud:speakers                       → dry run, counts only
//   npm run plaud:speakers -- --max=100          → dry run over more recordings
//   npm run plaud:speakers -- --apply            → overwrite improved transcripts
const APPLY = process.argv.includes('--apply');
const max = Number(process.argv.find(a => a.startsWith('--max='))?.slice(6) ?? config.speakerRecheck.maxPerRun);

async function main(): Promise<void> {
  const plaudConfig = new PlaudConfig();
  const region = plaudConfig.getCredentials()?.region ?? 'eu';
  const plaud = new PlaudClient(new PlaudAuth(plaudConfig), region);

  const r = await recheckSpeakers({
    dir: config.transcripts.dir,
    fetchTranscript: async id => (await plaud.getRecording(id)).transcript ?? '',
    lastChecked: state.speakerChecks(),
    max,
    dryRun: !APPLY,
  });
  if (APPLY) state.markSpeakersChecked(r.checkedIds, Date.now());

  console.log(`Plaud-transcripten met Speaker N: ${r.candidates}`);
  console.log(`  opnieuw opgehaald: ${r.checked} (max ${max})`);
  console.log(`  verbeterd:         ${r.improved}`);
  console.log(`  mislukt:           ${r.failed}`);
  if (!APPLY) console.log('\nDry run — er is niets gewijzigd. Uitvoeren: npm run plaud:speakers -- --apply');
}

main().catch(err => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
