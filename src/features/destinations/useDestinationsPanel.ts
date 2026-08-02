import { useState } from 'react';
import { useAddDestination, useDestinations, useRemoveDestination } from './destinationApi';
import { useSuggestDestinations, type Suggestion } from './suggestApi';
import { useInterest, type InterestView } from '../interest/useInterest';
import { sortByInterest } from './sortByInterest';
import type { DestinationRecord } from '../../lib/dataClient';

/**
 * Destinations panel orchestration: the trip's destination list + manual add +
 * AI suggest/accept + interest votes. Keeps the view dumb. Destinations are
 * sorted by group interest (most-wanted first). Accepting a suggestion adds it
 * as AI-sourced and drops it from the pending list; suggest excludes names
 * already on the board so it never repeats. Voting needs the `me` identity.
 */
export function useDestinationsPanel(
  tripId: string | undefined,
  tripTitle: string,
  me: string | null,
) {
  const listQuery = useDestinations(tripId);
  const addDestination = useAddDestination(tripId);
  const removeDestination = useRemoveDestination(tripId);
  const suggest = useSuggestDestinations();
  const interest: InterestView = useInterest(tripId, me);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const destinations: DestinationRecord[] = sortByInterest(listQuery.data ?? [], interest.tallies);
  // The board is sorted best-first, so the leader is destinations[0] — but only
  // badge it once it has genuine support (score > 0), not in an unvoted trip.
  const top = destinations[0];
  const frontRunnerId = top && (interest.tallies[top.id]?.score ?? 0) > 0 ? top.id : null;

  const addManual = (name: string) => {
    if (name.trim()) addDestination.mutate({ name, source: 'MANUAL' });
  };

  const runSuggest = async () => {
    const exclude = destinations.map((d) => d.name);
    setSuggestions(await suggest.mutateAsync({ tripTitle, exclude }));
  };

  const accept = (s: Suggestion) => {
    addDestination.mutate({ name: s.name, blurb: s.blurb, why: s.why, source: 'AI' });
    setSuggestions((prev) => prev.filter((x) => x.name !== s.name));
  };

  const remove = (id: string) => removeDestination.mutate(id);

  return {
    destinations,
    frontRunnerId,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError || interest.isError,
    refetch: () => {
      listQuery.refetch();
      interest.refetch();
    },
    isAdding: addDestination.isPending,
    addManual,
    suggestions,
    isSuggesting: suggest.isPending,
    runSuggest,
    accept,
    remove,
    interest,
  };
}
