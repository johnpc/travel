import { useState, type ReactNode } from 'react';
import { IonIcon } from '@ionic/react';
import {
  sparklesOutline,
  createOutline,
  chevronDownOutline,
  chevronUpOutline,
  trophyOutline,
  closeOutline,
} from 'ionicons/icons';
import type { DestinationRecord } from '../../lib/dataClient';
import { ActivitiesSection } from '../activities/ActivitiesSection';
import { BudgetSection } from '../budget/BudgetSection';
import { DestinationImage } from './DestinationImage';

interface DestinationCardProps {
  destination: DestinationRecord;
  tripId: string | undefined;
  /** True when this is the group's front-runner — badges the card. */
  isFrontRunner?: boolean;
  /** Optional vote control rendered under the card (interest slice). */
  vote?: ReactNode;
  /** Remove this destination from the board (undo a mistaken/unwanted place). */
  onRemove?: () => void;
}

/** One destination on the board: name + source badge, blurb, why, a vote
 * control slot, and an expandable "things to do here" activities section. The
 * front-runner card wears a badge + accent so the leader is obvious. */
export function DestinationCard({
  destination: d,
  tripId,
  isFrontRunner,
  vote,
  onRemove,
}: DestinationCardProps) {
  const [open, setOpen] = useState(false);
  const confirmRemove = () => {
    if (onRemove && window.confirm(`Remove ${d.name} from the board?`)) onRemove();
  };
  return (
    <li
      className={isFrontRunner ? 'dest-card dest-card--leader' : 'dest-card'}
      data-testid="dest-item"
    >
      {isFrontRunner && (
        <span className="dest-card__leader-badge" data-testid="dest-frontrunner">
          <IonIcon icon={trophyOutline} aria-hidden="true" /> Front-runner
        </span>
      )}
      <div className="dest-card__head">
        <span className="dest-card__name tv-serif">{d.name}</span>
        <span
          className="dest-card__badge"
          title={d.source === 'AI' ? 'AI suggestion' : 'Added by hand'}
        >
          <IonIcon icon={d.source === 'AI' ? sparklesOutline : createOutline} aria-hidden="true" />
        </span>
        {onRemove && (
          <button
            type="button"
            className="dest-card__remove"
            data-testid="dest-remove"
            aria-label={`Remove ${d.name}`}
            title="Remove from board"
            onClick={confirmRemove}
          >
            <IonIcon icon={closeOutline} aria-hidden="true" />
          </button>
        )}
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
