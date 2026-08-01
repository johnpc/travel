/**
 * Trip roster server state via react-query. Members are name-only identities
 * scoped to a trip (see CLAUDE.md). Guest CRUD, so anyone with the URL can add
 * themselves or others.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dataClient, unwrap, type MemberRecord } from '../../lib/dataClient';
import { useLiveQuery } from '../../lib/useLiveQuery';

const byName = (a: MemberRecord, b: MemberRecord) => a.name.localeCompare(b.name);

/** All members on a trip, ordered by name for a stable roster display. */
export async function fetchMembers(tripId: string): Promise<MemberRecord[]> {
  const rows = unwrap(await dataClient.models.Member.list({ filter: { tripId: { eq: tripId } } }));
  return [...rows].sort((a, b) => a.name.localeCompare(b.name));
}

export const memberKeys = {
  byTrip: (tripId: string) => ['members', tripId] as const,
};

/** Live-read a trip's roster (observeQuery) — new members appear in real time.
 * `enabled` defers until the trip id is known. */
export function useMembers(tripId: string | undefined) {
  return useLiveQuery(dataClient.models.Member, { tripId: { eq: tripId } }, byName, !!tripId);
}

/** Add a named member to a trip's roster, then refresh the roster query. */
export function useAddMember(tripId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string): Promise<MemberRecord> => {
      if (!tripId) throw new Error('No trip to add a member to');
      const created = unwrap(await dataClient.models.Member.create({ tripId, name: name.trim() }));
      if (!created) throw new Error('Member creation returned no record');
      return created;
    },
    onSuccess: () => {
      if (tripId) qc.invalidateQueries({ queryKey: memberKeys.byTrip(tripId) });
    },
  });
}
