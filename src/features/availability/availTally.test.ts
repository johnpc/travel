import { describe, it, expect } from 'vitest';
import { tallyByDay, myStatus, nextStatus } from './availTally';
import type { AvailabilityRecord } from '../../lib/dataClient';

const mk = (date: string, memberName: string, status: string) =>
  ({ date, memberName, status }) as AvailabilityRecord;

describe('tallyByDay', () => {
  it('counts free/maybe/busy per day and nets a score', () => {
    const out = tallyByDay([
      mk('2027-03-01', 'Al', 'FREE'),
      mk('2027-03-01', 'Sam', 'FREE'),
      mk('2027-03-01', 'Priya', 'BUSY'),
      mk('2027-03-02', 'Al', 'MAYBE'),
    ]);
    expect(out['2027-03-01']).toEqual({ free: 2, maybe: 0, busy: 1, score: 1 });
    expect(out['2027-03-02']).toEqual({ free: 0, maybe: 1, busy: 0, score: 0 });
  });
});

describe('myStatus', () => {
  const marks = [mk('2027-03-01', 'Alex', 'FREE')];
  it('finds this member’s status, else null', () => {
    expect(myStatus(marks, '2027-03-01', 'Alex')).toBe('FREE');
    expect(myStatus(marks, '2027-03-01', 'Sam')).toBeNull();
    expect(myStatus(marks, '2027-03-02', 'Alex')).toBeNull();
    expect(myStatus(marks, '2027-03-01', null)).toBeNull();
  });
});

describe('nextStatus', () => {
  it('cycles null → FREE → BUSY → MAYBE → null', () => {
    expect(nextStatus(null)).toBe('FREE');
    expect(nextStatus('FREE')).toBe('BUSY');
    expect(nextStatus('BUSY')).toBe('MAYBE');
    expect(nextStatus('MAYBE')).toBeNull();
  });
});
