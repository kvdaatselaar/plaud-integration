import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse } from 'yaml';
import { kbConfig } from '../src/kb/config.js';
import { loadVocabulary, normalizeKey } from '../src/kb/vocabulary.js';
import { scanSources, type SourceTranscript } from '../src/kb/sources.js';
import { listMarkdown, slugify, splitFrontmatter, writeIfChanged } from '../src/kb/files.js';
import { isHealthOrPrivate, isPrivateTerm } from '../src/kb/redact.js';
import { chatJson, checkLlm } from '../src/kb/llm.js';

// Quality check of the knowledge base. Runs locally; the console only gets counts, the details
// (which sentence, which file) go to _beheer/controle.md for you to read.
//   npm run kb:check                      all fixed checks + model checks on 10 random conversations
//   npm run kb:check -- --steekproef=20   larger sample
//   npm run kb:check -- --seed=7          the same sample again
//   npm run kb:check -- --zonder-model    fixed checks only
const arg = (name: string) => process.argv.find(a => a.startsWith(`--${name}=`))?.split('=')[1];
const SAMPLE = Number(arg('steekproef') ?? 10);
const NO_MODEL = process.argv.includes('--zonder-model');
let seed = Number(arg('seed') ?? Date.now() % 100000);
const SEED = seed;
const random = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const log = (m: string) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${m}`);
const pct = (n: number, of: number) => (of ? `${Math.round((100 * n) / of)}%` : '—');

interface Conversation {
  file: string;
  rel: string;
  fm: Record<string, any>;
  sections: Record<string, string>;
  body: string;
}

function readConversation(file: string): Conversation | string {
  const parts = splitFrontmatter(fs.readFileSync(file, 'utf-8'));
  if (!parts) return 'geen frontmatter';
  let fm: Record<string, any>;
  try {
    fm = (parse(parts.yaml) ?? {}) as Record<string, any>;
  } catch (err) {
    return `frontmatter onleesbaar: ${(err as Error).message.split('\n')[0]}`;
  }
  const sections: Record<string, string> = {};
  for (const chunk of parts.body.split(/^## /m).slice(1)) {
    const [head, ...rest] = chunk.split('\n');
    sections[head.trim()] = rest.join('\n').trim();
  }
  return { file, rel: path.relative(kbConfig.dir, file), fm, sections, body: parts.body };
}

const bullets = (text = '') => text.split('\n').filter(l => /^- /.test(l)).map(l =>
  l.replace(/^- (\[[ x]\] )?/, '').replace(/^\*\*[^*]+:\*\* /, '').replace(/ _\(deadline:[^)]*\)_$/, '').trim());
const sentences = (text = '') => text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+(?=\p{Lu})/u).map(s => s.trim()).filter(s => s.length > 20);
const linksIn = (file: string) => [...fs.readFileSync(file, 'utf-8').matchAll(/\]\((?:<([^>]+\.md)>|([^)\s]+\.md))\)/g)]
  .map(m => m[1] ?? m[2]).filter(l => !/^[a-z]+:/i.test(l)).map(l => path.resolve(path.dirname(file), m2(l)));
const m2 = (l: string) => { try { return decodeURI(l); } catch { return l; } };

// ── Privacy patterns (what redaction should have caught, plus addresses and private matters) ──
function validBsn(d: string): boolean {
  let sum = 0;
  for (let i = 0; i < 8; i++) sum += Number(d[i]) * (9 - i);
  return (sum - Number(d[8])) % 11 === 0;
}
const PRIVACY: [string, RegExp, ((m: string) => boolean)?][] = [
  ['e-mailadres', /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g],
  ['IBAN', /\b[A-Z]{2}\d{2}[ ]?[A-Z]{4}(?:[ ]?\d){10}\b/g],
  ['telefoonnummer', /(?:\+31|0031|\b0)[ -]?(?:\d[ -]?){8,9}\d\b/g],
  ['BSN', /\b\d{9}\b/g, validBsn],
  ['link met sleutel', /https?:\/\/\S*(?:token|sig|key|password|code)=\S*/gi],
  ['adres (postcode + huisnummer)', /\b[1-9]\d{3} ?[A-Z]{2}\b(?=[^.\n]{0,40}\d)|\b\p{Lu}\p{Ll}+(?:straat|laan|weg|plein|singel|gracht|kade)\s+\d+/gu],
];

// ── Claim check: find the passages of the transcript that best match a claim ──
const STOP = new Set('aan als ben bij dan dat de deze die dit doen door een en er had heb hebben het hij hoe hun ik in is je kan kunnen maar me meer met moet na naar niet nog nu of om ook op over te ten tot uit van veel voor wat we wel werd wie wij worden wordt zal ze zich zijn zo and are for from has have not that the their this was were will with you'.split(' '));
const words = (s: string) => new Set(normalizeKey(s).split(' ').filter(w => w.length >= 4 && !STOP.has(w)));
function passages(transcript: string, claim: string, count = 3, size = 2500): string {
  const want = words(claim);
  const windows: { text: string; score: number }[] = [];
  for (let i = 0; i < transcript.length; i += size / 2) {
    const text = transcript.slice(i, i + size);
    let score = 0;
    for (const w of words(text)) if (want.has(w)) score++;
    windows.push({ text, score });
  }
  return windows.sort((a, b) => b.score - a.score).slice(0, count).map(w => w.text).join('\n[…]\n');
}

const VERDICTS = ['ondersteund', 'deels', 'niet_ondersteund'] as const;
async function checkClaim(claim: string, transcript: string): Promise<{ oordeel: string; reden: string }> {
  const raw = await chatJson<{ oordeel?: string; reden?: string }>(
    `Je controleert een kennisbank. Je krijgt één bewering uit de samenvatting van een gesprek en fragmenten uit het automatische transcript van dat gesprek (spraakherkenning, dus met fouten in namen en woorden).
Beoordeel of de fragmenten de bewering ondersteunen:
- ondersteund: de kern klopt met wat er gezegd is
- deels: de strekking klopt maar er staat iets in dat niet gezegd is, of het is sterker of stelliger geformuleerd
- niet_ondersteund: de fragmenten zeggen iets anders, of niets daarover
Geef in één korte zin de reden.`,
    `Bewering: ${claim}\n\nFragmenten uit het transcript:\n"""\n${passages(transcript, claim)}\n"""`,
    { type: 'object', properties: { oordeel: { type: 'string', enum: [...VERDICTS] }, reden: { type: 'string' } }, required: ['oordeel', 'reden'] },
    { oordeel: 'ondersteund', reden: 'mock' },
  );
  return { oordeel: VERDICTS.includes(raw.oordeel as never) ? String(raw.oordeel) : 'niet_ondersteund', reden: String(raw.reden ?? '') };
}

const PRIVACY_CATEGORIES = ['contactgegevens', 'huurder_of_bewoner', 'persoon_bij_klant', 'gezondheid', 'prive_of_gezin', 'salaris_of_beoordeling', 'beveiligingsdetails'] as const;
async function checkPrivacy(text: string): Promise<{ categorieen: string[]; toelichting: string }> {
  const raw = await chatJson<{ categorieen?: string[]; toelichting?: string }>(
    `Je controleert of een samenvatting van een zakelijk gesprek gevoelige gegevens bevat die er volgens de regels niet in mogen:
- contactgegevens: e-mail, telefoon, adres
- huurder_of_bewoner: iets over een individuele huurder, bewoner of eindgebruiker (naam, situatie, klacht, inkomen)
- persoon_bij_klant: naam of persoonlijke details van een individuele medewerker van een klant of partner
- gezondheid: ziekte, gezondheid of herstel van wie dan ook
- prive_of_gezin: privé- of gezinsomstandigheden van wie dan ook
- salaris_of_beoordeling: salarisbedragen of beoordelingsscores van personen
- beveiligingsdetails: wachtwoorden, sleutels of details van beveiligingslekken
Zakelijke inhoud, namen van organisaties en namen van collega's bij hun werk zijn wél toegestaan. Geef de categorieën die voorkomen (leeg als er niets is) en een korte toelichting zonder de gevoelige gegevens zelf te herhalen.`,
    text,
    {
      type: 'object',
      properties: { categorieen: { type: 'array', items: { type: 'string', enum: [...PRIVACY_CATEGORIES] } }, toelichting: { type: 'string' } },
      required: ['categorieen', 'toelichting'],
    },
    { categorieen: [], toelichting: 'mock' },
  );
  return { categorieen: [...new Set(raw.categorieen ?? [])].filter(c => PRIVACY_CATEGORIES.includes(c as never)), toelichting: String(raw.toelichting ?? '') };
}

async function main(): Promise<void> {
  const vocab = loadVocabulary();
  const sources = new Map<string, SourceTranscript>(scanSources().map(s => [s.relPath, s]));
  const report: string[] = [];
  const section = (title: string, lines: string[]) => report.push(`## ${title}`, '', ...(lines.length ? lines : ['_Niets gevonden._']), '');
  const fileLink = (rel: string) => `[${path.basename(rel, '.md')}](../${encodeURI(rel)})`;

  // ── 1. Structure ──
  const files = listMarkdown(kbConfig.conversationsDir);
  const convs: Conversation[] = [];
  const structure: string[] = [];
  for (const f of files) {
    const c = readConversation(f);
    if (typeof c === 'string') {
      structure.push(`- ${fileLink(path.relative(kbConfig.dir, f))}: ${c}`);
      continue;
    }
    convs.push(c);
    const issues: string[] = [];
    for (const k of ['id', 'titel', 'datum', 'type', 'bron', 'bronbestand']) if (!c.fm[k]) issues.push(`veld ${k} ontbreekt`);
    for (const k of ['personen', 'onderwerpen', 'organisaties']) if (!Array.isArray(c.fm[k])) issues.push(`veld ${k} is geen lijst`);
    if (c.fm.type && !vocab.types.includes(c.fm.type)) issues.push(`onbekend type "${c.fm.type}"`);
    for (const t of c.fm.onderwerpen ?? []) if (!vocab.matchTopic(t)) issues.push(`onderwerp "${t}" staat niet op de lijst`);
    for (const p of c.fm.personen ?? []) if (!vocab.matchPerson(p)) issues.push(`persoon "${p}" staat niet op de lijst`);
    for (const o of c.fm.organisaties ?? []) if (!vocab.matchOrganisation(o)) issues.push(`organisatie "${o}" staat niet op de lijst`);
    if (c.fm.over && !vocab.matchPerson(c.fm.over)) issues.push(`"over" (${c.fm.over}) staat niet op de lijst`);
    if (c.fm.bronbestand && !sources.has(c.fm.bronbestand)) issues.push('bronbestand bestaat niet (meer)');
    for (const s of ['Samenvatting', 'Besluiten', 'Actiepunten', 'Open vragen']) if (!(s in c.sections)) issues.push(`sectie ${s} ontbreekt`);
    const summaryWords = (c.sections.Samenvatting ?? '').split(/\s+/).filter(Boolean).length;
    if (summaryWords < 30) issues.push(`samenvatting erg kort (${summaryWords} woorden)`);
    if (issues.length) structure.push(`- ${fileLink(c.rel)}: ${issues.join('; ')}`);
  }
  const typeless = convs.filter(c => c.fm.type === 'overig').length;
  const topicless = convs.filter(c => !(c.fm.onderwerpen ?? []).length).length;
  const actions = convs.flatMap(c => (c.sections.Actiepunten ?? '').split('\n').filter(l => /^- \[/.test(l)));
  const withOwner = actions.filter(l => /^- \[[ x]\] \*\*/.test(l)).length;
  log(`Structuur: ${convs.length} gesprekken, ${structure.length} met een probleem; type "overig": ${typeless}, zonder onderwerp: ${topicless}`);
  log(`Actiepunten: ${actions.length}, waarvan ${pct(withOwner, actions.length)} met eigenaar`);
  section('Structuur', structure);

  // ── 2. Links and findability ──
  const pages = ['personen', 'onderwerpen', 'organisaties', 'reeksen'].flatMap(d => listMarkdown(path.join(kbConfig.dir, d)));
  const allFiles = [path.join(kbConfig.dir, 'INDEX.md'), ...pages, ...files].filter(f => fs.existsSync(f));
  const broken: string[] = [];
  let linkCount = 0;
  const targets = new Map<string, Set<string>>();
  for (const f of allFiles) {
    const ls = linksIn(f);
    linkCount += ls.length;
    targets.set(f, new Set(ls));
    for (const l of ls) if (!fs.existsSync(l)) broken.push(`- ${fileLink(path.relative(kbConfig.dir, f))} → ${path.relative(kbConfig.dir, l)}`);
  }
  const unreachable: string[] = [];
  const pageOf = (dir: string, name: string) => path.join(kbConfig.dir, dir, `${slugify(name)}.md`);
  for (const c of convs) {
    const expected = [
      ...(c.fm.personen ?? []).map((p: string) => pageOf('personen', p)),
      ...(c.fm.onderwerpen ?? []).map((t: string) => pageOf('onderwerpen', t)),
      ...(c.fm.organisaties ?? []).map((o: string) => pageOf('organisaties', o)),
      ...(c.fm.reeks ? [pageOf('reeksen', c.fm.reeks)] : []),
    ];
    const missing = expected.filter(p => !targets.get(p)?.has(c.file)).map(p => path.relative(kbConfig.dir, p));
    if (missing.length) unreachable.push(`- ${fileLink(c.rel)} ontbreekt op: ${missing.join(', ')}`);
  }
  const indexTargets = targets.get(path.join(kbConfig.dir, 'INDEX.md')) ?? new Set();
  const orphanPages = pages.filter(p => !indexTargets.has(p)).map(p => `- ${path.relative(kbConfig.dir, p)} staat niet in INDEX.md`);
  log(`Links: ${linkCount}, kapot: ${broken.length}`);
  log(`Vindbaarheid: ${convs.length - unreachable.length}/${convs.length} gesprekken staan op al hun persoons-, onderwerp-, organisatie- en reekspagina's; pagina's niet in INDEX: ${orphanPages.length}`);
  section('Kapotte links', broken);
  section('Vindbaarheid', [...unreachable, ...orphanPages]);

  // ── 3. Privacy patterns ──
  const privacyHits: string[] = [];
  const perCategory = new Map<string, number>();
  for (const f of [...files, ...pages, path.join(kbConfig.dir, 'INDEX.md')].filter(x => fs.existsSync(x))) {
    const text = fs.readFileSync(f, 'utf-8').split(/^## Notities\s*$/m)[0];
    for (const [label, re, valid] of PRIVACY) {
      for (const m of text.matchAll(re)) {
        if (valid && !valid(m[0])) continue;
        perCategory.set(label, (perCategory.get(label) ?? 0) + 1);
        privacyHits.push(`- ${fileLink(path.relative(kbConfig.dir, f))}: ${label}`);
      }
    }
    for (const s of sentences(text)) {
      const label = isHealthOrPrivate(s) ? 'gezondheid of privé (mag niet)' : isPrivateTerm(s) ? 'HR-term (ter info)' : '';
      if (!label) continue;
      perCategory.set(label, (perCategory.get(label) ?? 0) + 1);
      privacyHits.push(`- ${fileLink(path.relative(kbConfig.dir, f))}: ${label} — "${s.slice(0, 160)}"`);
    }
  }
  const redactedNames = convs.reduce((n, c) => n + (c.body.match(/\[naam\]/g)?.length ?? 0), 0);
  log(`Privacy (patronen): ${privacyHits.length} treffer(s)${perCategory.size ? ` — ${[...perCategory].map(([k, v]) => `${k} ${v}`).join(', ')}` : ''}; namen weggelaten als [naam]: ${redactedNames}`);
  section('Privacy: patronen', privacyHits);

  // ── 4. Model checks on a random sample ──
  if (!NO_MODEL) {
    await checkLlm();
    const pool = convs.filter(c => sources.has(c.fm.bronbestand));
    const sample: Conversation[] = [];
    while (sample.length < Math.min(SAMPLE, pool.length)) {
      const c = pool[Math.floor(random() * pool.length)];
      if (!sample.includes(c)) sample.push(c);
    }
    log(`Steekproef: ${sample.length} gesprekken (seed ${SEED}); feiten- en privacycontrole met het lokale model…`);
    const tally: Record<string, number> = { ondersteund: 0, deels: 0, niet_ondersteund: 0 };
    const factLines: string[] = [];
    const privacyLines: string[] = [];
    const flaggedCategories = new Map<string, number>();
    for (const [i, c] of sample.entries()) {
      const transcript = sources.get(c.fm.bronbestand)!.transcript;
      const claims = [
        ...sentences(c.sections.Samenvatting).slice(0, 6).map(t => ['samenvatting', t]),
        ...bullets(c.sections.Besluiten).map(t => ['besluit', t]),
        ...bullets(c.sections.Actiepunten).map(t => ['actiepunt', t]),
        ...bullets(c.sections['Open vragen']).map(t => ['open vraag', t]),
      ].filter(([, t]) => t && !/^_.*_$/.test(t)).slice(0, 18);
      const own: Record<string, number> = { ondersteund: 0, deels: 0, niet_ondersteund: 0 };
      const doubtful: string[] = [];
      for (const [kind, claim] of claims) {
        const v = await checkClaim(claim, transcript).catch(() => undefined);
        if (!v) continue;
        tally[v.oordeel]++;
        own[v.oordeel]++;
        if (v.oordeel !== 'ondersteund') doubtful.push(`  - ${v.oordeel === 'deels' ? '◐' : '✗'} _${kind}:_ ${claim}\n    → ${v.reden}`);
      }
      factLines.push(`- ${fileLink(c.rel)}: ${own.ondersteund} ondersteund, ${own.deels} deels, ${own.niet_ondersteund} niet`, ...doubtful);
      const text = ['Samenvatting', 'Besluiten', 'Actiepunten', 'Open vragen'].map(s => `${s}:\n${c.sections[s] ?? ''}`).join('\n\n');
      const p = await checkPrivacy(text).catch(() => undefined);
      if (p?.categorieen.length) {
        for (const cat of p.categorieen) flaggedCategories.set(cat, (flaggedCategories.get(cat) ?? 0) + 1);
        privacyLines.push(`- ${fileLink(c.rel)}: ${p.categorieen.join(', ')} — ${p.toelichting}`);
      }
      log(`  ${i + 1}/${sample.length}: ${claims.length} beweringen gecontroleerd`);
    }
    const total = tally.ondersteund + tally.deels + tally.niet_ondersteund;
    log(`Feitencontrole: ${total} beweringen — ${pct(tally.ondersteund, total)} ondersteund, ${pct(tally.deels, total)} deels, ${pct(tally.niet_ondersteund, total)} niet ondersteund`);
    log(`Privacy (model): ${privacyLines.length}/${sample.length} gesprekken gemarkeerd${flaggedCategories.size ? ` — ${[...flaggedCategories].map(([k, v]) => `${k} ${v}`).join(', ')}` : ''}`);
    section(`Feitencontrole (steekproef van ${sample.length}, seed ${SEED})`, [
      `_${total} beweringen: ${pct(tally.ondersteund, total)} ondersteund, ${pct(tally.deels, total)} deels, ${pct(tally.niet_ondersteund, total)} niet ondersteund. "Niet ondersteund" kan ook betekenen dat de controle het juiste stuk transcript niet vond; lees die gevallen na._`,
      '',
      ...factLines,
    ]);
    section('Privacy: oordeel van het model (steekproef)', privacyLines);
  }

  writeIfChanged(path.join(kbConfig.adminDir, 'controle.md'), [
    '# Kwaliteitscontrole kennisbank',
    '',
    `_${new Date().toISOString().slice(0, 16).replace('T', ' ')} · \`npm run kb:check\`. Lokaal gemaakt; bevat zinnen uit de kennisbank, dus niet delen._`,
    '',
    ...report,
  ].join('\n'));
  log('Details: _beheer/controle.md');
}

main().catch(err => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
