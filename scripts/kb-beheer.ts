import * as fs from 'node:fs';
import { parse, stringify } from 'yaml';
import { kbConfig } from '../src/kb/config.js';
import { loadVocabulary } from '../src/kb/vocabulary.js';
import { scanSources } from '../src/kb/sources.js';
import { calendarPeople } from '../src/kb/people.js';
import { maintain, describeChanges, appendChanges } from '../src/kb/maintain.js';
import { checkLlm } from '../src/kb/llm.js';
import { getAccessTokenSilent } from '../src/graph-auth.js';

// Step 0 — beheren: rebuild the automatic layer of the fixed list
// (_beheer/vocabulaire.auto.yml) and log what changed in _beheer/wijzigingen.md.
//   npm run kb:beheer              update
//   npm run kb:beheer -- --dry-run show the changes without writing anything
const DRY_RUN = process.argv.includes('--dry-run');
const log = (m: string) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${m}`);

async function main(): Promise<void> {
  const manual = loadVocabulary({ auto: false });
  const sources = scanSources();

  let calendar;
  try {
    calendar = await calendarPeople(await getAccessTokenSilent(), sources);
  } catch (err) {
    // Without the calendar the person list can't be rebuilt; keep the previous automatic layer.
    log(`⚠ Agenda niet bereikbaar (${(err as Error).message}); vorige automatische lijst blijft staan.`);
    process.exitCode = 1;
    return;
  }

  let llm = true;
  try {
    await checkLlm();
  } catch (err) {
    llm = false;
    log(`⚠ ${(err as Error).message}`);
    log('  Soort van nieuwe organisaties en koppeling van nieuwe termen wachten tot het model er is.');
  }

  log(`${sources.length} gesprekken, ${calendar.attendeesBy.size} gekoppeld aan de agenda`);
  const result = await maintain(manual, sources, calendar, llm, log);

  const previous = fs.existsSync(kbConfig.autoVocabularyFile)
    ? ((parse(fs.readFileSync(kbConfig.autoVocabularyFile, 'utf-8')) ?? {}) as Record<string, unknown>)
    : {};
  const changes = describeChanges(previous, result);
  const extra = [
    ...(result.excluded.length
      ? ['', `Buiten de kennisbank gehouden wegens soort (${manual.policy.uitsluitenSoorten.join(', ')}): ${result.excluded.map(e => `${e.naam} (${e.soort})`).join(', ')}.`]
      : []),
    ...(result.proposals.length
      ? ['', `Voorstellen voor nieuwe subonderwerpen (nieuwe_onderwerpen: voorstel): ${result.proposals.map(p => `${p.naam} onder ${p.parent} (${p.gesprekken})`).join('; ')}.`]
      : []),
  ];

  if (DRY_RUN) {
    for (const l of changes) console.log(`  ${l}`);
    for (const l of extra.filter(Boolean)) console.log(`  ${l}`);
    log(`Dry run: ${changes.length} wijziging(en), niets geschreven.`);
    return;
  }

  const clean = <T extends object>(e: T) => Object.fromEntries(Object.entries(e).filter(([, v]) => v !== undefined && !(Array.isArray(v) && v.length === 0)));
  const body = stringify({
    personen: result.persons.map(clean),
    organisaties: result.organisations.map(clean),
    onderwerpen: result.topics.map(clean),
  }, { lineWidth: 0 });
  fs.writeFileSync(kbConfig.autoVocabularyFile, [
    '# Automatisch onderhouden door `npm run kb:beheer`. NIET BEWERKEN: wordt bij elke run overschreven.',
    '# Corrigeren doe je in vocabulaire.yml (dat wint altijd); weghouden met `negeren:` daarin.',
    `# Bijgewerkt: ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`,
    '',
    body,
  ].join('\n'));
  if (changes.length || !Object.keys(previous).length) appendChanges(changes, extra);

  const merged = loadVocabulary();
  log(`Klaar. ${changes.length} wijziging(en). Lijst nu: ${merged.persons.length} personen, ${merged.organisations.length} organisaties, ${merged.topics.length} onderwerpen.`);
  log('Wat er veranderde: _beheer/wijzigingen.md');
}

main().catch(err => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
