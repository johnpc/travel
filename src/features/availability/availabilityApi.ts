/**
 * Availability server state via react-query. A member's mark on a day is one row
 * with a DETERMINISTIC id (`<tripId>:<date>:<memberName>`), so re-marking UPSERTS
 * and clearing DELETES. Read all of a trip's marks in one query, aggregate
 * client-side (availTally.ts). Guest CRUD.
 */
import { useMutation } from '@tanstack/react-query';
import {
  dataClient,
  unwrap,
  type AvailabilityRecord,
  type AvailabilityStatus,
} from '../../lib/dataClient';
import { useLiveQuery } from '../../lib/useLiveQuery';
import { upsertMark } from './upsertMark';

/** Stable row id for one member's mark on one day. */
export function markId(tripId: string, date: string, memberName: string): string {
  return `${tripId}:${date}:${memberName}`;
}

/** All availability marks on a trip. */
export async function fetchAvailability(tripId: string): Promise<AvailabilityRecord[]> {
  return unwrap(await dataClient.models.Availability.list({ filter: { tripId: { eq: tripId } } }));
}

export const availabilityKeys = {
  byTrip: (tripId: string) => ['availability', tripId] as const,
};

/** Live-read a trip's marks — collaborators' marks stream in (observeQuery).
 * `enabled` defers until the trip id is known. Order irrelevant (aggregated by
 * day); sort by id for stability. */
export function useAvailability(tripId: string | undefined) {
  return useLiveQuery(
    dataClient.models.Availability,
    { tripId: { eq: tripId } },
    (a: AvailabilityRecord, b: AvailabilityRecord) => a.id.localeCompare(b.id),
    !!tripId,
  );
}

interface MarkArgs {
  date: string;
  memberName: string;
  status: AvailabilityStatus | null;
}

/** Upsert (or, when status is null, clear) this member's mark on a day. */
export function useMarkDay(tripId: string | undefined) {
  return useMutation({
    mutationFn: async ({ date, memberName, status }: MarkArgs): Promise<void> => {
      if (!tripId) throw new Error('No trip to mark availability in');
      await upsertMark(tripId, date, memberName, status);
    },
  });
}

/** Mark a whole span of days at once (tap start → tap end). One write per day;
 * the live subscription reflects them as they land. */
export function useMarkRange(tripId: string | undefined) {
  return useMutation({
    mutationFn: async ({
      dates,
      memberName,
      status,
    }: {
      dates: string[];
      memberName: string;
      status: AvailabilityStatus;
    }): Promise<void> => {
      if (!tripId) throw new Error('No trip to mark availability in');
      for (const date of dates) await upsertMark(tripId, date, memberName, status);
    },
  });
}
