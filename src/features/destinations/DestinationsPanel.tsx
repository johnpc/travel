import { LoadState } from '../shell/LoadState';
import { AddDestination } from './AddDestination';
import { DestinationList } from './DestinationList';
import { Suggestions } from './Suggestions';
import { VoteControl } from '../interest/VoteControl';
import { useDestinationsPanel } from './useDestinationsPanel';
import './destinations.css';

interface DestinationsPanelProps {
  tripId: string | undefined;
  tripTitle: string;
  /** The current member (name-only identity); enables voting when set. */
  me: string | null;
  /** Roster size, so each vote row can show "N of M voted". */
  memberCount?: number;
}

/** The destinations brainstorm section of a trip: add places by hand, get AI
 * suggestions, see the shared board (sorted by group interest), and vote. */
export function DestinationsPanel({ tripId, tripTitle, me, memberCount }: DestinationsPanelProps) {
  const p = useDestinationsPanel(tripId, tripTitle, me);
  return (
    <section className="destinations" id="trip-destinations" data-testid="destinations">
      <p className="tv-kicker">Destinations</p>
      {!me && p.destinations.length > 0 && (
        <p className="tv-muted destinations__hint" data-testid="vote-hint">
          Pick your name above to vote on these.
        </p>
      )}
      <AddDestination onAdd={p.addManual} isAdding={p.isAdding} />
      <Suggestions
        suggestions={p.suggestions}
        isLoading={p.isSuggesting}
        isError={p.suggestError}
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
        <DestinationList
          destinations={p.destinations}
          tripId={tripId}
          frontRunnerId={p.frontRunnerId}
          onRemove={(d) => p.remove(d.id)}
          renderVote={(d) => (
            <VoteControl
              tally={p.interest.tallies[d.id] ?? { yes: 0, maybe: 0, no: 0, score: 0 }}
              myLevel={p.interest.levelFor(d.id)}
              canVote={p.interest.canVote}
              isVoting={p.interest.isVoting}
              onVote={(level) => p.interest.cast(d.id, level)}
              memberCount={memberCount}
            />
          )}
        />
      </LoadState>
    </section>
  );
}
