import { IonIcon } from '@ionic/react';
import { arrowForwardOutline } from 'ionicons/icons';
import { formatRange } from '../plan/formatRange';
import type { CandidateWindow } from './candidateWindows';

interface CandidateWindowListProps {
  windows: CandidateWindow[];
  onJump: (w: CandidateWindow) => void;
  /** Roster size, so "N free" becomes "N of M free" (is this everyone?). */
  memberCount?: number;
}

/** How many are free in a window — with the roster size as denominator when
 * known ("3 of 4 free"), so a window that works for the WHOLE crew is obvious. */
function freeLabel(w: CandidateWindow, memberCount?: number): string {
  const count = w.minFree === w.maxFree ? `${w.minFree}` : `${w.minFree}–${w.maxFree}`;
  const denom = memberCount && memberCount >= w.maxFree ? ` of ${memberCount}` : '';
  return `${count}${denom} free`;
}

/** Ranked list of the best date windows for the group — tap one to jump the
 * calendar to it. This is how friends find each other's dates without hunting. */
export function CandidateWindowList({ windows, onJump, memberCount }: CandidateWindowListProps) {
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
              {freeLabel(w, memberCount)}
              {w.days > 1 ? ` · ${w.days} days` : ''}
            </span>
            <IonIcon icon={arrowForwardOutline} aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}
