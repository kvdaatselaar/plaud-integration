import * as zlib from 'node:zlib';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { PlaudAuth } from './auth.js';
import { BASE_URLS } from './types.js';
import type { PlaudFileTasks, PlaudRecording, PlaudRecordingDetail, PlaudTaskInfo, PlaudTranscribeOptions, PlaudUserInfo } from './types.js';

function formatTs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface TransSegment {
  content?: string;
  start_time?: number;
  speaker?: string;
  original_speaker?: string;
}

/**
 * Fetch the verbatim transcript from a Plaud presigned S3 URL.
 * URL points to a gzip'd JSON keyed by sequence index (or array) with
 * { content, start_time, speaker } entries. Returns the formatted
 * "[ts] Speaker: content" text, or null on any failure (the caller
 * should fall back to whatever it has).
 */
async function fetchTranscriptFromS3(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    let raw: string;
    try {
      raw = zlib.gunzipSync(buf).toString('utf-8');
    } catch {
      raw = buf.toString('utf-8');
    }
    const data: any = JSON.parse(raw);
    const items: TransSegment[] = Array.isArray(data) ? data : Object.values(data);
    const lines = items
      .filter(i => typeof i?.content === 'string' && i.content.trim().length > 0)
      .map(i => {
        const ts = formatTs(i.start_time ?? 0);
        const rawSpeaker = i.speaker ?? i.original_speaker;
        const speaker = rawSpeaker == null ? '' : String(rawSpeaker).trim();
        const prefix = speaker ? `${speaker}: ` : '';
        return `[${ts}] ${prefix}${i.content!.trim()}`;
      });
    return lines.length > 0 ? lines.join('\n\n') : null;
  } catch {
    return null;
  }
}

export class PlaudClient {
  private auth: PlaudAuth;
  private region: string;

  constructor(auth: PlaudAuth, region: string = 'us') {
    this.auth = auth;
    this.region = region;
  }

  private get baseUrl(): string {
    return BASE_URLS[this.region] ?? BASE_URLS['us'];
  }

  private async request(path: string, options?: RequestInit): Promise<any> {
    const token = await this.auth.getToken();
    const url = `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        // Cloudflare in front of api-*.plaud.ai 403s requests without a
        // browser-ish UA / Origin. Match what the web app sends.
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'Origin': 'https://app.plaud.ai',
        'Referer': 'https://app.plaud.ai/',
        ...options?.headers,
      },
    });

    if (!res.ok) {
      throw new Error(`Plaud API error: ${res.status} ${res.statusText}`);
    }

    const data: any = await res.json();

    if (data?.status === -302 && data?.data?.domains?.api) {
      const domain: string = data.data.domains.api;
      this.region = domain.includes('euc1') ? 'eu' : 'us';
      return this.request(path, options);
    }

    return data;
  }

  async listRecordings(): Promise<PlaudRecording[]> {
    const data = await this.request('/file/simple/web');
    const list: PlaudRecording[] = data.data_file_list ?? data.data ?? [];
    return list.filter(r => !r.is_trash);
  }

  async getRecording(id: string): Promise<PlaudRecordingDetail> {
    const data = await this.request(`/file/detail/${id}`);
    const raw = data.data ?? data;

    // Prefer the verbatim transcript from the presigned S3 URL exposed via
    // content_list[data_type=transaction]. Fall back to the sentence-level
    // pre_download_content_list/source: extract if that fetch fails.
    let transcript = '';
    const transaction = (raw.content_list ?? []).find((c: any) => c?.data_type === 'transaction');
    if (transaction?.data_link) {
      const real = await fetchTranscriptFromS3(transaction.data_link);
      if (real) transcript = real;
    }

    let summary: string | undefined;
    let notes: string | undefined;

    const list: any[] = raw.pre_download_content_list ?? [];
    for (const item of list) {
      const dataId = String(item.data_id ?? '');
      const content = item.data_content ?? '';
      if (!content) continue;

      if (dataId.startsWith('auto_sum:')) {
        try {
          const parsed = JSON.parse(content);
          summary = typeof parsed.ai_content === 'string' ? parsed.ai_content : content;
        } catch {
          summary = content;
        }
      } else if (dataId.startsWith('source:') && !transcript) {
        // Fallback only — verbatim transcript already came from S3 if available.
        try {
          const marks: any[] = JSON.parse(content);
          transcript = marks
            .map(m => ({ ts: m.timestamp ?? 0, text: String(m.mark_content ?? '').trim() }))
            .filter(m => m.text.length > 0)
            .map(m => `[${formatTs(m.ts)}] ${m.text}`)
            .join('\n\n');
        } catch {
          transcript = content;
        }
      } else if (dataId.startsWith('note:')) {
        try {
          const marks: any[] = JSON.parse(content);
          notes = marks
            .map(m => String(m.content ?? m.mark_content ?? '').trim())
            .filter(t => t.length > 0)
            .join('\n\n');
        } catch {
          notes = content;
        }
      }
    }

    return {
      ...raw,
      id: raw.file_id ?? id,
      filename: raw.file_name ?? raw.filename ?? id,
      transcript,
      summary,
      notes,
    } as PlaudRecordingDetail;
  }

  /**
   * Ask Plaud for a short-lived presigned URL to the audio file.
   * is_opus=false → MP3; true → opus.
   */
  async getDownloadUrl(id: string, opus = false): Promise<string> {
    const data = await this.request(`/file/temp-url/${id}?is_opus=${opus}`);
    const url = data?.url ?? data?.data?.url ?? data?.data ?? data?.temp_url;
    if (!url || typeof url !== 'string') {
      throw new Error(`No URL in temp-url response: ${JSON.stringify(data).slice(0, 200)}`);
    }
    return url;
  }

  /**
   * Stream the audio file straight to disk. Creates parent dirs.
   */
  async downloadAudioToFile(id: string, destPath: string, opus = false): Promise<void> {
    const url = await this.getDownloadUrl(id, opus);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Audio download failed: ${res.status} ${res.statusText}`);
    if (!res.body) throw new Error('Empty body');
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    await pipeline(Readable.fromWeb(res.body as any), fs.createWriteStream(destPath));
  }

  // ── Added in this repo (not upstream): start transcriptions, as the web app's "Generate" does ──

  /** Transcript and summary task status of a recording. */
  async getTaskInfo(id: string): Promise<PlaudTaskInfo> {
    const data = (await this.request(`/file/detail/${id}`))?.data ?? {};
    const list: any[] = data.content_list ?? [];
    const status = (type: string) => {
      const v = list.find(c => c?.data_type === type)?.task_status;
      return v == null || v === '' ? undefined : Number(v);
    };
    const summary = list.find(c => c?.data_type === 'auto_sum_note')?.extra ?? {};
    return {
      transcript: status('transaction'),
      summary: status('auto_sum_note'),
      audioDeleted: !!data.audio_deleted,
      summType: summary.summ_type || undefined,
      summTypeType: summary.summ_type_type || undefined,
    };
  }

  /**
   * Latest transcript and summary task per recording, including tasks whose result isn't saved to the
   * recording yet (started from the web, as the sync does).
   */
  async listFileTasks(): Promise<Map<string, PlaudFileTasks>> {
    const data = await this.request('/ai/file-task-status');
    const list: any[] = data?.data?.file_status_list ?? [];
    const out = new Map<string, PlaudFileTasks & { ids: Record<string, string> }>();
    for (const t of list) {
      const kind = t?.task_type === 'transcript' || t?.task_type === 'transaction' ? 'transcript'
        : t?.task_type === 'summary' || t?.task_type === 'auto_sum_note' ? 'summary' : undefined;
      if (!kind || !t.file_id) continue;
      const entry = out.get(t.file_id) ?? { ids: {} };
      // Task ids start with a timestamp: the latest task of each kind wins.
      if (String(t.task_id ?? '') >= (entry.ids[kind] ?? '')) {
        entry.ids[kind] = String(t.task_id ?? '');
        entry[kind] = Number(t.task_status);
      }
      out.set(t.file_id, entry);
    }
    return new Map([...out].map(([id, { transcript, summary }]) => [id, { transcript, summary }]));
  }

  /**
   * Saves the result of a finished transcription to the recording, as the web app does when a task
   * it started completes (Plaud only saves phone transcriptions by itself).
   * Returns 'processing' while Plaud is still busy, 'failed' if the task failed.
   */
  async saveTranscriptionResult(rec: Pick<PlaudRecording, 'id' | 'filename' | 'start_time'>): Promise<'saved' | 'processing' | 'failed'> {
    const r = await this.request(`/ai/transsumm/${rec.id}`, {
      method: 'POST',
      body: JSON.stringify({ is_reload: 0, support_mul_summ: true }),
    });
    const CONTENT_TOO_SHORT = -111;
    if (r?.status === 0) return 'processing';
    if (r?.status !== 1 && r?.status !== CONTENT_TOO_SHORT) return 'failed';
    if (r.auto_save) return 'saved';

    for (const n of r.data_note_result ?? []) {
      await this.request('/ai/update_note_info', {
        method: 'POST',
        body: JSON.stringify({
          file_id: rec.id,
          note_type: n.data_type,
          note_title: n.data_title,
          note_content: n.data_content,
          note_id: n.data_id,
          note_tab_name: n.data_tab_name,
          error_code: String(n.data_error_code),
          summary_id: n.extra?.summary_id || '',
        }),
      });
    }

    const parse = (v: unknown) => {
      if (typeof v !== 'string' || !v) return v ?? undefined;
      try { return JSON.parse(v); } catch { return undefined; }
    };
    const pad = (n: number) => String(n).padStart(2, '0');
    const d = new Date(rec.start_time);
    const started = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    const fill = (md: unknown) => (typeof md === 'string' ? md.replace('$[audio_start_time]', started) : md);

    let aiContent: string | undefined;
    let header: any;
    let form: any;
    const multi = parse(r.data_result_summ_mul);
    const single = parse(r.data_result_summ);
    if (Array.isArray(multi)) {
      aiContent = JSON.stringify(multi.map((m: any) => ({
        ai_content: fill(m.markdown),
        category: m.header?.category,
        summary_id: m.header?.summary_id,
        original_category: m.header?.original_category,
      })));
      header = multi[0]?.header;
      form = multi[0]?.form;
    } else if (single) {
      aiContent = fill(single.markdown) as string | undefined;
      header = single.header;
      form = single.form;
    }

    const detail = (await this.request(`/file/detail/${rec.id}`))?.data ?? {};
    const extra = { ...(detail.extra_data ?? {}) };
    delete extra.tranConfig;
    const taskIdInfo = { ...(extra.task_id_info ?? {}), ...(r.task_id_info ?? {}) };
    if (aiContent && !Array.isArray(multi) && header?.summary_id) taskIdInfo.summary_id = header.summary_id;

    const body: Record<string, unknown> = {
      support_mul_summ: true,
      extra_data: { ...extra, task_id_info: taskIdInfo, aiContentFrom: form, aiContentHeader: header },
    };
    // Recordings still named after their timestamp get the headline, like in the app.
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(rec.filename) && header?.headline) body.filename = header.headline;
    if (r.data_result) body.trans_result = r.data_result;
    if (aiContent) body.ai_content = aiContent;
    if (r.outline_result) body.outline_result = r.outline_result;

    const saved = await this.request(`/file/${rec.id}`, { method: 'PATCH', body: JSON.stringify(body) });
    if (saved?.status !== 0) throw new Error(`Plaud bewaarde de transcriptie niet: ${saved?.msg ?? JSON.stringify(saved).slice(0, 200)}`);
    return 'saved';
  }

  /** Transcription languages you used last, most recent first ("auto", "nl", …). */
  async getRecentLanguages(): Promise<string[]> {
    const data = await this.request('/ai/recently_used_language');
    return data?.data?.default_recently_used_language ?? [];
  }

  /** Remaining transcription minutes of the subscription, in seconds. */
  async getRemainingTranscriptionSeconds(): Promise<number> {
    const data = await this.request('/ai/trans-status');
    return Number(data?.remain_total ?? NaN);
  }

  /**
   * Starts transcription + summary of a recording. 'done' when Plaud already has a finished result
   * (it then returns that instead of starting again); save it with saveTranscriptionResult.
   */
  async startTranscription(id: string, o: PlaudTranscribeOptions): Promise<'started' | 'done'> {
    const info = {
      language: o.language,
      timezone: -new Date().getTimezoneOffset() / 60,
      ...(o.diarization ? { diarization: 1 } : {}),
    };
    const data = await this.request(`/ai/transsumm/${id}`, {
      method: 'POST',
      body: JSON.stringify({
        is_reload: 0,
        summ_type: o.summType,
        summ_type_type: o.summTypeType,
        info: JSON.stringify(info),
        support_mul_summ: true,
      }),
    });
    if (data?.status === 0) return 'started';
    if (data?.status === 1) return 'done';
    throw new Error(`Plaud weigerde de transcriptie (status ${data?.status}): ${data?.err_msg || data?.msg || ''}`);
  }

  async getUserInfo(): Promise<PlaudUserInfo> {
    const data = await this.request('/user/me');
    const user = data.data_user ?? data.data ?? data;
    return {
      id: user.id,
      nickname: user.nickname,
      email: user.email,
      country: user.country,
      membership_type: data.data_state?.membership_type ?? 'unknown',
    };
  }
}
