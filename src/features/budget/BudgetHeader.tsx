import { IonIcon } from '@ionic/react';
import { sparklesOutline, checkmarkOutline } from 'ionicons/icons';
import './budget.css';

interface BudgetHeaderProps {
  onEstimate: () => void;
  isEstimating: boolean;
  /** Brief "Estimated ✓" flash right after the AI fills the fields. */
  justEstimated?: boolean;
}

/** The rough-budget header: label + an "Estimate with AI" button that fills the
 * fields with a ballpark (flights from DTW, lodging, nights) to verify + edit. */
export function BudgetHeader({ onEstimate, isEstimating, justEstimated }: BudgetHeaderProps) {
  const done = justEstimated && !isEstimating;
  const label = isEstimating ? 'Estimating…' : done ? 'Estimated' : 'Estimate with AI';
  return (
    <div className="budget__head">
      <span className="acts__cat tv-kicker">Rough budget</span>
      <button
        type="button"
        className="budget__estimate"
        onClick={onEstimate}
        disabled={isEstimating}
        data-testid="budget-estimate"
      >
        <IonIcon icon={done ? checkmarkOutline : sparklesOutline} aria-hidden="true" />
        {label}
      </button>
    </div>
  );
}
