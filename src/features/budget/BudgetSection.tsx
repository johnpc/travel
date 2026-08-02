import { IonButton, IonInput } from '@ionic/react';
import { LoadState } from '../shell/LoadState';
import { useBudgetPanel } from './useBudgetPanel';
import { formatMoney } from './computeBudget';
import { BudgetLinks } from './BudgetLinks';
import { BudgetHeader } from './BudgetHeader';
import './budget.css';

interface BudgetSectionProps {
  tripId: string | undefined;
  destinationId: string;
  destinationName: string;
}

const FIELDS = [
  { key: 'flightPerPerson', label: 'Flight / person', prefix: '$' },
  { key: 'lodgingPerNight', label: 'Lodging / night', prefix: '$' },
  { key: 'nights', label: 'Nights', prefix: '' },
] as const;

/** A rough shared cost estimate for a destination: flight, lodging, nights →
 * live per-person and per-couple totals. Everyone edits the same estimate. */
export function BudgetSection({ tripId, destinationId, destinationName }: BudgetSectionProps) {
  const p = useBudgetPanel(tripId, destinationId, true, destinationName);
  return (
    <div className="budget" data-testid="budget">
      <BudgetHeader onEstimate={p.runEstimate} isEstimating={p.isEstimating} />
      <BudgetLinks destinationName={destinationName} />
      <LoadState isLoading={p.isLoading} isError={p.isError} onRetry={p.refetch}>
        <form
          className="budget__form"
          data-testid="budget-form"
          onSubmit={(e) => {
            e.preventDefault();
            p.submit();
          }}
        >
          <div className="budget__inputs">
            {FIELDS.map((f) => (
              <IonInput
                key={f.key}
                className="budget__field"
                type="number"
                fill="outline"
                label={f.label}
                labelPlacement="stacked"
                inputmode="numeric"
                value={p.form[f.key]}
                data-testid={`budget-${f.key}`}
                onIonInput={(e) => p.set(f.key, e.detail.value ?? '')}
              >
                {f.prefix && (
                  <span slot="start" className="budget__prefix" aria-hidden="true">
                    {f.prefix}
                  </span>
                )}
              </IonInput>
            ))}
          </div>
          <IonInput
            className="budget__field"
            fill="outline"
            label="Season note (optional)"
            labelPlacement="stacked"
            placeholder="High season — book early"
            value={p.form.seasonNote}
            data-testid="budget-season"
            onIonInput={(e) => p.set('seasonNote', e.detail.value ?? '')}
          />
          <div className="budget__totals" data-testid="budget-totals">
            <span>
              <strong data-testid="budget-per-person">{formatMoney(p.totals.perPerson)}</strong> /
              person
            </span>
            <span>
              <strong data-testid="budget-per-couple">{formatMoney(p.totals.perCouple)}</strong> /
              couple
            </span>
          </div>
          <IonButton
            type="submit"
            size="small"
            expand="block"
            disabled={p.isSaving}
            data-testid="budget-save"
          >
            Save estimate
          </IonButton>
        </form>
      </LoadState>
    </div>
  );
}
