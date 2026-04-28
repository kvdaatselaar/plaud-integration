import * as fs from 'node:fs';
import { config } from './config.js';

export interface WeekRecording {
  plaudId: string;
  pageId: string;
  title: string;
  startTime: number;
  durationMs: number;
  clientUrl?: string;
  webUrl?: string;
}

export interface WeekState {
  sectionId: string;
  overviewPageId: string;
  recordings: WeekRecording[];
}

export interface OneNoteState {
  notebookId?: string;
  sectionId?: string;    // legacy (single Inbox section)
  weeks?: Record<string, WeekState>;
}

interface StateFile {
  syncedIds: string[];
  onenote?: OneNoteState;
}

function ensureDir(): void {
  fs.mkdirSync(config.paths.dir, { recursive: true, mode: 0o700 });
}

function load(): StateFile {
  try {
    const raw = fs.readFileSync(config.paths.state, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<StateFile>;
    return {
      syncedIds: parsed.syncedIds ?? [],
      onenote: parsed.onenote,
    };
  } catch {
    return { syncedIds: [] };
  }
}

function save(state: StateFile): void {
  ensureDir();
  fs.writeFileSync(config.paths.state, JSON.stringify(state, null, 2), { mode: 0o600 });
}

export const state = {
  hasSynced(id: string): boolean {
    return load().syncedIds.includes(id);
  },
  markSynced(id: string): void {
    const s = load();
    if (!s.syncedIds.includes(id)) {
      s.syncedIds.push(id);
      save(s);
    }
  },
  getOnenote(): OneNoteState {
    return load().onenote ?? {};
  },
  setNotebookId(notebookId: string): void {
    const s = load();
    s.onenote = { ...(s.onenote ?? {}), notebookId };
    save(s);
  },
  getWeek(key: string): WeekState | undefined {
    return load().onenote?.weeks?.[key];
  },
  setWeek(key: string, week: WeekState): void {
    const s = load();
    const notebook = s.onenote ?? {};
    const weeks = { ...(notebook.weeks ?? {}), [key]: week };
    s.onenote = { ...notebook, weeks };
    save(s);
  },
};
