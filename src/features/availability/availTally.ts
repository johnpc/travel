/**
 * Pure availability aggregation — unit-tested, no I/O. Turn a flat list of
 * day-marks into per-day tallies (how many are free/maybe/busy) and this
 * member's own mark, so the calendar can shade the days that work for everyone.
 */
import type { AvailabilityRecord, AvailabilityStatus } from '../../lib/dataClient';

export interface DayTally {
  free: number;
  maybe: number;
  busy: number;
  /** Net score: FREE=+1, MAYBE=0, BUSY=-1 — ranks how workable a day is. */
  score: number;
}

type Mark = Pick<AvailabilityRecord, 'date' | 'status' | 'memberName'>;

/** Group marks by date into per-day tallies. */
export function tallyByDay(marks: Mark[]): Record<string, DayTally> {
  const out: Record<string, DayTally> = {};
  for (const m of marks) {
    const t = (out[m.date] ??= { free: 0, maybe: 0, busy: 0, score: 0 });
    const s = m.status as AvailabilityStatus | null;
    if (s === 'FREE') {
      t.free += 1;
      t.score += 1;
    } else if (s === 'MAYBE') {
      t.maybe += 1;
    } else if (s === 'BUSY') {
      t.busy += 1;
      t.score -= 1;
    }
  }
  return out;
}

/** This member's status on a day, or null if unmarked / no identity. */
export function myStatus(
  marks: Mark[],
  date: string,
  memberName: string | null,
): AvailabilityStatus | null {
  if (!memberName) return null;
  const mine = marks.find((m) => m.date === date && m.memberName === memberName);
  return (mine?.status as AvailabilityStatus | null) ?? null;
}

/** Cycle a day's status FREE → BUSY → MAYBE → (clear) → FREE on repeated taps. */
export function nextStatus(current: AvailabilityStatus | null): AvailabilityStatus | null {
  if (current === null) return 'FREE';
  if (current === 'FREE') return 'BUSY';
  if (current === 'BUSY') return 'MAYBE';
  return null;
}
