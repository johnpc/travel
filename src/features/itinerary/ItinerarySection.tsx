import { IonButton, IonIcon } from '@ionic/react';
import { sparklesOutline, mapOutline } from 'ionicons/icons';
import { LoadState } from '../shell/LoadState';
import { useItineraryPanel } from './useItineraryPanel';
import { StopRow } from './StopRow';
import { AddStop } from './AddStop';
import { RouteSuggestions } from './RouteSuggestions';
import './itinerary.css';

interface ItinerarySectionProps {
  tripId: string | undefined;
  tripTitle: string;
}

/** Multi-city itinerary (opt-in): an ordered, reorderable route of stops with
 * nights each — add by hand or let AI suggest a whole route. Empty until someone
 * adds a stop, so single-destination trips aren't cluttered. */
export function ItinerarySection({ tripId, tripTitle }: ItinerarySectionProps) {
  const p = useItineraryPanel(tripId, tripTitle);
  return (
    <section className="itin" data-testid="itinerary">
      <p className="tv-kicker itin__kicker">
        <IonIcon icon={mapOutline} aria-hidden="true" /> Multi-city route
      </p>
      <p className="tv-muted itin__hint">
        Planning several stops? Build the route in travel order.
      </p>
      <IonButton
        size="small"
        fill="outline"
        onClick={p.runSuggest}
        disabled={p.isSuggesting}
        data-testid="route-suggest"
      >
        <IonIcon icon={sparklesOutline} slot="start" aria-hidden="true" />
        {p.isSuggesting ? 'Planning…' : 'Suggest a route with AI'}
      </IonButton>
      <RouteSuggestions suggestions={p.suggestions} onAccept={p.accept} />
      <LoadState
        isLoading={p.isLoading}
        isError={p.isError}
        isEmpty={p.stops.length === 0 && !p.isSuggesting}
        onRetry={p.refetch}
        emptyTitle="No stops yet"
        emptyMessage="Add your first stop, or let AI suggest a route."
      >
        <ol className="itin__list" data-testid="stop-list">
          {p.stops.map((s, i) => (
            <StopRow
              key={s.id}
              stop={s}
              index={i}
              total={p.stops.length}
              onMove={p.move}
              onRemove={() => p.remove(s.id)}
            />
          ))}
        </ol>
      </LoadState>
      <AddStop onAdd={p.addManual} />
    </section>
  );
}
