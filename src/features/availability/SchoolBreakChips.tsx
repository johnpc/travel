import { formatRange } from '../plan/formatRange';
import type { SchoolBreak } from './schoolBreaks';

interface SchoolBreakChipsProps {
  breaks: SchoolBreak[];
  /** Tap a break: jump the calendar to it and (when named) mark me free across it. */
  onPick: (b: SchoolBreak) => void;
}

/** Quick-pick chips for the next few school breaks — the season most friend
 * trips land on. Tapping one jumps the calendar there and marks you free across
 * the whole span, so you never hunt month-by-month for a plausible week. */
export function SchoolBreakChips({ breaks, onPick }: SchoolBreakChipsProps) {
  if (breaks.length === 0) return null;
  return (
    <div className="breaks" data-testid="school-breaks">
      <p className="tv-muted breaks__hint">Popular with school schedules — tap to grab a week:</p>
      <ul className="breaks__row">
        {breaks.map((b) => (
          <li key={b.label}>
            <button
              type="button"
              className="breaks__chip"
              data-testid="school-break"
              onClick={() => onPick(b)}
            >
              <span className="breaks__label">{b.label}</span>
              <span className="breaks__range tv-muted">{formatRange(b.start, b.end)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
