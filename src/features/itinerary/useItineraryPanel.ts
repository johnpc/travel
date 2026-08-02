import { useState } from 'react';
import { useItinerary, useAddStop, useRemoveStop, useReorderStops } from './itineraryApi';
import { useSuggestRoute, type RouteStop } from './suggestRouteApi';
import type { ItineraryStopRecord } from '../../lib/dataClient';

/**
 * Itinerary panel orchestration for one trip: the ordered stops + manual add, AI
 * route suggest/accept, remove, and reorder (move a stop up/down). Keeps the view
 * dumb. Multi-city is opt-in — the section is empty until someone adds a stop.
 */
export function useItineraryPanel(tripId: string | undefined, tripTitle: string) {
  const listQuery = useItinerary(tripId);
  const addStop = useAddStop(tripId);
  const removeStop = useRemoveStop(tripId);
  const reorder = useReorderStops(tripId);
  const suggest = useSuggestRoute();
  const [suggestions, setSuggestions] = useState<RouteStop[]>([]);

  const stops: ItineraryStopRecord[] = listQuery.data ?? [];
  const nextOrder = () => (stops.length ? Math.max(...stops.map((s) => s.order ?? 0)) + 1 : 0);

  const addManual = (place: string, nights?: number | null) => {
    if (place.trim()) addStop.mutate({ place, nights, order: nextOrder(), source: 'MANUAL' });
  };

  const runSuggest = async () => {
    const exclude = stops.map((s) => s.place);
    setSuggestions(await suggest.mutateAsync({ theme: tripTitle, exclude }));
  };

  const accept = (s: RouteStop) => {
    addStop.mutate({
      place: s.place,
      nights: s.nights,
      note: s.note,
      order: nextOrder(),
      source: 'AI',
    });
    setSuggestions((prev) => prev.filter((x) => x.place !== s.place));
  };

  // Move a stop one position earlier/later by swapping order with its neighbor.
  const move = (index: number, dir: -1 | 1) => {
    const a = stops[index];
    const b = stops[index + dir];
    if (a && b) reorder.mutate({ a, b });
  };

  return {
    stops,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    refetch: () => listQuery.refetch(),
    addManual,
    remove: (id: string) => removeStop.mutate(id),
    move,
    suggestions,
    isSuggesting: suggest.isPending,
    runSuggest,
    accept,
  };
}
