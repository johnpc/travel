import { describe, it, expect } from 'vitest';
import { bestWindowLabel } from './planLabels';

describe('bestWindowLabel', () => {
  it('nudges to mark dates when there is no window', () => {
    expect(bestWindowLabel(null)).toMatch(/Mark your dates/);
  });

  it('labels a multi-day window with the count', () => {
    expect(bestWindowLabel({ start: '2027-06-12', end: '2027-06-18', days: 7 })).toBe(
      "Jun 12–18, 2027 — 7 days everyone's free",
    );
  });

  it('labels a single-day window', () => {
    expect(bestWindowLabel({ start: '2027-06-12', end: '2027-06-12', days: 1 })).toBe(
      'Jun 12, 2027 works so far',
    );
  });
});
