import { useState } from 'react';
import { useAddDestination, useDestinations } from './destinationApi';
import { useSuggestDestinations, type Suggestion } from './suggestApi';
import type { DestinationRecord } from '../../lib/dataClient';

/**
 * Destinations panel orchestration: the trip's destination list + manual add +
 * AI suggest/accept. Keeps the view dumb. Accepting a suggestion adds it as an
 * AI-sourced Destination and removes it from the pending suggestion list; the
 * suggest call excludes names already on the board so it never repeats them.
 */
export function useDestinationsPanel(tripId: string | undefined, tripTitle: string) {
  const listQuery = useDestinations(tripId);
  const destinations: DestinationRecord[] = listQuery.data ?? [];
  const addDestination = useAddDestination(tripId);
  const suggest = useSuggestDestinations();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

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

  return {
    destinations,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    refetch: () => listQuery.refetch(),
    isAdding: addDestination.isPending,
    addManual,
    suggestions,
    isSuggesting: suggest.isPending,
    runSuggest,
    accept,
  };
}
