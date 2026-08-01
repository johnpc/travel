/**
 * Interest (vote) server state via react-query. A member's vote on a destination
 * is one row with a DETERMINISTIC id (`<tripId>:<destinationId>:<memberName>`),
 * so casting again UPSERTS instead of duplicating. Read all of a trip's votes in
 * one query and aggregate client-side (see tally.ts). Guest CRUD.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dataClient, unwrap, type InterestLevel, type InterestRecord } from '../../lib/dataClient';
import { useLiveQuery } from '../../lib/useLiveQuery';

/** Stable row id for one member's vote on one destination. */
export function voteId(tripId: string, destinationId: string, memberName: string): string {
  return `${tripId}:${destinationId}:${memberName}`;
}

/** All votes on a trip (aggregated per destination in the UI). */
export async function fetchInterests(tripId: string): Promise<InterestRecord[]> {
  return unwrap(await dataClient.models.Interest.list({ filter: { tripId: { eq: tripId } } }));
}

export const interestKeys = {
  byTrip: (tripId: string) => ['interests', tripId] as const,
};

/** Live-read a trip's votes — collaborators' votes stream in (observeQuery).
 * `enabled` defers until the trip id is known. Order is irrelevant (aggregated),
 * so sort by id for stability. */
export function useInterests(tripId: string | undefined) {
  return useLiveQuery(
    dataClient.models.Interest,
    { tripId: { eq: tripId } },
    (a: InterestRecord, b: InterestRecord) => a.id.localeCompare(b.id),
    !!tripId,
  );
}

interface CastArgs {
  destinationId: string;
  memberName: string;
  level: InterestLevel;
}

/** Upsert this member's vote on a destination, then refresh the trip's votes. */
export function useCastVote(tripId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ destinationId, memberName, level }: CastArgs): Promise<void> => {
      if (!tripId) throw new Error('No trip to vote in');
      const id = voteId(tripId, destinationId, memberName);
      // create-or-update: try create, fall back to update if the row exists.
      const created = await dataClient.models.Interest.create({
        id,
        tripId,
        destinationId,
        memberName,
        level,
      });
      if (created.errors?.length) {
        unwrap(await dataClient.models.Interest.update({ id, level }));
      }
    },
    onSuccess: () => {
      if (tripId) qc.invalidateQueries({ queryKey: interestKeys.byTrip(tripId) });
    },
  });
}
