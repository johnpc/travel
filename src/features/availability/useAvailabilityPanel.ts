import { useState } from 'react';
import { useAvailability, useMarkDay } from './availabilityApi';
import { tallyByDay, myStatus, nextStatus } from './availTally';
import { monthGrid, shiftMonth } from './calendar';
import type { AvailabilityStatus } from '../../lib/dataClient';

interface StartMonth {
  year: number;
  month: number; // 1-12
}

/**
 * Availability panel orchestration: reads a trip's day-marks, builds the current
 * month grid, aggregates per-day tallies, and toggles this member's mark on a
 * day (FREE → BUSY → MAYBE → clear). `start` is the month to open on (injected so
 * it's deterministic/testable). Marking needs the `me` identity.
 */
export function useAvailabilityPanel(
  tripId: string | undefined,
  me: string | null,
  start: StartMonth,
) {
  const query = useAvailability(tripId);
  const marks = query.data ?? [];
  const markDay = useMarkDay(tripId);
  const [view, setView] = useState<StartMonth>(start);

  const toggle = (date: string) => {
    if (!me) return;
    const current = myStatus(marks, date, me);
    markDay.mutate({ date, memberName: me, status: nextStatus(current) });
  };

  return {
    year: view.year,
    month: view.month,
    weeks: monthGrid(view.year, view.month),
    tallies: tallyByDay(marks),
    statusFor: (date: string): AvailabilityStatus | null => myStatus(marks, date, me),
    toggle,
    prevMonth: () => setView(shiftMonth(view.year, view.month, -1)),
    nextMonth: () => setView(shiftMonth(view.year, view.month, 1)),
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => query.refetch(),
    canMark: !!me,
  };
}
