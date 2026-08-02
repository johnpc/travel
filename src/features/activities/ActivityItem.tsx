import { IonIcon } from '@ionic/react';
import { openOutline, closeOutline } from 'ionicons/icons';
import type { ActivityRecord } from '../../lib/dataClient';
import { useConfirmRemove } from '../shell/useConfirmRemove';
import { getYourGuideUrl } from './getYourGuide';

interface ActivityItemProps {
  activity: ActivityRecord;
  destinationName: string;
  /** Remove this activity from the destination (drop a stray/unwanted idea). */
  onRemove?: () => void;
}

/** One saved activity: category, title, blurb, and a "Find on GetYourGuide"
 * link that opens a real search for this experience at this destination (a
 * search, not a guessed listing, so it always resolves). A quiet × removes it. */
export function ActivityItem({ activity: a, destinationName, onRemove }: ActivityItemProps) {
  const confirmRemove = useConfirmRemove('activity', a.title, onRemove);
  return (
    <li className="acts__item" data-testid="act-item">
      <div className="acts__item-head">
        <span className="acts__cat tv-kicker">{a.category}</span>
        {onRemove && (
          <button
            type="button"
            className="acts__remove"
            data-testid="act-remove"
            aria-label={`Remove ${a.title}`}
            title="Remove activity"
            onClick={confirmRemove}
          >
            <IonIcon icon={closeOutline} aria-hidden="true" />
          </button>
        )}
      </div>
      <span className="acts__title">{a.title}</span>
      {a.blurb && <p className="acts__blurb tv-muted">{a.blurb}</p>}
      <a
        className="acts__link"
        href={getYourGuideUrl(destinationName, a.title)}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="act-gyg"
      >
        <IonIcon icon={openOutline} aria-hidden="true" /> Find on GetYourGuide
      </a>
    </li>
  );
}
