import { config } from '../src/config.js';
import { state } from '../src/state.js';
import { getAccessTokenSilent } from '../src/graph-auth.js';
import { OneNote } from '../src/onenote.js';

async function main(): Promise<void> {
  const token = await getAccessTokenSilent();
  const onenote = new OneNote(token);
  const nb = (await onenote.findNotebook(config.onenote.notebookName))
    ?? (await onenote.createNotebook(config.onenote.notebookName));
  state.setNotebookId(nb.id);
  console.log(`Notebook "${config.onenote.notebookName}" ready (id=${nb.id})`);
  console.log('Week sections worden automatisch aangemaakt bij eerste sync van een opname in die week.');
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
