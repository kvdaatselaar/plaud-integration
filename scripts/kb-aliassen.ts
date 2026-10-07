import * as path from 'node:path';
import { kbConfig } from '../src/kb/config.js';
import { loadVocabulary } from '../src/kb/vocabulary.js';
import { scanSources } from '../src/kb/sources.js';
import { scanVariants, type Variant } from '../src/kb/soundkey.js';
import { writeIfChanged } from '../src/kb/files.js';

// Report of how speech recognition spells the names on the fixed list, for checking
// what kb:beheer picks up automatically. Read-only.
//   npm run kb:aliassen   → _beheer/aliassen.voorstel.md

function main(): void {
  const vocab = loadVocabulary();
  const groups = [
    { title: 'Organisaties', entries: vocab.organisations, perPart: false, prefix: 'o' },
    { title: 'Onderwerpen', entries: vocab.topics, perPart: false, prefix: 't' },
    { title: 'Personen (per naamdeel)', entries: vocab.persons, perPart: true, prefix: 'p' },
  ];
  const found = scanVariants(scanSources(), groups.flatMap(g =>
    g.entries.map(e => ({ id: `${g.prefix}:${e.naam}`, names: [e.naam, ...e.aliassen], perPart: g.perPart }))));

  const describe = (v: Variant) => {
    const where = `${v.count}× in ${v.conversations.size} gesprek${v.conversations.size === 1 ? '' : 'ken'}`;
    const caps = v.capitalized === 0 ? 'altijd kleine letter' : `${Math.round((100 * v.capitalized) / v.count)}% hoofdletter`;
    return `${v.surface} (${where}, ${caps})`;
  };
  const lines = [
    '# Schrijfvarianten uit de transcripten',
    '',
    `_Gevonden ${new Date().toISOString().slice(0, 10)}: woorden die klinken als een naam op de vaste lijst maar anders gespeld zijn._`,
    '_`kb:beheer` neemt ze automatisch op (organisaties en personen alleen als ze meestal met een hoofdletter staan)._',
    '',
    ...groups.flatMap(g => {
      const rows = g.entries.flatMap(e => {
        const vs = found.get(`${g.prefix}:${e.naam}`);
        return vs ? [`- **${e.naam}**: ${vs.map(describe).join(', ')}`] : [];
      });
      return [`## ${g.title}`, '', ...(rows.length ? rows : ['_Geen._']), ''];
    }),
  ];
  writeIfChanged(path.join(kbConfig.adminDir, 'aliassen.voorstel.md'), lines.join('\n'));
  console.log(`Varianten bij ${found.size} namen → _beheer/aliassen.voorstel.md`);
}

main();
