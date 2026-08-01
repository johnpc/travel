/**
 * Pure best-date-window finder — unit-tested, no ambient clock. From the trip's
 * availability marks, find the longest run of CONSECUTIVE calendar days that
 * work for the group: every day in the run has ≥ `quorum` people marked FREE and
 * NOBODY marked BUSY (a MAYBE doesn't block). Returns the run's start/end stamps
 * and length, or null if no day qualifies.
 */
import type { AvailabilityRecord } from '../../lib/dataClient';

export interface DateWindow {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  days: number;
}

type Mark = Pick<AvailabilityRecord, 'date' | 'status'>;

/** Days (sorted) where ≥quorum are FREE and none are BUSY. */
function workableDays(marks: Mark[], quorum: number): string[] {
  const free: Record<string, number> = {};
  const busy: Record<string, boolean> = {};
  for (const m of marks) {
    if (m.status === 'FREE') free[m.date] = (free[m.date] ?? 0) + 1;
    else if (m.status === 'BUSY') busy[m.date] = true;
  }
  return Object.keys(free)
    .filter((d) => !busy[d] && free[d] >= quorum)
    .sort();
}

/** Whether `b` is the calendar day immediately after `a` (both YYYY-MM-DD). */
function isNextDay(a: string, b: string): boolean {
  const next = new Date(`${a}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10) === b;
}

export function bestDateWindow(marks: Mark[], quorum = 1): DateWindow | null {
  const days = workableDays(marks, quorum);
  if (days.length === 0) return null;
  let best = { start: days[0], end: days[0], days: 1 };
  let runStart = days[0];
  let runLen = 1;
  for (let i = 1; i < days.length; i++) {
    runLen = isNextDay(days[i - 1], days[i]) ? runLen + 1 : 1;
    if (!isNextDay(days[i - 1], days[i])) runStart = days[i];
    if (runLen > best.days) best = { start: runStart, end: days[i], days: runLen };
  }
  return best;
}
