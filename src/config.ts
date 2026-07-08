import 'dotenv/config';
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
  paths: {
    dir: path.join(os.homedir(), '.plaud-integration'),
    state: path.join(os.homedir(), '.plaud-integration', 'state.json'),
    msalCache: path.join(os.homedir(), '.plaud-integration', 'msal-cache.json'),
  },
  graph: {
    scopes: ['Notes.ReadWrite', 'Calendars.Read', 'offline_access', 'User.Read'],
    authority(tenantId: string) {
      return `https://login.microsoftonline.com/${tenantId}`;
    },
  },
};
