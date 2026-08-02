import { IonIcon } from '@ionic/react';
import { chatbubblesOutline } from 'ionicons/icons';
import { LoadState } from '../shell/LoadState';
import { useChatPanel } from './useChatPanel';
import { MessageBubble } from './MessageBubble';
import { ChatComposer } from './ChatComposer';
import './chat.css';

interface ChatSectionProps {
  tripId: string | undefined;
  me: string | null;
}

/** Trip discussion: the free-form channel where the crew hashes out final
 * consensus. Live thread + composer (gated on identity — pick your name to chat).
 * The piece that structured votes/dates can't capture. */
export function ChatSection({ tripId, me }: ChatSectionProps) {
  const p = useChatPanel(tripId, me);
  return (
    <section className="chat" id="trip-chat" data-testid="chat">
      <p className="tv-kicker chat__kicker">
        <IonIcon icon={chatbubblesOutline} aria-hidden="true" /> Discussion
      </p>
      <LoadState
        isLoading={p.isLoading}
        isError={p.isError}
        isEmpty={p.messages.length === 0}
        onRetry={p.refetch}
        emptyTitle="No messages yet"
        emptyMessage="Start the conversation — hash out the details and lock it in."
      >
        <ul className="chat__list" data-testid="chat-list">
          {p.messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              mine={!!me && m.authorName === me}
              onRemove={() => p.remove(m.id)}
            />
          ))}
        </ul>
      </LoadState>
      {me ? (
        <ChatComposer onSend={p.send} isSending={p.isSending} />
      ) : (
        <p className="tv-muted chat__gate" data-testid="chat-gate">
          Pick your name above to join the conversation.
        </p>
      )}
    </section>
  );
}
