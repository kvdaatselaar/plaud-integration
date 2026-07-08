import { marked } from 'marked';
import type { PlaudRecording, PlaudRecordingDetail } from './plaud/index.js';
import type { WeekInfo } from './week.js';
import type { WeekRecording, TeamsMeetingRecord } from './state.js';

marked.setOptions({ gfm: true, breaks: true });

const DAY_NL = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
const MONTH_NL_LONG = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function markdownToHtml(md: string): string {
  const html = marked.parse(md, { async: false });
  return typeof html === 'string' ? html : '';
}

function transcriptToHtml(transcript: string): string {
  return transcript
    .split(/\n{2,}/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      // [hh:mm:ss] Speaker N: content
      const sm = line.match(/^\[([^\]]+)\]\s+([^:]+):\s+(.*)$/s);
      if (sm) {
        return `<p><span style="color:#888">[${escape(sm[1])}]</span> <strong>${escape(sm[2])}:</strong> ${escape(sm[3])}</p>`;
      }
      // [hh:mm:ss] content (no speaker — old format)
      const m = line.match(/^\[([^\]]+)\]\s*(.*)$/s);
      if (m) {
        return `<p><span style="color:#888">[${escape(m[1])}]</span> ${escape(m[2])}</p>`;
      }
      return `<p>${escape(line)}</p>`;
    })
    .join('\n');
}

export function buildTeamsPageHtml(input: {
  subject: string;
  startMs: number;
  endMs: number;
  onlineMeetingId: string;
  transcript: string;
}): { title: string; html: string; createdIso: string } {
  const date = new Date(input.startMs);
  const dateStr = date.toISOString().slice(0, 10);
  const timeStr = date.toISOString().slice(11, 16);
  const durationMin = Math.max(0, Math.round((input.endMs - input.startMs) / 60000));
  const title = `${dateStr} ${timeStr} — ${input.subject.trim()}`;

  const parts: string[] = [];
  parts.push(`<p><strong>Bron:</strong> Microsoft Teams</p>`);
  parts.push(`<p><strong>Datum:</strong> ${escape(dateStr)} ${escape(timeStr)}</p>`);
  parts.push(`<p><strong>Duur:</strong> ${durationMin} min</p>`);
  parts.push(`<p><strong>Meeting ID:</strong> ${escape(input.onlineMeetingId)}</p>`);

  if (input.transcript.trim()) {
    parts.push('<hr/>');
    parts.push('<h2>Transcript</h2>');
    parts.push(transcriptToHtml(input.transcript));
  } else {
    parts.push('<p><em>(Geen transcript beschikbaar)</em></p>');
  }

  const createdIso = date.toISOString().replace(/\.\d{3}Z$/, 'Z');
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>${escape(title)}</title>
  <meta name="created" content="${createdIso}" />
</head>
<body>
${parts.join('\n')}
</body>
</html>`;

  return { title, html, createdIso };
}

export function buildPageHtml(
  rec: PlaudRecording,
  detail: PlaudRecordingDetail,
  titleOverride?: string,
): { title: string; html: string; createdIso: string } {
  const date = new Date(rec.start_time);
  const dateStr = date.toISOString().slice(0, 10);
  const timeStr = date.toISOString().slice(11, 16);
  const durationMin = Math.round((rec.duration ?? 0) / 60000);
  const baseName = titleOverride?.trim() || (rec.filename || 'Recording').replace(/\.[a-z0-9]+$/i, '');
  const title = `${dateStr} ${timeStr} — ${baseName}`;

  const parts: string[] = [];
  parts.push(`<p><strong>Datum:</strong> ${escape(dateStr)} ${escape(timeStr)}</p>`);
  parts.push(`<p><strong>Duur:</strong> ${durationMin} min</p>`);
  parts.push(`<p><strong>Plaud ID:</strong> ${escape(rec.id)}</p>`);

  if (detail.summary) {
    parts.push('<hr/>');
    parts.push(markdownToHtml(detail.summary));
  }

  if (detail.notes) {
    parts.push('<hr/>');
    parts.push('<h2>Notes / highlights</h2>');
    parts.push(markdownToHtml(detail.notes));
  }

  if (detail.transcript) {
    parts.push('<hr/>');
    parts.push('<h2>Transcript</h2>');
    parts.push(transcriptToHtml(detail.transcript));
  } else {
    parts.push('<p><em>(Geen transcript beschikbaar)</em></p>');
  }

  const createdIso = date.toISOString().replace(/\.\d{3}Z$/, 'Z');

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>${escape(title)}</title>
  <meta name="created" content="${createdIso}" />
</head>
<body>
${parts.join('\n')}
</body>
</html>`;

  return { title, html, createdIso };
}

export function buildOverviewPageHtml(week: WeekInfo): string {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Overzicht ${escape(week.label)}</title>
  <meta name="created" content="${week.mondayIso}T00:00:00Z" />
</head>
<body>
  ${buildOverviewBody(week, [])}
</body>
</html>`;
}

interface OverviewItem {
  source: 'plaud' | 'teams';
  startTime: number;
  durationMs: number;
  title: string;
  clientUrl?: string;
  webUrl?: string;
}

export function buildOverviewBody(
  week: WeekInfo,
  recordings: WeekRecording[],
  teamsMeetings: TeamsMeetingRecord[] = [],
): string {
  const parts: string[] = [];
  parts.push(`<h1>${escape(week.label)}</h1>`);

  const items: OverviewItem[] = [
    ...recordings.map<OverviewItem>(r => ({
      source: 'plaud',
      startTime: r.startTime,
      durationMs: r.durationMs,
      title: r.title,
      clientUrl: r.clientUrl,
      webUrl: r.webUrl,
    })),
    ...teamsMeetings.map<OverviewItem>(t => ({
      source: 'teams',
      startTime: t.startTime,
      durationMs: t.durationMs,
      title: t.title,
      clientUrl: t.clientUrl,
      webUrl: t.webUrl,
    })),
  ];

  if (items.length === 0) {
    parts.push('<p><em>Nog geen opnames deze week.</em></p>');
    return parts.join('\n');
  }

  items.sort((a, b) => a.startTime - b.startTime);
  const byDay = new Map<string, OverviewItem[]>();
  for (const r of items) {
    const d = new Date(r.startTime);
    const key = d.toISOString().slice(0, 10);
    const list = byDay.get(key) ?? [];
    list.push(r);
    byDay.set(key, list);
  }

  for (const [dayIso, dayItems] of byDay) {
    const d = new Date(`${dayIso}T00:00:00Z`);
    const dayName = DAY_NL[d.getUTCDay()];
    const dayLabel = `${capitalize(dayName)} ${d.getUTCDate()} ${MONTH_NL_LONG[d.getUTCMonth()]}`;
    parts.push(`<h2>${escape(dayLabel)}</h2>`);
    parts.push('<ul>');
    for (const r of dayItems) {
      const time = new Date(r.startTime).toISOString().slice(11, 16);
      const mins = Math.round(r.durationMs / 60_000);
      const link = r.clientUrl ?? r.webUrl ?? '';
      const badge = r.source === 'teams' ? ' <span style="color:#6264a7">📞</span>' : '';
      const titleHtml = link
        ? `<a href="${escape(link)}">${escape(r.title)}</a>`
        : escape(r.title);
      parts.push(`<li>${escape(time)} (${mins} min) — ${titleHtml}${badge}</li>`);
    }
    parts.push('</ul>');
  }

  return parts.join('\n');
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
