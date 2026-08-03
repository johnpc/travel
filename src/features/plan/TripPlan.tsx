import { IonIcon } from '@ionic/react';
import { calendarOutline, walletOutline, peopleOutline } from 'ionicons/icons';
import { useTripPlan } from './useTripPlan';
import { bestWindowLabel, votedSuffix } from './planLabels';
import { joinNames } from './planCrew';
import { PlanBookCta } from './PlanBookCta';
import { PlanHero } from './PlanHero';
import { useMediaUrl } from '../../lib/useMediaUrl';
import { useWikiPhoto } from '../destinations/useWikiPhoto';
import { formatMoney } from '../budget/computeBudget';
import { scrollToId } from '../../lib/scrollToId';
import './plan.css';

interface TripPlanProps {
  tripId: string | undefined;
  /** Roster size, so the tally can show "N of M voted" (is everyone in yet?). */
  memberCount?: number;
}

/** "The Plan" hero — synthesizes where the group leans into an invitation:
 * {Destination} with {crew}, the best dates, the cost, and (once it all aligns)
 * a "lock it in — book flights & hotels" CTA. Hidden until a front-runner
 * exists. Reads votes/availability/budget already collected. */
export function TripPlan({ tripId, memberCount }: TripPlanProps) {
  const plan = useTripPlan(tripId);
  const generated = useMediaUrl(plan.frontRunner?.imagePath);
  const wiki = useWikiPhoto(plan.frontRunner?.name);
  if (plan.isLoading || plan.isError || !plan.frontRunner) return null;
  const crew = joinNames(plan.crew);
  const img = generated ?? wiki;
  const cls = plan.readyToBook ? 'plan plan--ready' : 'plan';
  return (
    <section className={cls} data-testid="trip-plan">
      <PlanHero src={img} alt={plan.frontRunner.name} />
      <div className="plan__body">
        <p className="tv-kicker">{plan.readyToBook ? 'Your trip' : 'The plan so far'}</p>
        <h2 className="plan__headline tv-serif" data-testid="plan-frontrunner">
          {plan.frontRunner.name}
          {crew ? <span className="plan__crew"> with {crew}</span> : null}
        </h2>
        {plan.bestWindow ? (
          <div className="plan__row" data-testid="plan-dates">
            <IonIcon icon={calendarOutline} className="plan__icon" aria-hidden="true" />
            <span>{bestWindowLabel(plan.bestWindow)}</span>
          </div>
        ) : (
          <button
            type="button"
            className="plan__row plan__row--action"
            data-testid="plan-dates"
            onClick={() => scrollToId('trip-dates')}
          >
            <IonIcon icon={calendarOutline} className="plan__icon" aria-hidden="true" />
            <span>{bestWindowLabel(plan.bestWindow)}</span>
          </button>
        )}
        <div className="plan__row" data-testid="plan-budget">
          <IonIcon icon={walletOutline} className="plan__icon" aria-hidden="true" />
          <span>
            {plan.budget?.hasEstimate ? (
              <>
                <strong>{formatMoney(plan.budget.perPerson)}</strong>
                <span className="tv-muted"> / person</span>
              </>
            ) : (
              <span className="tv-muted">Add a budget estimate to gauge cost</span>
            )}
          </span>
        </div>
        {plan.frontRunnerVotes && (
          <div className="plan__row" data-testid="plan-votes">
            <IonIcon icon={peopleOutline} className="plan__icon" aria-hidden="true" />
            <span className="tv-muted">
              {plan.frontRunnerVotes.yes} in · {plan.frontRunnerVotes.maybe} maybe ·{' '}
              {plan.frontRunnerVotes.no} pass
              {votedSuffix(plan.frontRunnerVotes, memberCount)}
            </span>
          </div>
        )}
        {plan.readyToBook && (
          <PlanBookCta
            destinationName={plan.frontRunner.name}
            dates={
              plan.bestWindow
                ? { start: plan.bestWindow.start, end: plan.bestWindow.end }
                : undefined
            }
          />
        )}
      </div>
    </section>
  );
}
