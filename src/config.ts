import 'dotenv/config';
import './net.js';
import * as path from 'node:path';
import * as os from 'node:os';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}. Copy .env.example to .env and fill it in.`);
  return v;
}

export const config = {
  azure: {
    clientId: required('AZURE_CLIENT_ID'),
    tenantId: process.env.AZURE_TENANT_ID ?? 'consumers',
  },
  onenote: {
    notebookName: process.env.NOTEBOOK_NAME ?? 'Plaud Notes',
  },
  transcripts: {
    enabled: (process.env.TRANSCRIPTS ?? 'on').toLowerCase() !== 'off',
    dir: process.env.TRANSCRIPTS_DIR ?? path.join(os.homedir(), 'Documents', 'PlaudTranscripts'),
  },
  audio: {
    enabled: (process.env.AUDIO ?? 'on').toLowerCase() !== 'off',
    dir: process.env.AUDIO_DIR ?? path.join(os.homedir(), 'Documents', 'PlaudAudio'),
    format: (process.env.AUDIO_FORMAT ?? 'mp3').toLowerCase() === 'opus' ? 'opus' as const : 'mp3' as const,
  },
  transcribe: {
    // Start Plaud transcription + summary for recordings that have none (e.g. desktop-app recordings).
    enabled: (process.env.PLAUD_AUTO_TRANSCRIBE ?? 'on').toLowerCase() !== 'off',
    minSeconds: Number(process.env.PLAUD_MIN_TRANSCRIBE_SECONDS ?? 60),
    waitMinutes: Number(process.env.PLAUD_TRANSCRIBE_WAIT_MINUTES ?? 15),
  },
  // Addresses in these domains count as colleagues (participants, colleague profiles).
  internalDomains: (process.env.INTERNAL_DOMAINS ?? 'zig.nl').split(',').map(d => d.trim().toLowerCase()).filter(Boolean),
  // Files for the personal brain, next to the transcript archive.
  get colleaguesFile(): string {
    return path.join(this.breinDir, 'collegas.json');
  },
  breinDir: process.env.BREIN_DIR ?? path.join(path.dirname(process.env.TRANSCRIPTS_DIR ?? path.join(os.homedir(), 'Documents', 'PlaudTranscripts')), '_brein'),
  speakerRecheck: {
    // Archived Plaud transcripts still labelled "Speaker N" are fetched again (names tagged later in the app).
    maxPerRun: Number(process.env.PLAUD_SPEAKER_RECHECK_MAX ?? 15),
  },
  paths: {
    dir: path.join(os.homedir(), '.plaud-integration'),
    state: path.join(os.homedir(), '.plaud-integration', 'state.json'),
    msalCache: path.join(os.homedir(), '.plaud-integration', 'msal-cache.json'),
  },
  graph: {
    // Scopes needed for the core sync — user-consentable.
    scopes: ['Notes.ReadWrite', 'Calendars.Read', 'offline_access', 'User.Read'],
    // Teams-specific scopes require admin consent; requested separately so the
    // Plaud sync doesn't crash when consent isn't in place yet.
    teamsScopes: ['OnlineMeetings.Read', 'OnlineMeetingTranscript.Read.All'],
    // Colleague profiles (job title, department, manager): admin consent. Not in allScopes, so
    // graph:login keeps working before consent; request it with `npm run graph:login -- --collegas`.
    directoryScopes: ['User.Read.All'],
    // Superset used by graph-login to request everything in one flow.
    allScopes: [
      'Notes.ReadWrite',
      'Calendars.Read',
      'OnlineMeetings.Read',
      'OnlineMeetingTranscript.Read.All',
      'offline_access',
      'User.Read',
    ],
    authority(tenantId: string) {
      return `https://login.microsoftonline.com/${tenantId}`;
    },
  },
};
