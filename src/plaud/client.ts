import * as zlib from 'node:zlib';
import { PlaudAuth } from './auth.js';
import { BASE_URLS } from './types.js';
import type { PlaudRecording, PlaudRecordingDetail, PlaudUserInfo } from './types.js';

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
