import { describe, it, expect } from 'vitest';
import { schoolBreaks } from './schoolBreaks';

describe('schoolBreaks', () => {
  it('lists the next occurrence of each break, soonest first', () => {
    const out = schoolBreaks({ year: 2027, month: 1, day: 1 });
    expect(out.map((b) => b.label)).toEqual([
      'Spring Break',
      'Summer Break',
      'Thanksgiving',
      'Winter Holiday',
    ]);
    expect(out[0]).toMatchObject({ start: '2027-03-14', end: '2027-03-21' });
  });

  it('rolls a break whose end already passed to next year', () => {
    // On Aug 1 2027, Spring + Summer are done → they roll to 2028 and sort last.
    const out = schoolBreaks({ year: 2027, month: 8, day: 1 });
    expect(out.map((b) => b.label)).toEqual([
      'Thanksgiving',
      'Winter Holiday',
      'Spring Break',
      'Summer Break',
    ]);
    expect(out.find((b) => b.label === 'Spring Break')?.start).toBe('2028-03-14');
    expect(out.find((b) => b.label === 'Thanksgiving')?.start).toBe('2027-11-22');
  });

  it('keeps a break whose end is today or later in the current year', () => {
    // End day inclusive: on the last day of Spring Break it should still be 2027.
    const out = schoolBreaks({ year: 2027, month: 3, day: 21 });
    expect(out.find((b) => b.label === 'Spring Break')?.start).toBe('2027-03-14');
  });
});
