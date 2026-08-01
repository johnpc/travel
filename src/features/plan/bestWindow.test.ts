import { describe, it, expect } from 'vitest';
import { bestDateWindow } from './bestWindow';
import type { AvailabilityRecord } from '../../lib/dataClient';

const mk = (date: string, status: string) => ({ date, status }) as AvailabilityRecord;

describe('bestDateWindow', () => {
  it('returns null when no day qualifies', () => {
    expect(bestDateWindow([], 1)).toBeNull();
    expect(bestDateWindow([mk('2027-06-01', 'BUSY')], 1)).toBeNull();
  });

  it('finds the longest consecutive run of workable days', () => {
    const marks = [
      mk('2027-06-01', 'FREE'),
      mk('2027-06-02', 'FREE'),
      // gap on the 3rd
      mk('2027-06-05', 'FREE'),
      mk('2027-06-06', 'FREE'),
      mk('2027-06-07', 'FREE'),
    ];
    expect(bestDateWindow(marks, 1)).toEqual({ start: '2027-06-05', end: '2027-06-07', days: 3 });
  });

  it('excludes any day where someone is BUSY, even if others are free', () => {
    const marks = [
      mk('2027-06-01', 'FREE'),
      mk('2027-06-02', 'FREE'),
      mk('2027-06-02', 'BUSY'), // blocks the 2nd
      mk('2027-06-03', 'FREE'),
    ];
    // longest run is a single day (1st, or 3rd) since the 2nd is blocked
    expect(bestDateWindow(marks, 1)?.days).toBe(1);
  });

  it('respects the quorum (needs enough FREE marks)', () => {
    const marks = [
      mk('2027-06-01', 'FREE'),
      mk('2027-06-02', 'FREE'),
      mk('2027-06-02', 'FREE'), // 2nd has 2 free
    ];
    expect(bestDateWindow(marks, 2)).toEqual({ start: '2027-06-02', end: '2027-06-02', days: 1 });
  });

  it('handles month boundaries as consecutive', () => {
    const marks = [mk('2027-06-30', 'FREE'), mk('2027-07-01', 'FREE')];
    expect(bestDateWindow(marks, 1)).toEqual({ start: '2027-06-30', end: '2027-07-01', days: 2 });
  });
});
