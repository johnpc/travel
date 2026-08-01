import { IonIcon } from '@ionic/react';
import { sparklesOutline, createOutline } from 'ionicons/icons';
import type { DestinationRecord } from '../../lib/dataClient';

interface DestinationListProps {
  destinations: DestinationRecord[];
}

/** The trip's brainstorm board: each candidate destination as a card with its
 * blurb + why, and a badge marking whether it was AI-suggested or hand-added. */
export function DestinationList({ destinations }: DestinationListProps) {
  return (
    <ul className="dest-list" data-testid="dest-list">
      {destinations.map((d) => (
        <li key={d.id} className="dest-card" data-testid="dest-item">
          <div className="dest-card__head">
            <span className="dest-card__name tv-serif">{d.name}</span>
            <span
              className="dest-card__badge"
              title={d.source === 'AI' ? 'AI suggestion' : 'Added by hand'}
            >
              <IonIcon
                icon={d.source === 'AI' ? sparklesOutline : createOutline}
                aria-hidden="true"
              />
            </span>
          </div>
          {d.blurb && <p className="dest-card__blurb">{d.blurb}</p>}
          {d.why && <p className="dest-card__why tv-muted">{d.why}</p>}
        </li>
      ))}
    </ul>
  );
}
