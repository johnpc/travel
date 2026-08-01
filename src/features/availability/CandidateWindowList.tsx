import { IonIcon } from '@ionic/react';
import { arrowForwardOutline } from 'ionicons/icons';
import { formatRange } from '../plan/formatRange';
import type { CandidateWindow } from './candidateWindows';

interface CandidateWindowListProps {
  windows: CandidateWindow[];
  onJump: (w: CandidateWindow) => void;
}

/** Ranked list of the best date windows for the group — tap one to jump the
 * calendar to it. This is how friends find each other's dates without hunting. */
export function CandidateWindowList({ windows, onJump }: CandidateWindowListProps) {
  if (windows.length === 0) return null;
  return (
    <ul className="cwins" data-testid="candidate-windows">
      {windows.map((w) => (
        <li key={w.start}>
          <button
            type="button"
            className="cwins__item"
            data-testid="candidate-window"
            onClick={() => onJump(w)}
          >
            <span className="cwins__range tv-serif">{formatRange(w.start, w.end)}</span>
            <span className="cwins__meta tv-muted">
              {w.minFree === w.maxFree ? `${w.minFree} free` : `${w.minFree}–${w.maxFree} free`}
              {w.days > 1 ? ` · ${w.days} days` : ''}
            </span>
            <IonIcon icon={arrowForwardOutline} aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}
