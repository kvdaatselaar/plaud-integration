// Deterministic safety net behind the LLM instructions: whatever the model
// lets through, these patterns never reach the knowledge base.

function validBsn(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < 8; i++) sum += Number(digits[i]) * (9 - i);
  sum -= Number(digits[8]);
  return sum % 11 === 0;
}

const PATTERNS: Array<[RegExp, string | ((m: string) => string)]> = [
  [/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, '[e-mail]'],
  [/\b[A-Z]{2}\d{2}[ ]?[A-Z]{4}(?:[ ]?\d){10}\b/g, '[IBAN]'],
  [/(?:\+31|0031|\b0)[ -]?(?:\d[ -]?){8,9}\d\b/g, '[telefoon]'],
  [/\b\d{9}\b/g, m => (validBsn(m) ? '[BSN]' : m)],
  [/https?:\/\/\S*(?:token|sig|key|password|code)=\S*/gi, '[link]'],
];

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Remove contact details and identifiers, and replace names that are not in
 * the fixed person list (customer contacts, tenants, other externals).
 */
export function redact(text: string, unlistedNames: string[]): string {
  let out = text;
  for (const [re, rep] of PATTERNS) out = out.replace(re, rep as never);
  const names = unlistedNames
    .map(n => n.trim())
    .filter(n => n.length >= 3 && /^\p{Lu}/u.test(n))
    .sort((a, b) => b.length - a.length);
  for (const name of names) {
    out = out.replace(new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(name)}(?![\\p{L}\\p{N}])`, 'gu'), '[naam]');
  }
  return out;
}
