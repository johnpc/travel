import { useEffect, useRef, useState } from 'react';
import type { AvailabilityStatus } from '../../lib/dataClient';

/** A pending single-day mark: the status a tap chose, keyed by date. `null` means
 * cleared (cycled back to no mark). */
type Pending = Record<string, AvailabilityStatus | null>;

/**
 * Make day-marking feel instant. A tap round-trips to the server and only shows
 * once the live query echoes it back (~0.3s) — perceptible when marking several
 * days in a row. This holds optimistic per-day overrides so the tapped cell
 * recolors immediately, then drops each override once the real status matches.
 *
 * `serverStatusFor` is the live (server-derived) status for a date; `shownStatus`
 * layers the pending override on top; `remember` records a tap's chosen status.
 */
export function useOptimisticMarks(serverStatusFor: (date: string) => AvailabilityStatus | null) {
  const [pending, setPending] = useState<Pending>({});
  // Latest server lookup, read in an effect without making it a dep.
  const lookup = useRef(serverStatusFor);
  lookup.current = serverStatusFor;

  // Drop overrides the server has caught up to (matches) — so we never get stuck
  // and a later real change (e.g. a collaborator) isn't masked.
  useEffect(() => {
    setPending((prev) => {
      const next: Pending = {};
      for (const [date, status] of Object.entries(prev)) {
        if (lookup.current(date) !== status) next[date] = status;
      }
      return Object.keys(next).length === Object.keys(prev).length ? prev : next;
    });
  });

  return {
    shownStatus: (date: string): AvailabilityStatus | null =>
      date in pending ? pending[date] : serverStatusFor(date),
    remember: (date: string, status: AvailabilityStatus | null) =>
      setPending((prev) => ({ ...prev, [date]: status })),
    // Mark a whole span at once (range-select / school-break) — same instant feel
    // as a single tap, so a full week doesn't wait ~1s for the round-trip.
    rememberMany: (dates: string[], status: AvailabilityStatus | null) =>
      setPending((prev) => {
        const next = { ...prev };
        for (const d of dates) next[d] = status;
        return next;
      }),
  };
}
