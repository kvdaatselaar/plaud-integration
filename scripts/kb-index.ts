import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { kbConfig, GENERATED_MARKER } from '../src/kb/config.js';
import { loadVocabulary } from '../src/kb/vocabulary.js';
import { buildIndex } from '../src/kb/index-builder.js';
import { writeIfChanged } from '../src/kb/files.js';

// Step 2 — indexeren: INDEX.md plus a page per person and per topic, rebuilt
// from the conversation files. No network, no model; safe to run any time.
//   npm run kb:index

const TEMPLATE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'knowledge', 'CLAUDE.md');

/** Keep CLAUDE.md current, unless the user took it over by removing the marker line. */
function installClaudeMd(): string {
  const target = path.join(kbConfig.dir, 'CLAUDE.md');
  if (fs.existsSync(target) && !fs.readFileSync(target, 'utf-8').includes(GENERATED_MARKER)) {
    return 'CLAUDE.md eigen versie, niet overschreven';
  }
  return writeIfChanged(target, fs.readFileSync(TEMPLATE, 'utf-8')) ? 'CLAUDE.md bijgewerkt' : 'CLAUDE.md actueel';
}

function main(): void {
  if (!fs.existsSync(kbConfig.conversationsDir)) {
    console.error(`Geen gespreksbestanden in ${kbConfig.conversationsDir}. Draai eerst: npm run kb:enrich`);
    process.exit(1);
  }
  const vocab = loadVocabulary();
  const r = buildIndex(vocab);
  const claude = installClaudeMd();
  console.log(`Index: ${r.conversations} gesprekken, ${r.topics} onderwerpen, ${r.organisations} organisaties, ${r.persons} personen, ${r.series} reeksen — ${r.written} pagina('s) bijgewerkt, ${r.removed} verwijderd; ${claude}.`);
  console.log(`Kennisbank: ${kbConfig.dir}`);
}

main();
