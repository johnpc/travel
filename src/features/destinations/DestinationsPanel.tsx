import { LoadState } from '../shell/LoadState';
import { AddDestination } from './AddDestination';
import { DestinationList } from './DestinationList';
import { Suggestions } from './Suggestions';
import { useDestinationsPanel } from './useDestinationsPanel';
import './destinations.css';

interface DestinationsPanelProps {
  tripId: string | undefined;
  tripTitle: string;
}

/** The destinations brainstorm section of a trip: add places by hand, get AI
 * suggestions, and see the shared board everyone's building. */
export function DestinationsPanel({ tripId, tripTitle }: DestinationsPanelProps) {
  const p = useDestinationsPanel(tripId, tripTitle);
  return (
    <section className="destinations" data-testid="destinations">
      <p className="tv-kicker">Destinations</p>
      <AddDestination onAdd={p.addManual} isAdding={p.isAdding} />
      <Suggestions
        suggestions={p.suggestions}
        isLoading={p.isSuggesting}
        onSuggest={p.runSuggest}
        onAccept={p.accept}
      />
      <LoadState
        isLoading={p.isLoading}
        isError={p.isError}
        isEmpty={p.destinations.length === 0}
        onRetry={p.refetch}
        emptyTitle="No destinations yet"
        emptyMessage="Add a place above, or let AI suggest a few to get the ideas flowing."
      >
        <DestinationList destinations={p.destinations} />
      </LoadState>
    </section>
  );
}
