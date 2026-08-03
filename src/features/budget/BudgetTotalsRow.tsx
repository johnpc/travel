import { formatMoney } from './computeBudget';
import type { BudgetTotals } from './computeBudget';

/** The live per-person / per-couple totals row for the budget estimate. */
export function BudgetTotalsRow({ totals }: { totals: BudgetTotals }) {
  return (
    <div className="budget__totals" data-testid="budget-totals">
      <span>
        <strong data-testid="budget-per-person">{formatMoney(totals.perPerson)}</strong> / person
      </span>
      <span>
        <strong data-testid="budget-per-couple">{formatMoney(totals.perCouple)}</strong> / couple
      </span>
    </div>
  );
}
