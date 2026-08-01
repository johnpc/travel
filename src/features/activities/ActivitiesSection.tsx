import { IonButton, IonIcon } from '@ionic/react';
import { sparklesOutline, addOutline } from 'ionicons/icons';
import { LoadState } from '../shell/LoadState';
import { ActivityItem } from './ActivityItem';
import { useActivitiesPanel } from './useActivitiesPanel';
import './activities.css';

interface ActivitiesSectionProps {
  tripId: string | undefined;
  destinationId: string;
  destinationName: string;
}

/** Things to do at one destination: the saved activity list plus an AI
 * "suggest activities" action whose ideas you accept onto the list. Rendered
 * inside an expanded destination card. */
export function ActivitiesSection({
  tripId,
  destinationId,
  destinationName,
}: ActivitiesSectionProps) {
  const p = useActivitiesPanel(tripId, destinationId, destinationName, true);
  return (
    <div className="acts" data-testid="activities">
      <IonButton
        size="small"
        fill="outline"
        onClick={p.runSuggest}
        disabled={p.isSuggesting}
        data-testid="act-suggest"
      >
        <IonIcon icon={sparklesOutline} slot="start" aria-hidden="true" />
        {p.isSuggesting ? 'Thinking…' : 'Suggest activities'}
      </IonButton>
      {p.suggestions.length > 0 && (
        <ul className="acts__suggestions" data-testid="act-suggestions">
          {p.suggestions.map((s) => (
            <li key={s.title} className="acts__suggestion" data-testid="act-suggestion">
              <div>
                <span className="acts__cat tv-kicker">{s.category}</span>
                <span className="acts__title">{s.title}</span>
                <p className="acts__blurb tv-muted">{s.blurb}</p>
              </div>
              <IonButton
                size="small"
                onClick={() => p.accept(s)}
                data-testid="act-accept"
                aria-label={`Add ${s.title}`}
              >
                <IonIcon icon={addOutline} slot="icon-only" aria-hidden="true" />
              </IonButton>
            </li>
          ))}
        </ul>
      )}
      <LoadState
        isLoading={p.isLoading}
        isError={p.isError}
        isEmpty={p.activities.length === 0}
        onRetry={p.refetch}
        emptyTitle="No activities yet"
        emptyMessage="Suggest a few with AI to see what you could do here."
      >
        <ul className="acts__list" data-testid="act-list">
          {p.activities.map((a) => (
            <ActivityItem key={a.id} activity={a} destinationName={destinationName} />
          ))}
        </ul>
      </LoadState>
    </div>
  );
}
