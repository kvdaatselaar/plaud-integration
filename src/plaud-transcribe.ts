import { config } from './config.js';
import { state } from './state.js';
import type { PlaudClient, PlaudFileTasks, PlaudRecording, PlaudTranscribeOptions } from './plaud/index.js';

/** A failed transcription is retried this often, then left to you in the Plaud app. */
const MAX_ATTEMPTS = 2;
const POLL_MS = 30_000;

const minutes = (seconds: number) => `${Math.round(seconds / 60)} min`;

/** The settings of your latest transcription, so a started one looks like the rest. */
async function lastUsedSettings(plaud: PlaudClient, all: PlaudRecording[]): Promise<PlaudTranscribeOptions> {
  const latest = all.filter(r => r.is_trans).sort((a, b) => b.start_time - a.start_time)[0];
  const info = latest ? await plaud.getTaskInfo(latest.id).catch(() => undefined) : undefined;
  const language = (await plaud.getRecentLanguages().catch(() => []))[0] ?? 'auto';
  return {
    language,
    diarization: true,
    summType: info?.summType ?? 'AUTO-SELECT',
    summTypeType: info?.summTypeType ?? 'system',
  };
}

/**
 * Plaud transcribes recordings from the phone automatically, but not every recording (e.g. ones made
 * with the desktop app). For recordings without a transcript that Plaud isn't working on, this starts
 * transcription + summary, waits a while, and saves the result to the recording as the web app does,
 * so they can be synced in this same run. Returns the ids that are ready now.
 */
export async function requestTranscriptions(
  plaud: PlaudClient,
  open: PlaudRecording[],
  all: PlaudRecording[],
  log: (m: string) => void,
): Promise<Set<string>> {
  const ready = new Set<string>();
  if (!config.transcribe.enabled || open.length === 0) return ready;

  let remaining = await plaud.getRemainingTranscriptionSeconds().catch(() => NaN);
  let tasks = await plaud.listFileTasks().catch(() => new Map<string, PlaudFileTasks>());
  let settings: PlaudTranscribeOptions | undefined;
  const waiting: PlaudRecording[] = [];
  const label = (rec: PlaudRecording) => `${rec.id} | ${rec.filename}`;

  /** A task that finished but isn't saved to the recording yet: save it. True when the recording is ready. */
  const finish = async (rec: PlaudRecording): Promise<boolean | undefined> => {
    const t = tasks.get(rec.id);
    if (!t || t.transcript === 0 || t.summary === 0) return undefined;
    if (t.transcript === 1 && t.summary === undefined) return undefined; // summary not started yet
    if ((t.transcript ?? 0) < 0) return false;
    const result = await plaud.saveTranscriptionResult(rec);
    if (result === 'saved') log(`   ✓ ${label(rec)}: transcriptie klaar en bewaard in Plaud`);
    return result === 'saved' ? true : result === 'processing' ? undefined : false;
  };

  for (const rec of open) {
    const seconds = Math.round((rec.duration ?? 0) / 1000);
    if (seconds < config.transcribe.minSeconds) {
      log(`   ⏭ ${label(rec)}: te kort (${seconds} s) om te laten transcriberen`);
      continue;
    }
    try {
      const info = await plaud.getTaskInfo(rec.id);
      if (info.audioDeleted) {
        log(`   ⏭ ${label(rec)}: audio is verwijderd in Plaud; kan niet meer getranscribeerd worden`);
        continue;
      }
      if (info.transcript === 1 && info.summary != null && info.summary !== 0) {
        ready.add(rec.id);
        continue;
      }
      const task = tasks.get(rec.id);
      if (task && (task.transcript ?? 0) >= 0) {
        const done = await finish(rec);
        if (done) ready.add(rec.id);
        else {
          log(`   ⏳ ${label(rec)}: Plaud is al bezig met transcriberen`);
          waiting.push(rec);
        }
        continue;
      }
      const attempts = state.transcribeAttempts(rec.id);
      if (attempts >= MAX_ATTEMPTS) {
        log(`   ✗ ${label(rec)}: transcriptie mislukt na ${attempts} pogingen; start hem in de Plaud-app`);
        continue;
      }
      if (Number.isFinite(remaining) && remaining < seconds) {
        log(`   ⏭ ${label(rec)}: onvoldoende transcriptietegoed (${minutes(remaining)} over, ${minutes(seconds)} nodig)`);
        continue;
      }
      settings ??= await lastUsedSettings(plaud, all);
      if ((await plaud.startTranscription(rec.id, settings)) === 'done') {
        // Finished earlier but never saved to the recording.
        if ((await plaud.saveTranscriptionResult(rec)) === 'saved') {
          log(`   ✓ ${label(rec)}: eerder gemaakte transcriptie bewaard in Plaud`);
          ready.add(rec.id);
        }
        continue;
      }
      state.countTranscribeAttempt(rec.id);
      remaining -= seconds;
      log(`   ▶ ${label(rec)}: transcriptie gestart in Plaud (${minutes(seconds)}, taal ${settings.language}, sjabloon ${settings.summType})`);
      waiting.push(rec);
    } catch (err) {
      log(`   ✗ ${label(rec)}: ${(err as Error).message}`);
    }
  }

  // Wait for transcript and summary, so the recording can go to OneNote in this run.
  const deadline = Date.now() + config.transcribe.waitMinutes * 60_000;
  if (waiting.length && config.transcribe.waitMinutes > 0) {
    log(`Wachten op ${waiting.length} transcriptie(s) in Plaud (max ${config.transcribe.waitMinutes} min)…`);
  }
  while (waiting.length && Date.now() < deadline) {
    await new Promise(r => setTimeout(r, POLL_MS));
    tasks = await plaud.listFileTasks().catch(() => tasks);
    for (const rec of [...waiting]) {
      const done = await finish(rec).catch((err: Error) => {
        log(`   ✗ ${label(rec)}: ${err.message}`);
        return false;
      });
      if (done === undefined) continue;
      waiting.splice(waiting.indexOf(rec), 1);
      if (done) ready.add(rec.id);
      else log(`   ✗ ${label(rec)}: transcriptie mislukt in Plaud`);
    }
  }
  if (waiting.length) log(`   ${waiting.length} transcriptie(s) nog niet klaar; die gaan mee met de volgende sync`);
  return ready;
}
