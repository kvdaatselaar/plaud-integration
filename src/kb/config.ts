import * as path from 'node:path';
import { config } from '../config.js';

const dir = process.env.KB_DIR ?? path.join(path.dirname(config.transcripts.dir), 'Kennisbank');

export const kbConfig = {
  /** Raw transcripts (week folders) — read-only for the knowledge-base steps. */
  sourceDir: config.transcripts.dir,
  dir,
  conversationsDir: path.join(dir, 'gesprekken'),
  personsDir: path.join(dir, 'personen'),
  topicsDir: path.join(dir, 'onderwerpen'),
  organisationsDir: path.join(dir, 'organisaties'),
  seriesDir: path.join(dir, 'reeksen'),
  adminDir: path.join(dir, '_beheer'),
  cacheDir: path.join(dir, '_beheer', 'cache'),
  vocabularyFile: path.join(dir, '_beheer', 'vocabulaire.yml'),
  candidatesFile: path.join(dir, '_beheer', 'kandidaten.md'),
  /** Raw transcripts store UTC times; the knowledge base shows local time. */
  timeZone: process.env.KB_TIMEZONE ?? 'Europe/Amsterdam',
  llm: {
    /** `mock` runs the pipeline with placeholder output, for testing without a model. */
    provider: (process.env.KB_LLM ?? 'ollama').toLowerCase(),
    baseUrl: process.env.KB_LLM_URL ?? 'http://localhost:11434',
    model: process.env.KB_MODEL ?? 'gemma3:12b',
    contextTokens: Number(process.env.KB_CONTEXT ?? 16384),
    chunkChars: Number(process.env.KB_CHUNK_CHARS ?? 16000),
    /** Transcripts contain customer data; a non-local endpoint must be opted into explicitly. */
    allowRemote: (process.env.KB_ALLOW_REMOTE_LLM ?? '').toLowerCase() === 'yes',
  },
};

export const GENERATED_MARKER = 'gegenereerd door plaud-integration';
