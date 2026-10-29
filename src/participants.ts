import type { CalendarEvent } from './calendar.js';

// Meeting participants (organizer + invitees) from the calendar, stored in a transcript's frontmatter:
//   deelnemers:
//     - naam: "Anna Test"
//       email: "anna@example.com"

export interface Participant {
  naam: string;
  email: string;
}

type EventPeople = Pick<CalendarEvent, 'organizer' | 'attendees'>;

/** Organizer first, then invitees; rooms and other resources left out, one entry per address. */
export function participantsFromEvent(e: EventPeople): Participant[] {
  const out: Participant[] = [];
  const seen = new Set<string>();
  const add = (addr?: string, name?: string) => {
    const email = addr?.trim().toLowerCase();
    if (!email || !email.includes('@') || seen.has(email)) return;
    seen.add(email);
    out.push({ naam: name?.trim() || email, email });
  };
  add(e.organizer?.emailAddress?.address, e.organizer?.emailAddress?.name);
  for (const a of e.attendees ?? []) {
    if (a.type === 'resource') continue;
    add(a.emailAddress?.address, a.emailAddress?.name);
  }
  return out;
}

/** Frontmatter lines for the participants; none when the list is empty. */
export function participantsYaml(list: Participant[] | undefined): string[] {
  if (!list?.length) return [];
  return ['deelnemers:', ...list.flatMap(p => [`  - naam: ${JSON.stringify(p.naam)}`, `    email: ${JSON.stringify(p.email)}`])];
}

/**
 * The markdown with its `deelnemers` field set to `list` (replacing an earlier one); nothing
 * else in the frontmatter or below it changes. Null when the file has no frontmatter.
 */
export function setParticipants(md: string, list: Participant[]): string | null {
  const m = md.match(/^---\n([\s\S]*?\n)---\n/);
  if (!m) return null;
  const lines = m[1].split('\n').slice(0, -1);
  const kept: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === 'deelnemers:') {
      while (i + 1 < lines.length && /^\s/.test(lines[i + 1])) i++;
      continue;
    }
    kept.push(lines[i]);
  }
  const fm = [...kept, ...participantsYaml(list)].join('\n');
  return `---\n${fm}\n---\n${md.slice(m[0].length)}`;
}

export function isInternal(email: string, internalDomains: string[]): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return !!domain && internalDomains.some(d => domain === d || domain.endsWith(`.${d}`));
}
