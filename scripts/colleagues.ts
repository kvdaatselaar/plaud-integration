import { config } from '../src/config.js';
import { state } from '../src/state.js';
import { tryGetAccessTokenSilent } from '../src/graph-auth.js';
import { collectColleagues, graphGet, internalParticipantEmails, writeColleaguesFile } from '../src/colleagues.js';

// Colleague profiles for the brain (collegas.json), as the daily sync does once a week.
//   npm run collegas            → dry run, counts only
//   npm run collegas -- --apply → write collegas.json
const APPLY = process.argv.includes('--apply');

async function main(): Promise<void> {
  const emails = internalParticipantEmails(config.transcripts.dir, config.internalDomains);
  console.log(`Interne adressen in de deelnemers van het archief: ${emails.length}`);

  const token = await tryGetAccessTokenSilent([...config.graph.scopes, ...config.graph.directoryScopes]);
  if (!token) {
    console.log('\nUser.Read.All is (nog) niet consented: een beheerder moet admin-consent geven');
    console.log('voor de app-registratie. Daarna: npm run graph:login -- --collegas');
    return;
  }
  const r = await collectColleagues(graphGet(token), emails);
  console.log(`  profielen gevonden: ${r.found} (${r.withManager} met manager)`);
  console.log(`  niet gevonden:      ${r.notFound}`);
  if (!APPLY) {
    console.log('\nDry run — er is niets geschreven. Uitvoeren: npm run collegas -- --apply');
    return;
  }
  writeColleaguesFile(config.colleaguesFile, r.file);
  state.markColleaguesRefreshed(Date.now());
  console.log(`\nGeschreven: ${config.colleaguesFile}`);
}

main().catch(err => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
