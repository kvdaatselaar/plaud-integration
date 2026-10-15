import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { config } from '../config.js';
import { kbConfig, GENERATED_MARKER } from './config.js';
import { writeIfChanged } from './files.js';
import { loadVocabulary } from './vocabulary.js';

// The /kennisbank skill in three places, all rendered from knowledge/skill/:
//   - Claude Code on this Mac: ~/.claude/skills/kennisbank (optional; the account copy also reaches Claude Code)
//   - Microsoft 365 Copilot Cowork: <OneDrive>/Documents/Cowork/skills/kennisbank, synced by OneDrive
//   - the Claude account (chat, Cowork, web, phone): a .skill package that you upload once per change

const NAME = 'kennisbank';
const SOURCE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'knowledge', 'skill');
const LOCAL_DIR = path.join(process.env.CLAUDE_CONFIG_DIR ?? path.join(os.homedir(), '.claude'), 'skills', NAME);
const PACKAGE_DIR = path.join(config.paths.dir, 'skill', NAME);
export const PACKAGE_FILE = path.join(config.paths.dir, `${NAME}.skill`);

const ancestors = (dir: string) => {
  const out: string[] = [];
  for (let d = path.resolve(dir); path.dirname(d) !== d; d = path.dirname(d)) out.push(d);
  return out;
};

/** The knowledge base as a path inside OneDrive ("Plaud/Kennisbank"), which is how Microsoft 365 search sees it. */
function oneDrivePath(): string {
  const root = ancestors(kbConfig.dir).find(d => /^OneDrive( - |-)/.test(path.basename(d)));
  return root ? path.relative(root, kbConfig.dir).split(path.sep).join('/') : path.basename(kbConfig.dir);
}

/** Copilot Cowork reads personal skills from Documents/Cowork/skills in OneDrive; look for it above the knowledge base. */
function copilotDir(): string | undefined {
  const dir = process.env.COWORK_SKILLS_DIR
    ?? ancestors(kbConfig.dir).map(d => path.join(d, 'Documents', 'Cowork', 'skills')).find(d => fs.existsSync(d));
  return dir ? path.join(dir, NAME) : undefined;
}

function render(target: 'claude' | 'copilot', marker: boolean): string {
  let text = fs.readFileSync(path.join(SOURCE, 'SKILL.md'), 'utf-8')
    .replaceAll('{{KB_DIR}}', kbConfig.dir)
    .replaceAll('{{KB_FOLDER}}', path.basename(kbConfig.dir))
    .replaceAll('{{ONEDRIVE_PATH}}', oneDrivePath())
    .replaceAll('{{PROJECT_DIR}}', path.resolve(SOURCE, '..', '..'))
    // The owner is the user; naming them lets the skill leave them out of searches and address them as "you".
    .replaceAll('{{EIGENAAR}}', loadVocabulary().owner?.naam ?? 'the owner of the Kennisbank');
  if (!marker) text = text.split('\n').filter(l => !l.includes(GENERATED_MARKER)).join('\n');
  if (target === 'copilot') {
    // Copilot Cowork knows name and description (plus its own `cowork:` block), not Claude's tool settings.
    const [, front, body] = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)!;
    const kept = front.split('\n').filter((l, i, all) => {
      const key = [...all.slice(0, i + 1)].reverse().find(x => /^\S/.test(x)) ?? '';
      return !/^(compatibility|allowed-tools):/.test(key);
    });
    text = `---\n${[...kept, 'cowork:', '  category: research', '  icon: Book'].join('\n')}\n---\n${body}`;
  }
  return text;
}

/** Writes SKILL.md (and the search script, where it can run). True when anything changed. */
function write(dir: string, content: string, script: boolean): boolean {
  const changed = writeIfChanged(path.join(dir, 'SKILL.md'), content);
  if (!script) return changed;
  return writeIfChanged(path.join(dir, 'scripts', 'zoek.py'), fs.readFileSync(path.join(SOURCE, 'scripts', 'zoek.py'), 'utf-8')) || changed;
}

/** A copy without the marker line is the user's own and is left alone. */
const ownVersion = (dir: string) => fs.existsSync(path.join(dir, 'SKILL.md'))
  && !fs.readFileSync(path.join(dir, 'SKILL.md'), 'utf-8').includes(GENERATED_MARKER);

function buildPackage(): string {
  // An unpacked copy next to the package tells whether anything changed since the last upload.
  if (!write(PACKAGE_DIR, render('claude', false), true) && fs.existsSync(PACKAGE_FILE)) return 'skill-pakket actueel';
  fs.rmSync(PACKAGE_FILE, { force: true });
  const zip = spawnSync('zip', ['-q', '-r', '-X', PACKAGE_FILE, NAME], { cwd: path.dirname(PACKAGE_DIR) });
  if (zip.status !== 0) return `skill-pakket mislukt: ${zip.error?.message ?? zip.stderr.toString().trim()}`;
  return `skill-pakket bijgewerkt, upload het opnieuw in Claude: ${PACKAGE_FILE}`;
}

function update(label: string, dir: string, content: string, script: boolean): string {
  if (ownVersion(dir)) return `${label}: eigen versie, niet overschreven`;
  return `${label}: ${write(dir, content, script) ? 'bijgewerkt' : 'actueel'}`;
}

/**
 * kb:skill (`create`): Copilot copy, Claude package, and the Claude Code copy when asked for or already there.
 * kb:index: refreshes only what was installed before, so nothing appears unasked.
 */
export function installSkills(opts: { create: boolean; local?: boolean }): string[] {
  const out: string[] = [];
  const copilot = copilotDir();
  if (copilot && (opts.create || fs.existsSync(copilot))) out.push(update('Copilot Cowork', copilot, render('copilot', true), false));
  else if (opts.create) out.push('Copilot Cowork: geen map Documents/Cowork/skills gevonden in OneDrive (zet COWORK_SKILLS_DIR)');
  if (opts.local || fs.existsSync(LOCAL_DIR)) out.push(update('Claude Code', LOCAL_DIR, render('claude', true), true));
  if (opts.create || fs.existsSync(PACKAGE_FILE)) out.push(buildPackage());
  return out;
}

export const skillLocations = () => ({ local: LOCAL_DIR, copilot: copilotDir(), package: PACKAGE_FILE });
