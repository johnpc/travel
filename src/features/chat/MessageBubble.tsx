import { IonIcon } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import type { MessageRecord } from '../../lib/dataClient';
import { useConfirmRemove } from '../shell/useConfirmRemove';

interface MessageBubbleProps {
  message: MessageRecord;
  /** True when this message was written by the current visitor (own bubble). */
  mine: boolean;
  /** Remove — only wired for your own messages. */
  onRemove?: () => void;
}

/** One chat message: author + body, own messages aligned right in accent, with a
 * quiet remove for your own. Name-only identity, so the author is just a name. */
export function MessageBubble({ message: m, mine, onRemove }: MessageBubbleProps) {
  const confirmRemove = useConfirmRemove('message', m.body, onRemove);
  return (
    <li className={mine ? 'chat__msg chat__msg--mine' : 'chat__msg'} data-testid="chat-message">
      <div className="chat__bubble">
        {!mine && <span className="chat__author tv-kicker">{m.authorName}</span>}
        <span className="chat__body">{m.body}</span>
      </div>
      {mine && onRemove && (
        <button
          type="button"
          className="chat__remove"
          data-testid="chat-remove"
          aria-label="Remove message"
          onClick={confirmRemove}
        >
          <IonIcon icon={closeOutline} aria-hidden="true" />
        </button>
      )}
    </li>
  );
}
