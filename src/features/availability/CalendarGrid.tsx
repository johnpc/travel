import { DayCell } from './DayCell';
import type { DayTally } from './availTally';
import type { AvailabilityStatus } from '../../lib/dataClient';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface CalendarGridProps {
  weeks: (string | null)[][];
  tallies: Record<string, DayTally>;
  statusFor: (date: string) => AvailabilityStatus | null;
  inRange: (date: string) => boolean;
  canMark: boolean;
  onTap: (date: string) => void;
}

/** The month grid of day cells (weekday header + weeks). Pure presentation over
 * the panel's data + tap handler. */
export function CalendarGrid({
  weeks,
  tallies,
  statusFor,
  inRange,
  canMark,
  onTap,
}: CalendarGridProps) {
  return (
    <div className="cal" data-testid="cal">
      <div className="cal__row cal__row--head">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="cal__wd tv-muted">
            {d}
          </span>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="cal__row">
          {week.map((date, di) => (
            <DayCell
              key={di}
              date={date}
              tally={date ? tallies[date] : undefined}
              mine={date ? statusFor(date) : null}
              pending={date ? inRange(date) : false}
              canMark={canMark}
              onTap={onTap}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
