import { IonButton, IonIcon } from '@ionic/react';
import { sparklesOutline } from 'ionicons/icons';
import { LoadState } from '../shell/LoadState';
import { StopRow } from './StopRow';
import { AddStop } from './AddStop';
import { RouteSuggestions } from './RouteSuggestions';
import type { useItineraryPanel } from './useItineraryPanel';

type Panel = ReturnType<typeof useItineraryPanel>;

/** The full itinerary editor: AI-route button, suggestions, the ordered stop
 * list (or a small empty hint), and the add-a-stop form. Shown once the route is
 * opened or has stops — kept out of ItinerarySection so it stays under the line
 * limit and the collapsed teaser carries no editor weight. */
export function ItineraryBody({ panel: p }: { panel: Panel }) {
  return (
    <>
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
        emptyMessage="Add your first stop below, or let AI suggest a route."
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
    </>
  );
}
