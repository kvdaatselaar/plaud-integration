import * as fs from 'node:fs';
import * as path from 'node:path';
import { kbConfig } from '../src/kb/config.js';
import { loadVocabulary, normalizeKey } from '../src/kb/vocabulary.js';
import { scanSources } from '../src/kb/sources.js';
import { cachedExtraction, chunk, getExtraction } from '../src/kb/extract.js';
import { checkLlm, LlmUnavailableError } from '../src/kb/llm.js';
import {
  buildConversation,
  parseConversationFile,
  readCarryOver,
  withSuffix,
  type Candidate,
  type CarryOver,
} from '../src/kb/conversation.js';
import { listMarkdown, writeIfChanged } from '../src/kb/files.js';

// Step 1 — verrijken: one conversation file per transcript.
//   npm run kb:enrich                       new/changed transcripts through the local model, then re-render all
//   npm run kb:enrich -- --limit=5          at most 5 model extractions this run (trial / spreading the load)
//   npm run kb:enrich -- --since=2026-09-01 only transcripts from that date
//   npm run kb:enrich -- --force            re-extract everything, ignoring the cache
//   npm run kb:enrich -- --dry-run          show what would be extracted
const arg = (name: string) => process.argv.find(a => a.startsWith(`--${name}=`))?.split('=')[1];
const FORCE = process.argv.includes('--force');
const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT = Number(arg('limit') ?? Infinity);
const SINCE = arg('since') ? Date.parse(`${arg('since')}T00:00:00Z`) : -Infinity;

const log = (m: string) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${m}`);

function writeCandidates(found: Map<string, { c: Candidate; spellings: Map<string, number>; conversations: number; origins: Set<string> }>): void {
  const rows = [...found.values()].map(v => ({
    ...v,
    name: [...v.spellings].sort((a, b) => b[1] - a[1])[0][0],
  }));
  const persons = rows.filter(r => r.c.kind === 'persoon').sort((a, b) => b.conversations - a.conversations).slice(0, 200);
  const topics = rows.filter(r => r.c.kind === 'onderwerp').sort((a, b) => b.conversations - a.conversations).slice(0, 200);
  const md = [
    '# Kandidaten voor de vaste lijst',
    '',
    `_Bijgewerkt ${new Date().toISOString().slice(0, 10)}._ Namen en onderwerpen uit de gesprekken die (nog) niet in`,
    '`vocabulaire.yml` staan. Neem over wat in de kennisbank hoort (als `naam` of als alias van een bestaand item)',
    'en draai daarna `npm run kb`. Deze map (_beheer) hoort niet bij de kennisbank zelf.',
    '',
    '## Personen',
    '',
    persons.length ? '| Naam | Gesprekken | Herkomst |\n|---|---:|---|' : '_Geen._',
    ...persons.map(r => `| ${r.name} | ${r.conversations} | ${[...r.origins].join(', ')} |`),
    '',
    '## Onderwerpen',
    '',
    topics.length ? '| Onderwerp | Gesprekken |\n|---|---:|' : '_Geen._',
    ...topics.map(r => `| ${r.name} | ${r.conversations} |`),
    '',
  ].join('\n');
  writeIfChanged(kbConfig.candidatesFile, md);
}

async function main(): Promise<void> {
  const vocab = loadVocabulary();
  const sources = scanSources().filter(s => s.startMs >= SINCE);
  const pending = sources.filter(s => FORCE || !cachedExtraction(s));
  log(`${sources.length} transcript(s) in ${kbConfig.sourceDir}`);
  log(`${pending.length} nog door het taalmodel (${kbConfig.llm.provider}: ${kbConfig.llm.model}), ${sources.length - pending.length} uit cache`);

  if (DRY_RUN) {
    const chunks = pending.reduce((n, s) => n + chunk(s.transcript, kbConfig.llm.chunkChars).length, 0);
    log(`Dry run: ${Math.min(pending.length, LIMIT)} extractie(s), ±${chunks} modelaanroepen voor delen. Niets geschreven.`);
    return;
  }

  let llmOk = pending.length === 0;
  if (!llmOk) {
    try {
      await checkLlm();
      llmOk = true;
    } catch (err) {
      if (!(err instanceof LlmUnavailableError)) throw err;
      log(`⚠ ${err.message}`);
      log('  Alleen gesprekken met een bestaande extractie worden bijgewerkt.');
    }
  }

  // Existing generated files, by id, so notes and ticked actions move along on regeneration.
  const existing = new Map<string, { file: string; carry: CarryOver }>();
  for (const file of listMarkdown(kbConfig.conversationsDir)) {
    const parsed = parseConversationFile(fs.readFileSync(file, 'utf-8'));
    if (parsed && typeof parsed.meta.id === 'string') existing.set(parsed.meta.id, { file, carry: readCarryOver(parsed.body) });
  }

  const produced = new Set<string>();
  const usedPaths = new Set<string>();
  const candidates = new Map<string, { c: Candidate; spellings: Map<string, number>; conversations: number; origins: Set<string> }>();
  let extracted = 0;
  let written = 0;
  let waiting = 0;
  let errors = 0;

  for (const src of sources) {
    let ex = FORCE ? undefined : cachedExtraction(src);
    if (!ex) {
      if (!llmOk || extracted >= LIMIT) {
        waiting++;
        continue;
      }
      const parts = chunk(src.transcript, kbConfig.llm.chunkChars).length;
      log(`→ [${extracted + 1}/${Math.min(pending.length, LIMIT)}] ${src.relPath} (${parts} deel/delen)`);
      try {
        ex = await getExtraction(src, vocab, FORCE);
        extracted++;
      } catch (err) {
        errors++;
        log(`   ✗ ${(err as Error).message}`);
        continue;
      }
    }

    const id = `g-${src.hash.slice(0, 10)}`;
    if (produced.has(id)) continue; // identical transcript twice in the archive
    const conv = buildConversation(src, ex, vocab, existing.get(id)?.carry);
    let rel = conv.relPath;
    if (usedPaths.has(rel)) rel = withSuffix(rel, src.source === 'teams' ? 'Teams' : 'Plaud');
    for (let n = 2; usedPaths.has(rel); n++) rel = withSuffix(conv.relPath, String(n));
    usedPaths.add(rel);
    produced.add(id);

    const target = path.join(kbConfig.conversationsDir, rel);
    if (writeIfChanged(target, conv.content)) written++;
    const old = existing.get(id)?.file;
    if (old && old !== target && fs.existsSync(old)) fs.unlinkSync(old);

    const seen = new Set<string>();
    for (const c of conv.candidates) {
      const key = `${c.kind}:${normalizeKey(c.name)}`;
      if (!normalizeKey(c.name)) continue;
      const entry = candidates.get(key) ?? { c, spellings: new Map(), conversations: 0, origins: new Set() };
      entry.spellings.set(c.name, (entry.spellings.get(c.name) ?? 0) + 1);
      entry.origins.add(c.origin);
      if (!seen.has(key)) entry.conversations++;
      seen.add(key);
      candidates.set(key, entry);
    }
  }

  // Generated files whose transcript is gone (or not yet re-extracted) — keep anything with own notes/ticks.
  let removed = 0;
  for (const [id, { file, carry }] of existing) {
    if (produced.has(id) || !fs.existsSync(file)) continue;
    const pendingHere = sources.some(s => `g-${s.hash.slice(0, 10)}` === id);
    if (pendingHere) continue; // waiting for the model; leave the previous version in place
    if (carry.notes || carry.checked.size > 0) {
      log(`⚠ ${path.relative(kbConfig.dir, file)}: bron niet meer gevonden, maar bevat eigen aantekeningen — blijft staan`);
      continue;
    }
    fs.unlinkSync(file);
    removed++;
  }

  writeCandidates(candidates);
  log(`Klaar. Geëxtraheerd: ${extracted}, bijgewerkt: ${written}, verwijderd: ${removed}, wacht op model: ${waiting}, fouten: ${errors}`);
  log(`Kandidaten voor de vaste lijst: ${path.relative(kbConfig.dir, kbConfig.candidatesFile)}`);
  if (errors > 0 || (waiting > 0 && !llmOk)) process.exitCode = 1;
}

main().catch(err => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
