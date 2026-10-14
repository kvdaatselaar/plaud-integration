import * as path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { kbConfig } from '../src/kb/config.js';

// Search the knowledge base from the terminal. The search itself lives in the /kennisbank skill
// (knowledge/skill/scripts/zoek.py, Python standard library only), so Claude Code, Cowork and this
// command share one implementation; this wrapper only passes the knowledge-base folder. Read-only.
//   npm run kb:zoek -- "Jan de Vries" datamigratie
//   npm run kb:zoek -- --van=2026-09-01 --tot=2026-09-30 --type=klantgesprek
//   npm run kb:zoek -- WoonNet migratie --alle --max=0

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'knowledge', 'skill', 'scripts', 'zoek.py');
const args = process.argv.slice(2);
const r = spawnSync('python3', ['-I', SCRIPT, ...(args.length ? ['--kb', kbConfig.dir] : []), ...args], { stdio: 'inherit' });
if (r.error) console.error(`python3 niet gevonden: ${r.error.message}`);
process.exit(r.status ?? 1);
