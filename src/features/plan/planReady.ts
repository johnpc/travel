/**
 * Pure "is the plan ready to book?" check — unit-tested. The delight moment
 * ("perfect, let's book it") only fires when all three pillars are settled: a
 * clear front-runner with real support, a date window that works, and a budget.
 */
import type { DateWindow } from './bestWindow';
import type { BudgetTotals } from '../budget/computeBudget';

interface ReadyInputs {
  hasFrontRunner: boolean;
  yesVotes: number;
  bestWindow: DateWindow | null;
  budget: BudgetTotals | null;
}

/** True when the trip is ready to lock in: someone said yes to the front-runner,
 * there's a workable window, and there's a cost estimate. */
export function isReadyToBook(i: ReadyInputs): boolean {
  return i.hasFrontRunner && i.yesVotes >= 1 && !!i.bestWindow && !!i.budget?.hasEstimate;
}
