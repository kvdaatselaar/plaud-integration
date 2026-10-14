import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { kbConfig, GENERATED_MARKER } from './config.js';
import { writeIfChanged } from './files.js';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const TEMPLATE = path.join(REPO, 'knowledge', 'skill', 'SKILL.md');

/** User level, so /kennisbank works in every Claude Code session, not only inside the Kennisbank folder. */
export const SKILL_FILE = path.join(process.env.CLAUDE_CONFIG_DIR ?? path.join(os.homedir(), '.claude'), 'skills', 'kennisbank', 'SKILL.md');

/**
 * Writes the /kennisbank skill with the paths of this checkout and knowledge base filled in.
 * `create: false` only refreshes an installed copy; a copy without the marker line is the user's own.
 */
export function installSkill(create: boolean): string | undefined {
  const exists = fs.existsSync(SKILL_FILE);
  if (!exists && !create) return undefined;
  if (exists && !fs.readFileSync(SKILL_FILE, 'utf-8').includes(GENERATED_MARKER)) return 'skill eigen versie, niet overschreven';
  const repo = /\s/.test(REPO) ? `"${REPO}"` : REPO;
  const content = fs.readFileSync(TEMPLATE, 'utf-8').replaceAll('{{REPO_DIR}}', repo).replaceAll('{{KB_DIR}}', kbConfig.dir);
  return writeIfChanged(SKILL_FILE, content) ? 'skill bijgewerkt' : 'skill actueel';
}
