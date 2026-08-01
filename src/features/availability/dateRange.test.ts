import { describe, it, expect } from 'vitest';
import { enumerateDays } from './dateRange';

describe('enumerateDays', () => {
  it('lists every day inclusive', () => {
    expect(enumerateDays('2027-06-01', '2027-06-04')).toEqual([
      '2027-06-01',
      '2027-06-02',
      '2027-06-03',
      '2027-06-04',
    ]);
  });

  it('handles reversed inputs and month boundaries', () => {
    expect(enumerateDays('2027-07-01', '2027-06-30')).toEqual(['2027-06-30', '2027-07-01']);
  });

  it('returns a single day when start === end', () => {
    expect(enumerateDays('2027-06-01', '2027-06-01')).toEqual(['2027-06-01']);
  });
});
