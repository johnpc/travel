/**
 * Destination server state via react-query over the Amplify guest client.
 * Destinations are candidate places on a trip's brainstorm — added manually or
 * accepted from an AI suggestion. Guest CRUD, read by tripId.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dataClient, unwrap, type DestinationRecord } from '../../lib/dataClient';
import { useLiveQuery } from '../../lib/useLiveQuery';

const byNewest = (a: DestinationRecord, b: DestinationRecord) =>
  (b.createdAt ?? '').localeCompare(a.createdAt ?? '');

export interface NewDestination {
  name: string;
  blurb?: string;
  why?: string;
  source: 'MANUAL' | 'AI';
}

/** All destinations on a trip, newest first. */
export async function fetchDestinations(tripId: string): Promise<DestinationRecord[]> {
  const rows = unwrap(
    await dataClient.models.Destination.list({ filter: { tripId: { eq: tripId } } }),
  );
  return [...rows].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
}

export const destinationKeys = {
  byTrip: (tripId: string) => ['destinations', tripId] as const,
};

/** Live-read a trip's destinations — updates stream in as collaborators change
 * them (observeQuery). `enabled` defers until the trip id is known. */
export function useDestinations(tripId: string | undefined) {
  return useLiveQuery(
    dataClient.models.Destination,
    { tripId: { eq: tripId } },
    byNewest,
    !!tripId,
  );
}

/** Add a destination to a trip, then refresh the list. */
export function useAddDestination(tripId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dest: NewDestination): Promise<DestinationRecord> => {
      if (!tripId) throw new Error('No trip to add a destination to');
      const created = unwrap(
        await dataClient.models.Destination.create({
          tripId,
          name: dest.name.trim(),
          blurb: dest.blurb,
          why: dest.why,
          source: dest.source,
        }),
      );
      if (!created) throw new Error('Destination creation returned no record');
      return created;
    },
    onSuccess: () => {
      if (tripId) qc.invalidateQueries({ queryKey: destinationKeys.byTrip(tripId) });
    },
  });
}

/** Remove a destination from the board (guest delete) — undo a mistaken, duplicate
 * or unwanted place so it stops skewing the votes. The live query drops it. */
export function useRemoveDestination(tripId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await dataClient.models.Destination.delete({ id });
    },
    onSuccess: () => {
      if (tripId) qc.invalidateQueries({ queryKey: destinationKeys.byTrip(tripId) });
    },
  });
}
