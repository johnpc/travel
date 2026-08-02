import { IonIcon } from '@ionic/react';
import { sparklesOutline } from 'ionicons/icons';
import './budget.css';

interface BudgetHeaderProps {
  onEstimate: () => void;
  isEstimating: boolean;
}

/** The rough-budget header: label + an "Estimate with AI" button that fills the
 * fields with a ballpark (flights from DTW, lodging, nights) to verify + edit. */
export function BudgetHeader({ onEstimate, isEstimating }: BudgetHeaderProps) {
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
        <IonIcon icon={sparklesOutline} aria-hidden="true" />
        {isEstimating ? 'Estimating…' : 'Estimate with AI'}
      </button>
    </div>
  );
}
