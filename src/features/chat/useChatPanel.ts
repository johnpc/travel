import { useMessages, usePostMessage, useRemoveMessage } from './chatApi';
import type { MessageRecord } from '../../lib/dataClient';

/**
 * Chat panel orchestration for one trip: the live message thread + post + remove.
 * Posting needs the `me` name-only identity (you discuss as yourself); the view
 * gates the composer on it. Keeps the component dumb.
 */
export function useChatPanel(tripId: string | undefined, me: string | null) {
  const listQuery = useMessages(tripId);
  const post = usePostMessage(tripId);
  const remove = useRemoveMessage(tripId);

  const messages: MessageRecord[] = listQuery.data ?? [];

  const send = (body: string) => {
    if (me && body.trim()) post.mutate({ authorName: me, body });
  };

  return {
    messages,
    me,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    refetch: () => listQuery.refetch(),
    send,
    isSending: post.isPending,
    remove: (id: string) => remove.mutate(id),
  };
}
