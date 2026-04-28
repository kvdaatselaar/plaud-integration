export interface WeekInfo {
  key: string;        // "2026-W16"
  label: string;      // "Week 16 (13-19 apr 2026)"
  year: number;
  week: number;
  mondayIso: string;
  sundayIso: string;
}

const MONTH_NL = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

export function isoWeekInfo(d: Date): WeekInfo {
  // ISO week year/number
  const tmp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((tmp.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  const isoYear = tmp.getUTCFullYear();

  // Monday & Sunday of that week (in local date terms, from input date)
  const inDay = d.getUTCDay() || 7;
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - (inDay - 1)));
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  const mondayIso = monday.toISOString().slice(0, 10);
  const sundayIso = sunday.toISOString().slice(0, 10);

  const sameMonth = monday.getUTCMonth() === sunday.getUTCMonth();
  const mondayLabel = `${monday.getUTCDate()}${sameMonth ? '' : ` ${MONTH_NL[monday.getUTCMonth()]}`}`;
  const sundayLabel = `${sunday.getUTCDate()} ${MONTH_NL[sunday.getUTCMonth()]}`;

  const label = `Week ${week} (${mondayLabel}-${sundayLabel} ${isoYear})`;
  const key = `${isoYear}-W${String(week).padStart(2, '0')}`;

  return { key, label, year: isoYear, week, mondayIso, sundayIso };
}
