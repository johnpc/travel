import { describe, it, expect } from 'vitest';
import { computeBudget, formatMoney } from './computeBudget';

describe('computeBudget', () => {
  it('splits shared lodging across a couple for per-person, doubles for per-couple', () => {
    // flight 500/person, lodging 200/night × 4 nights = 800 (one room)
    const t = computeBudget({ flightPerPerson: 500, lodgingPerNight: 200, nights: 4 });
    expect(t.perPerson).toBe(500 + 800 / 2); // 900
    expect(t.perCouple).toBe(500 * 2 + 800); // 1800
    expect(t.hasEstimate).toBe(true);
  });

  it('treats missing/zero/negative inputs as 0 and flags no estimate', () => {
    const t = computeBudget({ flightPerPerson: null, lodgingPerNight: 0, nights: -3 });
    expect(t).toEqual({ perPerson: 0, perCouple: 0, hasEstimate: false });
  });

  it('handles flight-only (no lodging)', () => {
    const t = computeBudget({ flightPerPerson: 300 });
    expect(t.perPerson).toBe(300);
    expect(t.perCouple).toBe(600);
    expect(t.hasEstimate).toBe(true);
  });
});

describe('formatMoney', () => {
  it('formats with a $ and thousands separators, rounding', () => {
    expect(formatMoney(1234.6)).toBe('$1,235');
    expect(formatMoney(0)).toBe('$0');
  });
});
