/**
 * Itinerary server state via react-query over the Amplify guest client. Stops are
 * ordered legs of a multi-city route on a trip (opt-in). Guest CRUD, read by
 * tripId, sorted by the `order` index. Reordering updates two rows' order values.
 */
import { useMutation } from '@tanstack/react-query';
import { dataClient, unwrap, type ItineraryStopRecord } from '../../lib/dataClient';
import { useLiveQuery } from '../../lib/useLiveQuery';

const byOrder = (a: ItineraryStopRecord, b: ItineraryStopRecord) => (a.order ?? 0) - (b.order ?? 0);

export interface NewStop {
  place: string;
  nights?: number | null;
  note?: string;
  order: number;
  source: 'MANUAL' | 'AI';
}

export const itineraryKeys = {
  byTrip: (tripId: string) => ['itinerary', tripId] as const,
};

/** Live-read a trip's itinerary stops in travel order (observeQuery). */
export function useItinerary(tripId: string | undefined) {
  return useLiveQuery(
    dataClient.models.ItineraryStop,
    { tripId: { eq: tripId } },
    byOrder,
    !!tripId,
  );
}

/** Add a stop to the itinerary (caller supplies the order = append at the end).
 * The live query streams it into the route — no manual refresh. */
export function useAddStop(tripId: string | undefined) {
  return useMutation({
    mutationFn: async (stop: NewStop): Promise<void> => {
      if (!tripId) throw new Error('No trip to add a stop to');
      unwrap(
        await dataClient.models.ItineraryStop.create({
          tripId,
          place: stop.place.trim(),
          nights: stop.nights ?? null,
          note: stop.note,
          order: stop.order,
          source: stop.source,
        }),
      );
    },
  });
}

/** Remove a stop (guest delete); the live query drops it. */
export function useRemoveStop(_tripId: string | undefined) {
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await dataClient.models.ItineraryStop.delete({ id });
    },
  });
}

/** Swap the order of two stops (reorder up/down) in one go; live query reflects it. */
export function useReorderStops(_tripId: string | undefined) {
  return useMutation({
    mutationFn: async (pair: { a: ItineraryStopRecord; b: ItineraryStopRecord }): Promise<void> => {
      await Promise.all([
        dataClient.models.ItineraryStop.update({ id: pair.a.id, order: pair.b.order ?? 0 }),
        dataClient.models.ItineraryStop.update({ id: pair.b.id, order: pair.a.order ?? 0 }),
      ]);
    },
  });
}
