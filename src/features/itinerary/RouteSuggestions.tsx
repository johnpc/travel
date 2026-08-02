import { IonButton, IonIcon } from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import type { RouteStop } from './suggestRouteApi';

interface RouteSuggestionsProps {
  suggestions: RouteStop[];
  onAccept: (s: RouteStop) => void;
}

/** AI-proposed route legs the user can add to the itinerary one by one. */
export function RouteSuggestions({ suggestions, onAccept }: RouteSuggestionsProps) {
  if (suggestions.length === 0) return null;
  return (
    <ul className="itin__suggestions" data-testid="route-suggestions">
      {suggestions.map((s) => (
        <li key={s.place} className="itin__suggestion" data-testid="route-suggestion">
          <div className="itin__suggestion-body">
            <span className="stop__place tv-serif">{s.place}</span>
            {s.nights != null && (
              <span className="stop__nights tv-muted">
                {s.nights} {s.nights === 1 ? 'night' : 'nights'}
              </span>
            )}
            {s.note && <p className="stop__note tv-muted">{s.note}</p>}
          </div>
          <IonButton
            size="small"
            onClick={() => onAccept(s)}
            data-testid="route-accept"
            aria-label={`Add ${s.place}`}
          >
            <IonIcon icon={addOutline} slot="icon-only" aria-hidden="true" />
          </IonButton>
        </li>
      ))}
    </ul>
  );
}
