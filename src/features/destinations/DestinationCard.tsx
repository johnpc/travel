import type { ReactNode } from 'react';
import { IonIcon } from '@ionic/react';
import { sparklesOutline, createOutline } from 'ionicons/icons';
import type { DestinationRecord } from '../../lib/dataClient';

interface DestinationCardProps {
  destination: DestinationRecord;
  /** Optional vote control rendered under the card (interest slice). */
  vote?: ReactNode;
}

/** One destination on the board: name + source badge, blurb, why, and an
 * optional vote control slot. */
export function DestinationCard({ destination: d, vote }: DestinationCardProps) {
  return (
    <li className="dest-card" data-testid="dest-item">
      <div className="dest-card__head">
        <span className="dest-card__name tv-serif">{d.name}</span>
        <span
          className="dest-card__badge"
          title={d.source === 'AI' ? 'AI suggestion' : 'Added by hand'}
        >
          <IonIcon icon={d.source === 'AI' ? sparklesOutline : createOutline} aria-hidden="true" />
        </span>
      </div>
      {d.blurb && <p className="dest-card__blurb">{d.blurb}</p>}
      {d.why && <p className="dest-card__why tv-muted">{d.why}</p>}
      {vote}
    </li>
  );
}
