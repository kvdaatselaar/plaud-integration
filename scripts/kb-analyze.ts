import * as path from 'node:path';
import { kbConfig } from '../src/kb/config.js';
import { loadVocabulary, normalizeKey } from '../src/kb/vocabulary.js';
import { scanSources, type SourceTranscript } from '../src/kb/sources.js';
import { cachedProfile, getProfile, type Profile } from '../src/kb/analyze.js';
import { checkLlm, LlmUnavailableError } from '../src/kb/llm.js';
import { writeIfChanged, writeJson } from '../src/kb/files.js';

// Discovery pass for designing the fixed list (topics and types): one model call
// per transcript, cached. Writes _beheer/analyse.md (for you) and
// _beheer/analyse-aggregaat.json (themes/types/counts only, no content).
//   npm run kb:analyze                 all transcripts (repeatable; cached ones are free)
//   npm run kb:analyze -- --limit=10   at most 10 new model calls this run
const arg = (name: string) => process.argv.find(a => a.startsWith(`--${name}=`))?.split('=')[1];
const LIMIT = Number(arg('limit') ?? Infinity);
const FORCE = process.argv.includes('--force');

const log = (m: string) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${m}`);

interface Group {
  label: string;
  spellings: Map<string, number>;
  titles: string[];
}

function addTo(groups: Map<string, Group>, raw: string, title: string): void {
  const key = normalizeKey(raw);
  if (!key) return;
  const g: Group = groups.get(key) ?? { label: raw, spellings: new Map(), titles: [] };
  g.spellings.set(raw, (g.spellings.get(raw) ?? 0) + 1);
  if (!g.titles.includes(title)) g.titles.push(title);
  groups.set(key, g);
}

function ranked(groups: Map<string, Group>) {
  return [...groups.values()]
    .map(g => ({
      label: [...g.spellings].sort((a, b) => b[1] - a[1])[0][0],
      gesprekken: g.titles.length,
      varianten: [...g.spellings.keys()],
      voorbeelden: g.titles.slice(0, 4),
    }))
    .sort((a, b) => b.gesprekken - a.gesprekken || a.label.localeCompare(b.label, 'nl'));
}

/** Drop themes that contain a speaker's name despite the instruction. */
function nameFree(theme: string, src: SourceTranscript): boolean {
  const tokens = new Set(src.speakers.flatMap(s => normalizeKey(s).split(' ')).filter(t => t.length >= 3));
  return !normalizeKey(theme).split(' ').some(t => tokens.has(t));
}

/** Recurring series by title, with dates/numbers stripped. */
function seriesKey(title: string): string {
  return normalizeKey(title.replace(/\d+/g, ' '));
}

async function main(): Promise<void> {
  const vocab = loadVocabulary();
  const sources = scanSources();
  const pending = sources.filter(s => FORCE || !cachedProfile(s));
  log(`${sources.length} transcript(s); ${pending.length} nog te analyseren, ${sources.length - pending.length} uit cache`);

  let llmOk = pending.length === 0;
  if (!llmOk) {
    try {
      await checkLlm();
      llmOk = true;
    } catch (err) {
      if (!(err instanceof LlmUnavailableError)) throw err;
      log(`⚠ ${err.message}`);
    }
  }

  const profiles: { src: SourceTranscript; p: Profile }[] = [];
  let done = 0;
  let errors = 0;
  for (const src of sources) {
    let p = FORCE ? undefined : cachedProfile(src);
    if (!p && llmOk && done < LIMIT) {
      log(`→ [${done + 1}/${Math.min(pending.length, LIMIT)}] ${src.relPath}`);
      try {
        p = await getProfile(src, vocab, FORCE);
        done++;
      } catch (err) {
        errors++;
        log(`   ✗ ${(err as Error).message}`);
      }
    }
    if (p) profiles.push({ src, p });
  }

  const themes = new Map<string, Group>();
  const orgs = new Map<string, Group>();
  const freeTypes = new Map<string, Group>();
  const series = new Map<string, Group>();
  const fit = new Map<string, { total: number; good: number; titles: string[] }>();
  let droppedThemes = 0;
  for (const { src, p } of profiles) {
    for (const t of p.themas) {
      if (nameFree(t, src)) addTo(themes, t, src.title);
      else droppedThemes++;
    }
    for (const o of p.organisaties) addTo(orgs, o, src.title);
    if (p.type_vrij) addTo(freeTypes, p.type_vrij, src.title);
    addTo(series, src.title, src.title);
    const f = fit.get(p.type_passend) ?? { total: 0, good: 0, titles: [] };
    f.total++;
    if (p.type_past_goed) f.good++;
    else f.titles.push(src.title);
    fit.set(p.type_passend, f);
  }
  const recurring = [...profiles.reduce((m, { src }) => {
    const k = seriesKey(src.title);
    m.set(k, [...(m.get(k) ?? []), src.title]);
    return m;
  }, new Map<string, string[]>())].filter(([, ts]) => ts.length >= 2).sort((a, b) => b[1].length - a[1].length);

  const themeRows = ranked(themes);
  const typeFit = [...fit].sort((a, b) => b[1].total - a[1].total);
  const durations = profiles.map(x => x.src.durationMin).sort((a, b) => a - b);

  // Aggregate without organisation names, for designing the configuration together.
  writeJson(path.join(kbConfig.adminDir, 'analyse-aggregaat.json'), {
    gesprekken: profiles.length,
    bronnen: { plaud: profiles.filter(x => x.src.source === 'plaud').length, teams: profiles.filter(x => x.src.source === 'teams').length },
    duur_min: { mediaan: durations[Math.floor(durations.length / 2)], p90: durations[Math.floor(durations.length * 0.9)] },
    huidige_types: typeFit.map(([type, f]) => ({ type, gesprekken: f.total, past_goed: f.good, past_niet: f.titles })),
    vrije_types: ranked(freeTypes),
    themas: themeRows,
    themas_weggefilterd_wegens_naam: droppedThemes,
    terugkerende_reeksen: recurring.map(([, ts]) => ({ aantal: ts.length, voorbeeld: ts[0] })),
    organisaties_aantal: orgs.size,
  });

  const table = (rows: ReturnType<typeof ranked>, n: number) => [
    '| Label | Gesprekken | Varianten | Voorbeelden |',
    '|---|---:|---|---|',
    ...rows.slice(0, n).map(r => `| ${r.label} | ${r.gesprekken} | ${r.varianten.filter(v => v !== r.label).join(', ')} | ${r.voorbeelden.join('; ').replace(/\|/g, '\\|')} |`),
  ];
  const md = [
    '# Analyse voor de inrichting van de kennisbank',
    '',
    `_${profiles.length} gesprekken geanalyseerd (${new Date().toISOString().slice(0, 10)}). Per gesprek één modelaanroep op een steekproef._`,
    '',
    '## Types: past de huidige lijst?',
    '',
    '| Type | Gesprekken | Past goed | Past matig |',
    '|---|---:|---:|---:|',
    ...typeFit.map(([t, f]) => `| ${t} | ${f.total} | ${f.good} | ${f.total - f.good} |`),
    '',
    '### Hoe het model de gesprekken zelf zou noemen',
    '',
    ...table(ranked(freeTypes), 60),
    '',
    `## Thema's (${themeRows.length} verschillende)`,
    '',
    ...table(themeRows, 300),
    '',
    `## Organisaties (${orgs.size} verschillende)`,
    '',
    ...table(ranked(orgs), 200),
    '',
    '## Terugkerende reeksen (zelfde titel)',
    '',
    ...recurring.map(([, ts]) => `- ${ts.length}× ${ts[0]}`),
    '',
  ].join('\n');
  writeIfChanged(path.join(kbConfig.adminDir, 'analyse.md'), md);

  log(`Klaar. Geanalyseerd: ${done} nieuw, ${profiles.length} totaal, fouten: ${errors}. Rapport: _beheer/analyse.md`);
  if (errors > 0 || profiles.length < sources.length) process.exitCode = 1;
}

main().catch(err => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
