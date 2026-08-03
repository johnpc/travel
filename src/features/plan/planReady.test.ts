import { describe, it, expect } from 'vitest';
import { isReadyToBook } from './planReady';
import type { BudgetTotals } from '../budget/computeBudget';

const win = { start: '2027-06-12', end: '2027-06-18', days: 7 };
const budget = (has: boolean): BudgetTotals => ({ perPerson: 900, perCouple: 1800, hasEstimate: has }); // prettier-ignore
// A ready plan: all pillars present + genuine consensus (2 In leading).
const votes = (yes: number, maybe = 0, no = 0) => ({ yes, maybe, no });
const base = { votes: votes(2), bestWindow: win, budget: budget(true) };

describe('isReadyToBook', () => {
  it('is ready when front-runner consensus + window + budget all present', () => {
    expect(isReadyToBook(base)).toBe(true);
    // In can tie the Maybes/Passes and still lead
    expect(isReadyToBook({ ...base, votes: votes(2, 2, 2) })).toBe(true);
  });

  it('is NOT ready on a lone yes — one vote is not group alignment', () => {
    expect(isReadyToBook({ ...base, votes: votes(1) })).toBe(false);
  });

  it('is NOT ready when In does not lead the Maybes or Passes', () => {
    expect(isReadyToBook({ ...base, votes: votes(2, 3) })).toBe(false);
    expect(isReadyToBook({ ...base, votes: votes(2, 0, 3) })).toBe(false);
  });

  it('is not ready if any pillar is missing', () => {
    expect(isReadyToBook({ ...base, votes: null })).toBe(false); // no front-runner
    expect(isReadyToBook({ ...base, votes: votes(0) })).toBe(false);
    expect(isReadyToBook({ ...base, bestWindow: null })).toBe(false);
    expect(isReadyToBook({ ...base, budget: budget(false) })).toBe(false);
    expect(isReadyToBook({ ...base, budget: null })).toBe(false);
  });
});
