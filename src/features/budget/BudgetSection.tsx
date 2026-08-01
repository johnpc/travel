import { IonButton, IonInput } from '@ionic/react';
import { LoadState } from '../shell/LoadState';
import { useBudgetPanel } from './useBudgetPanel';
import { formatMoney } from './computeBudget';
import './budget.css';

interface BudgetSectionProps {
  tripId: string | undefined;
  destinationId: string;
}

const FIELDS = [
  { key: 'flightPerPerson', label: 'Flight / person' },
  { key: 'lodgingPerNight', label: 'Lodging / night' },
  { key: 'nights', label: 'Nights' },
] as const;

/** A rough shared cost estimate for a destination: flight, lodging, nights →
 * live per-person and per-couple totals. Everyone edits the same estimate. */
export function BudgetSection({ tripId, destinationId }: BudgetSectionProps) {
  const p = useBudgetPanel(tripId, destinationId, true);
  return (
    <div className="budget" data-testid="budget">
      <span className="acts__cat tv-kicker">Rough budget</span>
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
                type="number"
                label={f.label}
                labelPlacement="stacked"
                inputmode="numeric"
                value={p.form[f.key]}
                data-testid={`budget-${f.key}`}
                onIonInput={(e) => p.set(f.key, e.detail.value ?? '')}
              />
            ))}
          </div>
          <IonInput
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
