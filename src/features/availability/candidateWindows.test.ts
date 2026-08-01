import { describe, it, expect } from 'vitest';
import { candidateWindows, busiestMonth } from './candidateWindows';
import type { AvailabilityRecord } from '../../lib/dataClient';

const mk = (date: string, status: string) => ({ date, status }) as AvailabilityRecord;

describe('candidateWindows', () => {
  it('returns maximal consecutive runs with min/max free counts', () => {
    const marks = [
      mk('2027-06-01', 'FREE'),
      mk('2027-06-02', 'FREE'),
      mk('2027-06-02', 'FREE'), // 2 free on the 2nd
      // gap
      mk('2027-06-10', 'FREE'),
    ];
    const w = candidateWindows(marks);
    expect(w).toHaveLength(2);
    expect(w[0]).toMatchObject({ start: '2027-06-01', end: '2027-06-02', days: 2, minFree: 1, maxFree: 2 }); // prettier-ignore
    expect(w[1]).toMatchObject({ start: '2027-06-10', days: 1 });
  });

  it('excludes any day where someone is BUSY (splits the run)', () => {
    const marks = [
      mk('2027-06-01', 'FREE'),
      mk('2027-06-02', 'FREE'),
      mk('2027-06-02', 'BUSY'),
      mk('2027-06-03', 'FREE'),
    ];
    const w = candidateWindows(marks);
    expect(w.map((x) => x.start)).toEqual(['2027-06-01', '2027-06-03']);
    expect(w.every((x) => x.days === 1)).toBe(true);
  });

  it('ranks by min-free, then length', () => {
    const marks = [
      mk('2027-06-01', 'FREE'), // window A: 1 free, 1 day
      mk('2027-07-01', 'FREE'),
      mk('2027-07-01', 'FREE'), // window B: 2 free, 1 day → ranks first
    ];
    expect(candidateWindows(marks)[0].start).toBe('2027-07-01');
  });

  it('returns [] when nothing is workable', () => {
    expect(candidateWindows([mk('2027-06-01', 'BUSY')])).toEqual([]);
  });
});

describe('busiestMonth', () => {
  it('returns the month with the most marks', () => {
    const marks = [mk('2027-06-01', 'FREE'), mk('2027-07-01', 'FREE'), mk('2027-07-02', 'FREE')];
    expect(busiestMonth(marks, { year: 2000, month: 1 })).toEqual({ year: 2027, month: 7 });
  });

  it('falls back when there are no marks', () => {
    expect(busiestMonth([], { year: 2027, month: 3 })).toEqual({ year: 2027, month: 3 });
  });
});
