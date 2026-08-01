import { IonIcon } from '@ionic/react';
import { locationOutline, calendarOutline, walletOutline } from 'ionicons/icons';
import { useTripPlan } from './useTripPlan';
import { bestWindowLabel } from './planLabels';
import { formatMoney } from '../budget/computeBudget';
import './plan.css';

interface TripPlanProps {
  tripId: string | undefined;
}

/** "The Plan" — a live synthesis of where the group leans, the best dates
 * everyone's free, and the rough cost. Reads the votes/availability/budget
 * already collected so nobody has to eyeball it all. Hidden until there's a
 * front-runner to show. */
export function TripPlan({ tripId }: TripPlanProps) {
  const plan = useTripPlan(tripId);
  if (plan.isLoading || plan.isError || !plan.frontRunner) return null;
  const v = plan.frontRunnerVotes;
  return (
    <section className="plan" data-testid="trip-plan">
      <p className="tv-kicker">The plan so far</p>
      <div className="plan__row" data-testid="plan-frontrunner">
        <IonIcon icon={locationOutline} className="plan__icon" aria-hidden="true" />
        <span>
          <strong>{plan.frontRunner.name}</strong> is out front
          {v ? (
            <span className="tv-muted">
              {' '}
              · {v.yes} in · {v.maybe} maybe · {v.no} pass
            </span>
          ) : null}
        </span>
      </div>
      <div className="plan__row" data-testid="plan-dates">
        <IonIcon icon={calendarOutline} className="plan__icon" aria-hidden="true" />
        <span>{bestWindowLabel(plan.bestWindow)}</span>
      </div>
      <div className="plan__row" data-testid="plan-budget">
        <IonIcon icon={walletOutline} className="plan__icon" aria-hidden="true" />
        <span>
          {plan.budget?.hasEstimate ? (
            <>
              <strong>{formatMoney(plan.budget.perPerson)}</strong>
              <span className="tv-muted"> / person estimated</span>
            </>
          ) : (
            <span className="tv-muted">Add a budget estimate to gauge cost</span>
          )}
        </span>
      </div>
    </section>
  );
}
