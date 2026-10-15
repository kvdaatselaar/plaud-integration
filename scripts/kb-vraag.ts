import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse } from 'yaml';
import { kbConfig } from '../src/kb/config.js';
import { loadVocabulary } from '../src/kb/vocabulary.js';
import { scanSources } from '../src/kb/sources.js';
import { listMarkdown, splitFrontmatter } from '../src/kb/files.js';
import { checkLlm } from '../src/kb/llm.js';
import { askTranscript, estimateMinutes } from '../src/kb/ask.js';

// A question about one conversation that its summary doesn't answer, answered by the local model
// from the raw transcript. Only the (filtered) answer is printed; the transcript stays on this Mac.
//   npm run kb:vraag -- "<gespreksbestand, id of deel van de titel>" "<vraag>"
// Progress goes to stderr, the answer (markdown) to stdout.

const [target, ...rest] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const question = rest.join(' ').trim();
const err = (m: string) => process.stderr.write(`${m}\n`);

function findConversation(arg: string): { file: string; fm: Record<string, any> } | string {
  const candidates = [arg, path.join(kbConfig.dir, arg), path.join(kbConfig.conversationsDir, arg)];
  const direct = candidates.find(c => c.endsWith('.md') && fs.existsSync(c));
  const files = direct ? [direct] : listMarkdown(kbConfig.conversationsDir);
  const hits = files.map(file => {
    const parts = splitFrontmatter(fs.readFileSync(file, 'utf-8'));
    return { file, fm: (parts ? parse(parts.yaml) : {}) as Record<string, any> };
  }).filter(c => direct || c.fm.id === arg || String(c.fm.titel ?? '').toLowerCase().includes(arg.toLowerCase())
    || path.basename(c.file, '.md').toLowerCase().includes(arg.toLowerCase()));
  if (hits.length === 1) return hits[0];
  if (!hits.length) return `Geen gesprek gevonden voor "${arg}".`;
  return `Meerdere gesprekken passen bij "${arg}"; geef het pad of de id:\n${hits.slice(0, 15).map(h => `  ${h.fm.id}  ${path.relative(kbConfig.dir, h.file)}`).join('\n')}`;
}

async function main(): Promise<void> {
  if (!target || !question) {
    err('Gebruik: npm run kb:vraag -- "<gespreksbestand, id of deel van de titel>" "<vraag>"');
    process.exit(2);
  }
  const conv = findConversation(target);
  if (typeof conv === 'string') {
    err(conv);
    process.exit(1);
  }
  const src = scanSources().find(s => s.relPath === conv.fm.bronbestand);
  if (!src) {
    err(`Het transcript van dit gesprek is niet (meer) gevonden: ${conv.fm.bronbestand}`);
    process.exit(1);
  }
  await checkLlm();
  err(`Het lokale model leest het transcript van "${conv.fm.titel}" (${conv.fm.duur_min} min, ±${estimateMinutes(src)} min werk)…`);
  const a = await askTranscript(src, question, loadVocabulary(), m => err(`  ${m}`));
  const lines = [
    `**Uit het transcript (lokaal model)**: ${conv.fm.titel}, ${conv.fm.datum} ${conv.fm.tijd ?? ''}`.trim(),
    '',
    a.antwoord,
    '',
    ...(a.punten.length ? ['**Punten**', ...a.punten.map(p => `- ${p.tijd ? `[${p.tijd.replace(/^\[|\]$/g, '')}] ` : ''}${p.tekst}`), ''] : []),
    ...(a.onzeker ? [`**Niet duidelijk uit het transcript:** ${a.onzeker}`, ''] : []),
    `_Alle ${a.delen} delen van het transcript gelezen door het lokale model op deze Mac; het transcript zelf is niet gedeeld.${a.weggelaten ? ` Namen buiten de vaste lijst staan als [naam] (${a.weggelaten}×).` : ''} Automatische spraakherkenning: controleer belangrijke punten in de opname._`,
  ];
  process.stdout.write(`${lines.join('\n')}\n`);
}

main().catch(e => {
  err(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
