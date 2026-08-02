import { useState } from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { LoadState } from '../shell/LoadState';
import { CalendarGrid } from './CalendarGrid';
import { CandidateWindowList } from './CandidateWindowList';
import { SchoolBreakChips } from './SchoolBreakChips';
import { useAvailabilityPanel } from './useAvailabilityPanel';
import './availability.css';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; // prettier-ignore

interface AvailabilityPanelProps {
  tripId: string | undefined;
  me: string | null;
  /** Today (injected for determinism); the panel opens on the busiest month with
   * marks (falling back to this) and dates school-break quick-picks from it. */
  start: { year: number; month: number; day: number };
}

/** The date-availability section: candidate windows up top (tap to jump), then a
 * month calendar. Marking a range (tap start → tap end) sets you FREE across the
 * span; a single-day mode cycles free/busy/maybe for fine control. */
export function AvailabilityPanel({ tripId, me, start }: AvailabilityPanelProps) {
  const p = useAvailabilityPanel(tripId, me, start);
  const [rangeMode, setRangeMode] = useState(true);
  return (
    <section className="availability" id="trip-dates" data-testid="availability">
      <p className="tv-kicker">When can we go?</p>
      {!me && <p className="tv-muted avail__hint">Pick your name above to mark your dates.</p>}
      <LoadState isLoading={p.isLoading} isError={p.isError} onRetry={p.refetch}>
        <CandidateWindowList windows={p.windows} onJump={p.jumpTo} />
        <SchoolBreakChips breaks={p.breaks} onPick={p.pickBreak} />
        {me && (
          <div className="avail__modes" role="group" aria-label="How tapping a day works">
            <button
              type="button"
              className={rangeMode ? 'avail__mode avail__mode--on' : 'avail__mode'}
              data-testid="mode-range"
              onClick={() => setRangeMode(true)}
            >
              {p.rangeStart ? 'Tap the end day…' : "Mark when I'm free"}
            </button>
            <button
              type="button"
              className={!rangeMode ? 'avail__mode avail__mode--on' : 'avail__mode'}
              data-testid="mode-single"
              onClick={() => setRangeMode(false)}
            >
              Edit single days
            </button>
          </div>
        )}
        <div className="cal__nav">
          <IonButton
            fill="clear"
            size="small"
            onClick={p.prevMonth}
            data-testid="cal-prev"
            aria-label="Previous month"
          >
            <IonIcon icon={chevronBackOutline} slot="icon-only" />
          </IonButton>
          <span className="cal__title tv-serif" data-testid="cal-title">
            {MONTHS[p.month - 1]} {p.year}
          </span>
          <IonButton
            fill="clear"
            size="small"
            onClick={p.nextMonth}
            data-testid="cal-next"
            aria-label="Next month"
          >
            <IonIcon icon={chevronForwardOutline} slot="icon-only" />
          </IonButton>
        </div>
        <CalendarGrid
          weeks={p.weeks}
          tallies={p.tallies}
          statusFor={p.statusFor}
          inRange={p.inRange}
          canMark={p.canMark}
          onTap={rangeMode ? p.pickRange : p.toggle}
        />
      </LoadState>
    </section>
  );
}
