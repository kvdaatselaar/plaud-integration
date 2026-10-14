import { installSkill, SKILL_FILE } from '../src/kb/skill.js';

// Installs the /kennisbank skill for Claude Code at user level, with the paths of this checkout
// and the knowledge base filled in. kb:index keeps it current from then on.
//   npm run kb:skill

console.log(`${installSkill(true)}: ${SKILL_FILE}`);
