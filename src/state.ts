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

export interface TeamsMeetingRecord {
  onlineMeetingId: string;
  transcriptId: string;
  /** Stable identity (transcript creation time); Microsoft has re-issued transcript ids before. */
  transcriptKey?: string;
  eventId?: string;
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
  teamsMeetings?: TeamsMeetingRecord[];
}

export interface OneNoteState {
  notebookId?: string;
  sectionId?: string;    // legacy (single Inbox section)
  weeks?: Record<string, WeekState>;
}

interface StateFile {
  syncedIds: string[];
  syncedTeamsTranscriptIds?: string[];
  syncedTeamsKeys?: string[];
  onenote?: OneNoteState;
  /** Plaud recordings for which this sync started a transcription: how often. */
  transcribeAttempts?: Record<string, number>;
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
      syncedTeamsTranscriptIds: parsed.syncedTeamsTranscriptIds ?? [],
      syncedTeamsKeys: parsed.syncedTeamsKeys ?? [],
      onenote: parsed.onenote,
      transcribeAttempts: parsed.transcribeAttempts ?? {},
    };
  } catch {
    return { syncedIds: [], syncedTeamsTranscriptIds: [], syncedTeamsKeys: [] };
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
  transcribeAttempts(id: string): number {
    return load().transcribeAttempts?.[id] ?? 0;
  },
  countTranscribeAttempt(id: string): void {
    const s = load();
    s.transcribeAttempts = { ...(s.transcribeAttempts ?? {}), [id]: (s.transcribeAttempts?.[id] ?? 0) + 1 };
    save(s);
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
  hasSyncedTeams(transcriptId: string, key?: string): boolean {
    const s = load();
    return (s.syncedTeamsTranscriptIds ?? []).includes(transcriptId)
      || (!!key && (s.syncedTeamsKeys ?? []).includes(key));
  },
  markTeamsSynced(transcriptId: string, key?: string): void {
    const s = load();
    const ids = s.syncedTeamsTranscriptIds ?? [];
    const keys = s.syncedTeamsKeys ?? [];
    if (!ids.includes(transcriptId)) ids.push(transcriptId);
    if (key && !keys.includes(key)) keys.push(key);
    s.syncedTeamsTranscriptIds = ids;
    s.syncedTeamsKeys = keys;
    save(s);
  },
};
