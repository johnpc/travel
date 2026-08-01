/**
 * Pure candidate-window finder — unit-tested, no ambient clock. Surfaces the
 * best date ranges for the group so nobody has to hunt through months. A window
 * is a maximal run of consecutive days where NOBODY is BUSY and at least one
 * person is FREE; it's scored by how many of the roster are free across it.
 */
import type { AvailabilityRecord } from '../../lib/dataClient';

export interface CandidateWindow {
  start: string; // YYYY-MM-DD
  end: string;
  days: number;
  /** Fewest people free on any single day in the run (the window's guarantee). */
  minFree: number;
  /** Most people free on any day in the run. */
  maxFree: number;
}

type Mark = Pick<AvailabilityRecord, 'date' | 'status'>;

const addDay = (stamp: string): string => {
  const d = new Date(`${stamp}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};

/** Per-day {free count, anyBusy}. */
function perDay(marks: Mark[]): Record<string, { free: number; busy: boolean }> {
  const out: Record<string, { free: number; busy: boolean }> = {};
  for (const m of marks) {
    const cell = (out[m.date] ??= { free: 0, busy: false });
    if (m.status === 'FREE') cell.free += 1;
    else if (m.status === 'BUSY') cell.busy = true;
  }
  return out;
}

/** All maximal consecutive-day windows (no BUSY, ≥1 FREE), longest/most-free first. */
export function candidateWindows(marks: Mark[]): CandidateWindow[] {
  const days = perDay(marks);
  const good = Object.keys(days)
    .filter((d) => !days[d].busy && days[d].free > 0)
    .sort();
  const windows: CandidateWindow[] = [];
  let i = 0;
  while (i < good.length) {
    let j = i;
    while (j + 1 < good.length && addDay(good[j]) === good[j + 1]) j++;
    const run = good.slice(i, j + 1);
    const frees = run.map((d) => days[d].free);
    windows.push({
      start: run[0],
      end: run[run.length - 1],
      days: run.length,
      minFree: Math.min(...frees),
      maxFree: Math.max(...frees),
    });
    i = j + 1;
  }
  return windows.sort((a, b) => b.minFree - a.minFree || b.days - a.days || a.start.localeCompare(b.start)); // prettier-ignore
}

/** The {year, month} (1-12) with the most marks — where to open the calendar. */
export function busiestMonth(marks: Mark[], fallback: { year: number; month: number }) {
  const counts: Record<string, number> = {};
  for (const m of marks) counts[m.date.slice(0, 7)] = (counts[m.date.slice(0, 7)] ?? 0) + 1;
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (!top) return fallback;
  const [y, mo] = top[0].split('-').map(Number);
  return { year: y, month: mo };
}
