import type { AvailabilityStatus } from '../../lib/dataClient';
import type { DayTally } from './availTally';

interface DayCellProps {
  date: string | null;
  tally: DayTally | undefined;
  mine: AvailabilityStatus | null;
  canMark: boolean;
  /** True when this day is the pending start of a range selection. */
  pending?: boolean;
  onTap: (date: string) => void;
}

const dayNum = (date: string) => Number(date.slice(8, 10));

/** One calendar day: shows the day number, a group free-count when anyone's
 * marked it free, and a ring in this member's own status color. Tapping invokes
 * onTap (range-pick or single-day cycle, per the panel's mode). Blank (null)
 * cells are inert padding. */
export function DayCell({ date, tally, mine, canMark, pending, onTap }: DayCellProps) {
  if (!date) return <div className="cal__cell cal__cell--blank" aria-hidden="true" />;
  const cls = ['cal__cell'];
  if (mine) cls.push(`cal__cell--${mine.toLowerCase()}`);
  if ((tally?.free ?? 0) > 0) cls.push('cal__cell--group-free');
  if (pending) cls.push('cal__cell--pending');
  return (
    <button
      type="button"
      className={cls.join(' ')}
      disabled={!canMark}
      data-testid={`day-${date}`}
      data-mine={mine ?? ''}
      aria-label={`${date}${mine ? `, you are ${mine.toLowerCase()}` : ''}`}
      onClick={() => onTap(date)}
    >
      <span className="cal__daynum">{dayNum(date)}</span>
      {(tally?.free ?? 0) > 0 && (
        <span className="cal__free" data-testid={`free-${date}`}>
          {tally?.free}
        </span>
      )}
    </button>
  );
}
