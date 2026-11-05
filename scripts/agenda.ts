import { config } from '../src/config.js';
import { getAccessTokenSilent } from '../src/graph-auth.js';
import { Calendar } from '../src/calendar.js';
import { graphGet } from '../src/colleagues.js';
import { collectAgenda, describeAgenda, writeAgendaFile } from '../src/agenda.js';

// Today's and tomorrow's appointments for the brain (agenda.json), as every daily sync does.
//   npm run agenda            → dry run, counts only
//   npm run agenda -- --apply → write agenda.json
const APPLY = process.argv.includes('--apply');

async function main(): Promise<void> {
  const token = await getAccessTokenSilent();
  const r = await collectAgenda(new Calendar(token), graphGet(token));
  console.log(`Agenda: ${describeAgenda(r.file, r.counts)}`);
  console.log(`  venster: ${r.file.van} t/m ${r.file.tot}`);
  if (!APPLY) {
    console.log('\nDry run — er is niets geschreven. Uitvoeren: npm run agenda -- --apply');
    return;
  }
  writeAgendaFile(config.agendaFile, r.file);
  console.log(`\nGeschreven: ${config.agendaFile}`);
}

main().catch(err => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
