/**
 * Pure calendar helpers — unit-tested, no ambient clock. Build a month's grid of
 * YYYY-MM-DD day stamps (weeks of 7, Sunday-first, padded with nulls for days
 * outside the month) so the view can render a standard calendar.
 */
export type DayStamp = string; // YYYY-MM-DD

const pad = (n: number): string => String(n).padStart(2, '0');

/** The YYYY-MM-DD stamp for a given year/month(1-12)/day. */
export function stamp(year: number, month: number, day: number): DayStamp {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Days in a month (month is 1-12). */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Weekday index (0=Sun..6=Sat) of the first of a month. */
export function firstWeekday(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

/**
 * A month as weeks of 7 cells. Cells before the 1st and after the last day are
 * null (blank). Each in-month cell is its YYYY-MM-DD stamp.
 */
export function monthGrid(year: number, month: number): (DayStamp | null)[][] {
  const total = daysInMonth(year, month);
  const lead = firstWeekday(year, month);
  const cells: (DayStamp | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= total; d++) cells.push(stamp(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (DayStamp | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Advance a year/month(1-12) by delta months, wrapping the year. */
export function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const zero = year * 12 + (month - 1) + delta;
  return { year: Math.floor(zero / 12), month: (zero % 12) + 1 };
}
