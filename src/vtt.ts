export interface VttCue {
  startMs: number;
  endMs: number;
  speaker?: string;
  text: string;
}

function parseTs(s: string): number {
  // hh:mm:ss.mmm  or  mm:ss.mmm
  const parts = s.trim().split(':');
  const h = parts.length === 3 ? parseInt(parts[0], 10) : 0;
  const m = parseInt(parts[parts.length - 2], 10);
  const secStr = parts[parts.length - 1].replace(',', '.');
  const s2 = parseFloat(secStr);
  return Math.round((h * 3600 + m * 60 + s2) * 1000);
}

export function parseVtt(vtt: string): VttCue[] {
  const body = vtt
    .replace(/^﻿/, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/^WEBVTT[^\n]*\n(?:[^\n]*\n)*?\n/, '');
  const blocks = body.split(/\n{2,}/);
  const cues: VttCue[] = [];
  for (const block of blocks) {
    const lines = block.split('\n').filter(l => l.length > 0);
    if (lines.length === 0) continue;
    // Optional cue identifier on the first line — skip if no arrow.
    let idx = 0;
    if (!lines[idx].includes('-->')) idx++;
    const timeLine = lines[idx];
    if (!timeLine || !timeLine.includes('-->')) continue;
    const m = timeLine.match(/^([\d:.,]+)\s*-->\s*([\d:.,]+)/);
    if (!m) continue;
    const startMs = parseTs(m[1]);
    const endMs = parseTs(m[2]);
    const rawText = lines.slice(idx + 1).join(' ').trim();
    if (!rawText) continue;

    // Speaker markup variants Teams/Graph emits:
    //   <v Speaker Name>text</v>
    //   <v.Speaker Speaker Name>text
    //   Speaker Name: text
    let speaker: string | undefined;
    let text = rawText;
    const vTag = rawText.match(/^<v(?:\.[^ >]+)?\s+([^>]+)>(.+?)(?:<\/v>)?$/s);
    if (vTag) {
      speaker = vTag[1].trim();
      text = vTag[2].trim();
    } else {
      const colonSpeaker = rawText.match(/^([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ .'-]{0,60}):\s+(.+)$/s);
      if (colonSpeaker && colonSpeaker[1].split(' ').length <= 5) {
        speaker = colonSpeaker[1].trim();
        text = colonSpeaker[2].trim();
      }
    }
    text = text.replace(/<\/?[^>]+>/g, '').trim();
    if (!text) continue;
    cues.push({ startMs, endMs, speaker, text });
  }
  return cues;
}

function formatTs(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Merge consecutive cues from the same speaker (Teams emits many short cues)
 * and format as "[hh:mm:ss] Speaker: text" lines matching the Plaud output.
 */
export function vttToTranscript(vtt: string): string {
  const cues = parseVtt(vtt);
  if (cues.length === 0) return '';
  interface Group { startMs: number; speaker?: string; texts: string[] }
  const groups: Group[] = [];
  for (const c of cues) {
    const last = groups[groups.length - 1];
    if (last && last.speaker === c.speaker) {
      last.texts.push(c.text);
    } else {
      groups.push({ startMs: c.startMs, speaker: c.speaker, texts: [c.text] });
    }
  }
  return groups
    .map(g => {
      const ts = formatTs(g.startMs);
      const body = g.texts.join(' ').replace(/\s+/g, ' ').trim();
      return g.speaker ? `[${ts}] ${g.speaker}: ${body}` : `[${ts}] ${body}`;
    })
    .join('\n\n');
}
