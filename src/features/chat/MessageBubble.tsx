import { IonIcon } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import type { MessageRecord } from '../../lib/dataClient';
import { useConfirmRemove } from '../shell/useConfirmRemove';
import { relativeTime } from './relativeTime';
import { linkifySegments } from './linkify';

interface MessageBubbleProps {
  message: MessageRecord;
  /** True when this message was written by the current visitor (own bubble). */
  mine: boolean;
  /** Remove — only wired for your own messages. */
  onRemove?: () => void;
  /** Current time (ms) for the relative "when"; injected so it stays testable. */
  now?: number;
}

/** One chat message: author + when + body, own messages aligned right in accent,
 * with a quiet remove for your own. Name-only identity, so the author is just a
 * name; the timestamp anchors async consensus ("was this said today or a month
 * ago?"). */
export function MessageBubble({
  message: m,
  mine,
  onRemove,
  now = Date.now(),
}: MessageBubbleProps) {
  const confirmRemove = useConfirmRemove('message', m.body, onRemove);
  const when = relativeTime(m.createdAt, now);
  return (
    <li className={mine ? 'chat__msg chat__msg--mine' : 'chat__msg'} data-testid="chat-message">
      <div className="chat__bubble">
        <span className="chat__meta tv-kicker">
          {!mine && <span className="chat__author">{m.authorName}</span>}
          {when && (
            <time className="chat__time" dateTime={m.createdAt ?? undefined}>
              {when}
            </time>
          )}
        </span>
        <span className="chat__body">
          {linkifySegments(m.body).map((s, i) =>
            s.type === 'link' ? (
              <a
                key={i}
                className="chat__link"
                href={s.value}
                target="_blank"
                rel="noopener noreferrer"
              >
                {s.value}
              </a>
            ) : (
              <span key={i}>{s.value}</span>
            ),
          )}
        </span>
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
