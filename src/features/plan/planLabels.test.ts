import { describe, it, expect } from 'vitest';
import { bestWindowLabel, votedSuffix, planKicker } from './planLabels';

describe('bestWindowLabel', () => {
  it('nudges to mark dates when there is no window', () => {
    expect(bestWindowLabel(null)).toMatch(/Mark your dates/);
  });

  it('labels a multi-day window without overclaiming everyone is free', () => {
    // A window only means someone's free + nobody's blocked, so it must NOT say
    // "everyone's free" — the per-window "N of M free" carries the real count.
    const label = bestWindowLabel({ start: '2027-06-12', end: '2027-06-18', days: 7 });
    expect(label).toBe('Jun 12–18, 2027 — 7 days that work so far');
    expect(label).not.toMatch(/everyone/i);
  });

  it('labels a single-day window', () => {
    expect(bestWindowLabel({ start: '2027-06-12', end: '2027-06-12', days: 1 })).toBe(
      'Jun 12, 2027 works so far',
    );
  });
});

describe('votedSuffix', () => {
  it('shows N of M voted when the roster size is a plausible denominator', () => {
    expect(votedSuffix({ yes: 2, maybe: 1, no: 0 }, 4)).toBe(' · 3 of 4 voted');
  });

  it('is empty when the roster size is unknown', () => {
    expect(votedSuffix({ yes: 2, maybe: 1, no: 0 })).toBe('');
  });

  it('is empty when the count exceeds the roster (implausible denominator)', () => {
    expect(votedSuffix({ yes: 3, maybe: 2, no: 1 }, 4)).toBe('');
  });
});

describe('planKicker', () => {
  it('claims the trip for a joined member', () => {
    expect(planKicker(false, true)).toBe('The plan so far');
    expect(planKicker(true, true)).toBe('Your trip');
  });

  it("frames it as the crew's (an invitation) for a visitor who hasn't joined", () => {
    expect(planKicker(false, false)).toBe('Where the crew is leaning');
    expect(planKicker(true, false)).toBe("The crew's pick");
  });
});
