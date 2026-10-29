import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { markdownFiles } from './archive.js';
import { isInternal, type Participant } from './participants.js';

// Profiles of colleagues who take part in meetings, for the personal brain:
// <brein dir>/collegas.json, refreshed weekly by the daily sync.

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';
export const REFRESH_DAYS = 7;

export interface ColleagueProfile {
  email: string;
  displayName: string;
  jobTitle: string | null;
  department: string | null;
  officeLocation: string | null;
  manager: { naam: string; email: string | null } | null;
}

export interface ColleaguesFile {
  bijgewerkt: string;
  collegas: Record<string, ColleagueProfile>;
}

/** GET on a Graph path; null for 404. Throws on anything else. */
export type GraphGet = (pathAndQuery: string) => Promise<any | null>;

export function graphGet(token: string): GraphGet {
  return async p => {
    const res = await fetch(`${GRAPH_BASE}${p}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Graph ${res.status}`);
    return res.json();
  };
}

/** Distinct internal addresses in the `deelnemers` of the archived transcripts. */
export function internalParticipantEmails(dir: string, internalDomains: string[]): string[] {
  const out = new Set<string>();
  for (const file of markdownFiles(dir)) {
    const fm = fs.readFileSync(file, 'utf-8').match(/^---\n([\s\S]*?)\n---\n/)?.[1];
    if (!fm?.includes('\ndeelnemers:')) continue;
    let list: Participant[] = [];
    try {
      list = parseYaml(fm)?.deelnemers ?? [];
    } catch {
      continue;
    }
    for (const p of list) {
      const email = String(p?.email ?? '').toLowerCase();
      if (email && isInternal(email, internalDomains)) out.add(email);
    }
  }
  return [...out].sort();
}

const SELECT = 'id,displayName,mail,jobTitle,department,officeLocation';

/** One colleague's profile and manager; null when the address isn't a user (left, or a group). */
export async function fetchProfile(get: GraphGet, email: string): Promise<ColleagueProfile | null> {
  // Usually the address is the user principal name; otherwise look it up as mail address.
  const user = await get(`/users/${encodeURIComponent(email)}?$select=${SELECT}`)
    ?? (await get(`/users?$filter=${encodeURIComponent(`mail eq '${email.replace(/'/g, "''")}'`)}&$select=${SELECT}`))?.value?.[0];
  if (!user?.id) return null;
  const mgr = await get(`/users/${user.id}/manager?$select=displayName,mail`);
  return {
    email,
    displayName: user.displayName ?? email,
    jobTitle: user.jobTitle ?? null,
    department: user.department ?? null,
    officeLocation: user.officeLocation ?? null,
    manager: mgr?.displayName ? { naam: mgr.displayName, email: mgr.mail?.toLowerCase() ?? null } : null,
  };
}

export interface ColleaguesResult {
  addresses: number;
  found: number;
  withManager: number;
  notFound: number;
  file: ColleaguesFile;
}

export async function collectColleagues(get: GraphGet, emails: string[], now = new Date()): Promise<ColleaguesResult> {
  const collegas: Record<string, ColleagueProfile> = {};
  let notFound = 0;
  for (const email of emails) {
    const profile = await fetchProfile(get, email);
    if (profile) collegas[email] = profile;
    else notFound++;
  }
  const found = Object.values(collegas);
  return {
    addresses: emails.length,
    found: found.length,
    withManager: found.filter(p => p.manager).length,
    notFound,
    file: { bijgewerkt: now.toISOString(), collegas },
  };
}

/** Written next to the file first, then moved over it, so a reader never sees half a file. */
export function writeColleaguesFile(file: string, content: ColleaguesFile): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(content, null, 2)}\n`);
  fs.renameSync(tmp, file);
}

export function refreshDue(lastMs: number | undefined, nowMs: number): boolean {
  return !lastMs || nowMs - lastMs >= REFRESH_DAYS * 864e5;
}
