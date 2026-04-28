import { spawn } from 'node:child_process';
import { config } from '../src/config.js';
import { state } from '../src/state.js';
import { getAccessTokenSilent } from '../src/graph-auth.js';
import { OneNote } from '../src/onenote.js';

async function main(): Promise<void> {
  const token = await getAccessTokenSilent();
  const onenote = new OneNote(token);

  let notebookId = state.getOnenote().notebookId;
  if (!notebookId) {
    console.log('Geen notebook in state.json — resolving...');
    const nb = (await onenote.findNotebook(config.onenote.notebookName))
      ?? (await onenote.createNotebook(config.onenote.notebookName));
    state.setNotebookId(nb.id);
    notebookId = nb.id;
  }

  const notebook = await onenote.getNotebook(notebookId);
  const clientUrl = notebook.links?.oneNoteClientUrl?.href;
  const webUrl = notebook.links?.oneNoteWebUrl?.href;
  const target = clientUrl ?? webUrl;
  if (!target) throw new Error('Notebook heeft geen client- of web-URL.');

  console.log(`Opening: ${target}`);
  const child = spawn('open', [target], { stdio: 'inherit', detached: true });
  child.unref();
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
