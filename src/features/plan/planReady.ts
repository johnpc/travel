/**
 * Pure "is the plan ready to book?" check — unit-tested. The delight moment
 * ("perfect, let's book it") only fires when all three pillars are settled: a
 * front-runner the crew genuinely agrees on, a date window that works, and a
 * budget.
 */
import type { DateWindow } from './bestWindow';
import type { BudgetTotals } from '../budget/computeBudget';
import type { VoteSplit } from './frontRunner';

interface ReadyInputs {
  /** The front-runner's vote split, or null when there's no front-runner. */
  votes: VoteSplit | null;
  bestWindow: DateWindow | null;
  budget: BudgetTotals | null;
}

/**
 * True when the trip is genuinely ready to lock in: a workable window, a cost
 * estimate, and REAL consensus on the front-runner — at least two people In, and
 * "In" clearly leads (≥ the Maybes and ≥ the Passes). A lone yes, or a board
 * that's mostly "maybe"/"pass", is NOT alignment — so we don't overclaim
 * "you're aligned — lock it in" and nudge a premature booking.
 */
export function isReadyToBook({ votes, bestWindow, budget }: ReadyInputs): boolean {
  if (!votes) return false;
  const consensus = votes.yes >= 2 && votes.yes >= votes.maybe && votes.yes >= votes.no;
  return consensus && !!bestWindow && !!budget?.hasEstimate;
}
