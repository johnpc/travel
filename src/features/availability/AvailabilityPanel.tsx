import { IonButton, IonIcon } from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { LoadState } from '../shell/LoadState';
import { DayCell } from './DayCell';
import { useAvailabilityPanel } from './useAvailabilityPanel';
import './availability.css';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; // prettier-ignore
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface AvailabilityPanelProps {
  tripId: string | undefined;
  me: string | null;
  /** Month to open on (injected for determinism). */
  start: { year: number; month: number };
}

/** The date-availability section: a month calendar where each member taps days
 * to cycle free/busy/maybe, with a group free-count per day so the best dates
 * for everyone stand out. */
export function AvailabilityPanel({ tripId, me, start }: AvailabilityPanelProps) {
  const p = useAvailabilityPanel(tripId, me, start);
  return (
    <section className="availability" data-testid="availability">
      <p className="tv-kicker">When can we go?</p>
      {!me && <p className="tv-muted avail__hint">Pick your name above to mark your dates.</p>}
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
      <LoadState isLoading={p.isLoading} isError={p.isError} onRetry={p.refetch}>
        <div className="cal" data-testid="cal">
          <div className="cal__row cal__row--head">
            {WEEKDAYS.map((d, i) => (
              <span key={i} className="cal__wd tv-muted">
                {d}
              </span>
            ))}
          </div>
          {p.weeks.map((week, wi) => (
            <div key={wi} className="cal__row">
              {week.map((date, di) => (
                <DayCell
                  key={di}
                  date={date}
                  tally={date ? p.tallies[date] : undefined}
                  mine={date ? p.statusFor(date) : null}
                  canMark={p.canMark}
                  onToggle={p.toggle}
                />
              ))}
            </div>
          ))}
        </div>
      </LoadState>
    </section>
  );
}
