import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';

export function sha1(s: string): string {
  return createHash('sha1').update(s).digest('hex');
}

/** Lowercase ASCII slug for file names: "Jan de Vries" → "jan-de-vries". */
export function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'zonder-naam';
}

/** File-name safe, readable: keeps spaces and dashes, strips path/reserved characters. */
export function safeFileName(s: string): string {
  return s.replace(/[\/\\:*?"<>|]/g, '-').replace(/\s+/g, ' ').trim().slice(0, 180);
}

/** Write only when content differs. Returns true when the file changed. */
export function writeIfChanged(filePath: string, content: string): boolean {
  try {
    if (fs.readFileSync(filePath, 'utf-8') === content) return false;
  } catch { /* new file */ }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  return true;
}

export function readJson<T>(filePath: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

export function listMarkdown(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listMarkdown(p));
    else if (entry.name.endsWith('.md')) out.push(p);
  }
  return out;
}

/** Split "---\nyaml\n---\nbody" into its parts. */
export function splitFrontmatter(text: string): { yaml: string; body: string } | null {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  return m ? { yaml: m[1], body: m[2] } : null;
}

const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

export function monthLabel(yyyyMm: string): string {
  const [y, m] = yyyyMm.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}
