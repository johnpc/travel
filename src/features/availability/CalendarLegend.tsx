import './availability.css';

/** A one-line key under the calendar so the green free-count badge is
 * self-explanatory: a shaded day = someone's free, and the number = how many of
 * the crew are free that day (the whole point of the grid). Otherwise a
 * first-timer sees green boxes with a tiny number and has to guess. */
export function CalendarLegend() {
  return (
    <p className="cal__legend tv-muted" data-testid="cal-legend">
      <span className="cal__legend-swatch" aria-hidden="true">
        3
      </span>
      Shaded days work for the crew — the number is how many are free.
    </p>
  );
}
