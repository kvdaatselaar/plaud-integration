import { installSkills, skillLocations } from '../src/kb/skill.js';

// Installs the /kennisbank skill everywhere it can run:
//   - Microsoft 365 Copilot Cowork: written to Documents/Cowork/skills/kennisbank in OneDrive
//   - Claude (chat, Cowork, web, phone, Claude Code): a .skill package to upload once in Claude
//   - Claude Code on this Mac only: with --lokaal, a copy in ~/.claude/skills/kennisbank
// kb:index keeps the installed copies and the package current from then on.
//   npm run kb:skill
//   npm run kb:skill -- --lokaal

const where = skillLocations();
for (const line of installSkills({ create: true, local: process.argv.includes('--lokaal') })) console.log(line);
console.log(`Copilot Cowork: ${where.copilot ?? '—'}\nClaude-pakket: ${where.package}`);
