import { IonIcon } from '@ionic/react';
import { openOutline } from 'ionicons/icons';
import type { ActivityRecord } from '../../lib/dataClient';
import { getYourGuideUrl } from './getYourGuide';

interface ActivityItemProps {
  activity: ActivityRecord;
  destinationName: string;
}

/** One saved activity: category, title, blurb, and a "Find on GetYourGuide"
 * link that opens a real search for this experience at this destination (a
 * search, not a guessed listing, so it always resolves). */
export function ActivityItem({ activity: a, destinationName }: ActivityItemProps) {
  return (
    <li className="acts__item" data-testid="act-item">
      <span className="acts__cat tv-kicker">{a.category}</span>
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
