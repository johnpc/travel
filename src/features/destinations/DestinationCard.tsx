import { useState, type ReactNode } from 'react';
import { IonIcon } from '@ionic/react';
import {
  sparklesOutline,
  createOutline,
  chevronDownOutline,
  chevronUpOutline,
} from 'ionicons/icons';
import type { DestinationRecord } from '../../lib/dataClient';
import { ActivitiesSection } from '../activities/ActivitiesSection';
import { BudgetSection } from '../budget/BudgetSection';
import { DestinationImage } from './DestinationImage';

interface DestinationCardProps {
  destination: DestinationRecord;
  tripId: string | undefined;
  /** Optional vote control rendered under the card (interest slice). */
  vote?: ReactNode;
}

/** One destination on the board: name + source badge, blurb, why, a vote
 * control slot, and an expandable "things to do here" activities section. */
export function DestinationCard({ destination: d, tripId, vote }: DestinationCardProps) {
  const [open, setOpen] = useState(false);
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
      <DestinationImage tripId={tripId} destination={d} />
      {vote}
      <button
        type="button"
        className="dest-card__toggle"
        aria-expanded={open}
        data-testid="dest-activities-toggle"
        onClick={() => setOpen((v) => !v)}
      >
        <IonIcon icon={open ? chevronUpOutline : chevronDownOutline} aria-hidden="true" />
        {open ? 'Hide things to do' : 'Things to do here'}
      </button>
      {open && (
        <>
          <ActivitiesSection tripId={tripId} destinationId={d.id} destinationName={d.name} />
          <BudgetSection tripId={tripId} destinationId={d.id} />
        </>
      )}
    </li>
  );
}
