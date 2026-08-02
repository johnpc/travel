import { describe, it, expect } from 'vitest';
import { isReadyToBook } from './planReady';
import type { BudgetTotals } from '../budget/computeBudget';

const win = { start: '2027-06-12', end: '2027-06-18', days: 7 };
const budget = (has: boolean): BudgetTotals => ({ perPerson: 900, perCouple: 1800, hasEstimate: has }); // prettier-ignore

describe('isReadyToBook', () => {
  it('is ready when front-runner + a yes vote + window + budget all present', () => {
    expect(isReadyToBook({ hasFrontRunner: true, yesVotes: 2, bestWindow: win, budget: budget(true) })).toBe(true); // prettier-ignore
  });

  it('is not ready if any pillar is missing', () => {
    expect(isReadyToBook({ hasFrontRunner: false, yesVotes: 2, bestWindow: win, budget: budget(true) })).toBe(false); // prettier-ignore
    expect(isReadyToBook({ hasFrontRunner: true, yesVotes: 0, bestWindow: win, budget: budget(true) })).toBe(false); // prettier-ignore
    expect(isReadyToBook({ hasFrontRunner: true, yesVotes: 2, bestWindow: null, budget: budget(true) })).toBe(false); // prettier-ignore
    expect(isReadyToBook({ hasFrontRunner: true, yesVotes: 2, bestWindow: win, budget: budget(false) })).toBe(false); // prettier-ignore
    expect(isReadyToBook({ hasFrontRunner: true, yesVotes: 2, bestWindow: win, budget: null })).toBe(false); // prettier-ignore
  });
});
