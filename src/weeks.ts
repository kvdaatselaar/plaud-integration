import { config } from './config.js';
import { state } from './state.js';
import type { WeekState } from './state.js';
import type { OneNote } from './onenote.js';
import { buildOverviewPageHtml, buildOverviewBody } from './html.js';
import type { WeekInfo } from './week.js';

export async function ensureNotebook(onenote: OneNote, log: (m: string) => void): Promise<string> {
  const current = state.getOnenote();
  if (current.notebookId) return current.notebookId;
  log(`Resolving notebook "${config.onenote.notebookName}"`);
  const nb = (await onenote.findNotebook(config.onenote.notebookName))
    ?? (await onenote.createNotebook(config.onenote.notebookName));
  state.setNotebookId(nb.id);
  return nb.id;
}

export async function ensureWeek(
  onenote: OneNote,
  notebookId: string,
  week: WeekInfo,
  log: (m: string) => void,
): Promise<WeekState> {
  const existing = state.getWeek(week.key);
  if (existing) return existing;

  log(`Creating week section "${week.label}"`);
  const section = (await onenote.findSection(notebookId, week.label))
    ?? (await onenote.createSection(notebookId, week.label));

  log(`Creating overview page for ${week.key}`);
  const overview = await onenote.createPage(section.id, buildOverviewPageHtml(week));

  const weekState: WeekState = {
    sectionId: section.id,
    overviewPageId: overview.id,
    recordings: [],
  };
  state.setWeek(week.key, weekState);
  return weekState;
}

/** Rebuild a week's overview page from both Plaud recordings and Teams meetings. */
export async function refreshOverview(onenote: OneNote, week: WeekInfo, weekState: WeekState): Promise<void> {
  await onenote.replacePageBody(
    weekState.overviewPageId,
    buildOverviewBody(week, weekState.recordings, weekState.teamsMeetings ?? []),
  );
}
