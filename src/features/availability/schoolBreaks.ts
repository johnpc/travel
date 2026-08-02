/**
 * Pure school-break suggester — unit-tested, no ambient clock. Most friend
 * trips land on a school break, so we surface the next few as ready-made,
 * trip-sized date windows: tap one to jump the calendar there (and, once you've
 * picked your name, mark yourself free across it) instead of hunting month by
 * month. Dates are typical US-school-calendar approximations, not authoritative.
 */
export interface SchoolBreak {
  label: string; // "Spring Break"
  start: string; // YYYY-MM-DD
  end: string;
}

interface BreakDef {
  label: string;
  startMonth: number; // 1-12
  startDay: number;
  endMonth: number;
  endDay: number;
}

// Approximate, widely-shared US break weeks. Each is a single trip-sized span.
const BREAKS: BreakDef[] = [
  { label: 'Spring Break', startMonth: 3, startDay: 14, endMonth: 3, endDay: 21 },
  { label: 'Summer Break', startMonth: 7, startDay: 6, endMonth: 7, endDay: 13 },
  { label: 'Thanksgiving', startMonth: 11, startDay: 22, endMonth: 11, endDay: 29 },
  { label: 'Winter Holiday', startMonth: 12, startDay: 21, endMonth: 12, endDay: 28 },
];

const pad = (n: number): string => String(n).padStart(2, '0');
const iso = (y: number, m: number, d: number): string => `${y}-${pad(m)}-${pad(d)}`;

/**
 * The next occurrence of each school break on/after `today`, soonest first. A
 * break whose end has already passed this year rolls to next year, so the list
 * always looks forward.
 */
export function schoolBreaks(today: { year: number; month: number; day: number }): SchoolBreak[] {
  const todayIso = iso(today.year, today.month, today.day);
  return BREAKS.map((b) => {
    const year = iso(today.year, b.endMonth, b.endDay) < todayIso ? today.year + 1 : today.year;
    return {
      label: b.label,
      start: iso(year, b.startMonth, b.startDay),
      end: iso(year, b.endMonth, b.endDay),
    };
  }).sort((a, b) => a.start.localeCompare(b.start));
}
