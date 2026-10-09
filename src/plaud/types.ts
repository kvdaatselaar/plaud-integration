export interface PlaudCredentials {
  email?: string;
  password?: string;
  region: 'us' | 'eu';
}

export interface PlaudTokenData {
  accessToken: string;
  tokenType: string;
  issuedAt: number;
  expiresAt: number;
}

export interface PlaudConfig {
  credentials?: PlaudCredentials;
  token?: PlaudTokenData;
}

export const BASE_URLS: Record<string, string> = {
  us: 'https://api.plaud.ai',
  eu: 'https://api-euc1.plaud.ai',
};

export interface PlaudRecording {
  id: string;
  filename: string;
  fullname: string;
  filesize: number;
  duration: number;
  start_time: number;
  end_time: number;
  is_trash: boolean;
  is_trans: boolean;
  is_summary: boolean;
  keywords: string[];
  serial_number: string;
}

export interface PlaudRecordingDetail extends PlaudRecording {
  transcript: string;
  summary?: string;
  notes?: string;
  [key: string]: unknown;
}

/** Added in this repo (not upstream). Task status per Plaud: 0 processing, 1 done, negative failed; undefined = never started. */
export interface PlaudTaskInfo {
  transcript?: number;
  summary?: number;
  audioDeleted: boolean;
  /** Summary template of the last summary, e.g. AUTO-SELECT / system. */
  summType?: string;
  summTypeType?: string;
}

/** Added in this repo (not upstream). Latest transcript/summary task of a recording, from /ai/file-task-status. */
export interface PlaudFileTasks {
  transcript?: number;
  summary?: number;
}

export interface PlaudTranscribeOptions {
  /** Plaud language code, or "auto". */
  language: string;
  diarization: boolean;
  summType: string;
  summTypeType: string;
}

export interface PlaudUserInfo {
  id: string;
  nickname: string;
  email: string;
  country: string;
  membership_type: string;
}
