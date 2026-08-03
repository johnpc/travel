/**
 * Trip discussion server state via react-query over the Amplify guest client.
 * Messages are the free-form consensus channel on a trip. Guest CRUD, read by
 * tripId, sorted oldest-first (chat order). observeQuery streams new messages
 * in live so the thread updates as the crew talks.
 */
import { useMutation } from '@tanstack/react-query';
import { dataClient, unwrap, type MessageRecord } from '../../lib/dataClient';
import { useLiveQuery } from '../../lib/useLiveQuery';

const byOldest = (a: MessageRecord, b: MessageRecord) =>
  (a.createdAt ?? '').localeCompare(b.createdAt ?? '');

export const chatKeys = {
  byTrip: (tripId: string) => ['messages', tripId] as const,
};

/** Live-read a trip's discussion thread, oldest first (observeQuery). */
export function useMessages(tripId: string | undefined) {
  return useLiveQuery(dataClient.models.Message, { tripId: { eq: tripId } }, byOldest, !!tripId);
}

/** Post a message to the trip thread as the given author (name-only identity).
 * The live query streams it to every collaborator — no manual refresh. */
export function usePostMessage(tripId: string | undefined) {
  return useMutation({
    mutationFn: async (msg: { authorName: string; body: string }): Promise<void> => {
      if (!tripId) throw new Error('No trip to post to');
      const body = msg.body.trim();
      if (!body) return;
      unwrap(await dataClient.models.Message.create({ tripId, authorName: msg.authorName, body }));
    },
  });
}

/** Delete a message (guest delete — remove your own typo); live query updates all. */
export function useRemoveMessage(_tripId: string | undefined) {
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await dataClient.models.Message.delete({ id });
    },
  });
}
