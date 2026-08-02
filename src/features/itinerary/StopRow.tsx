import { IonIcon } from '@ionic/react';
import { chevronUpOutline, chevronDownOutline, closeOutline } from 'ionicons/icons';
import type { ItineraryStopRecord } from '../../lib/dataClient';
import { useConfirmRemove } from '../shell/useConfirmRemove';

interface StopRowProps {
  stop: ItineraryStopRecord;
  index: number;
  total: number;
  onMove: (index: number, dir: -1 | 1) => void;
  onRemove: () => void;
}

/** One leg of the route: its order number, place + nights, reorder up/down, and a
 * quiet remove. The numbered marker + connecting line read as a travel timeline. */
export function StopRow({ stop, index, total, onMove, onRemove }: StopRowProps) {
  const confirmRemove = useConfirmRemove('stop', stop.place, onRemove);
  return (
    <li className="stop" data-testid="stop-row">
      <span className="stop__marker" aria-hidden="true">
        {index + 1}
      </span>
      <div className="stop__body">
        <span className="stop__place tv-serif">{stop.place}</span>
        {stop.nights != null && (
          <span className="stop__nights tv-muted">
            {stop.nights} {stop.nights === 1 ? 'night' : 'nights'}
          </span>
        )}
        {stop.note && <p className="stop__note tv-muted">{stop.note}</p>}
      </div>
      <div className="stop__actions">
        <button
          type="button"
          className="stop__move"
          disabled={index === 0}
          aria-label={`Move ${stop.place} earlier`}
          data-testid="stop-up"
          onClick={() => onMove(index, -1)}
        >
          <IonIcon icon={chevronUpOutline} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="stop__move"
          disabled={index === total - 1}
          aria-label={`Move ${stop.place} later`}
          data-testid="stop-down"
          onClick={() => onMove(index, 1)}
        >
          <IonIcon icon={chevronDownOutline} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="stop__remove"
          aria-label={`Remove ${stop.place}`}
          data-testid="stop-remove"
          onClick={confirmRemove}
        >
          <IonIcon icon={closeOutline} aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}
