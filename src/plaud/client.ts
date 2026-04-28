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

    let transcript = '';
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
      } else if (dataId.startsWith('source:')) {
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
