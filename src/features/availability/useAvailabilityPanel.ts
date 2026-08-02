import { useState } from 'react';
import { useAvailability, useMarkDay, useMarkRange } from './availabilityApi';
import { tallyByDay, myStatus, nextStatus } from './availTally';
import { monthGrid, shiftMonth } from './calendar';
import { candidateWindows, busiestMonth, type CandidateWindow } from './candidateWindows';
import { enumerateDays } from './dateRange';
import { schoolBreaks, type SchoolBreak } from './schoolBreaks';
import { useRangeSelect } from './useRangeSelect';
import type { AvailabilityStatus } from '../../lib/dataClient';

interface Month {
  year: number;
  month: number; // 1-12
}

interface Today extends Month {
  day: number; // 1-31
}

/**
 * Availability panel orchestration. Surfaces the best candidate windows up front
 * (so friends' dates are never buried), opens on the busiest month by default,
 * lets you jump to a window, mark a whole span FREE by tapping start→end (range
 * mode), or fine-tune a single day (FREE→BUSY→MAYBE→clear). Needs `me` to mark.
 */
export function useAvailabilityPanel(tripId: string | undefined, me: string | null, today: Today) {
  const query = useAvailability(tripId);
  const marks = query.data ?? [];
  const markDay = useMarkDay(tripId);
  const markRange = useMarkRange(tripId);
  const [override, setOverride] = useState<Month | null>(null);
  const view = override ?? busiestMonth(marks, today);

  const range = useRangeSelect((dates) => {
    if (me) markRange.mutate({ dates, memberName: me, status: 'FREE' });
  });

  const toggle = (date: string) => {
    if (me) markDay.mutate({ date, memberName: me, status: nextStatus(myStatus(marks, date, me)) });
  };

  const jumpTo = (start: string) =>
    setOverride({ year: +start.slice(0, 4), month: +start.slice(5, 7) });

  const pickBreak = (b: SchoolBreak) => {
    jumpTo(b.start);
    if (me) markRange.mutate({ dates: enumerateDays(b.start, b.end), memberName: me, status: 'FREE' }); // prettier-ignore
  };

  return {
    year: view.year,
    month: view.month,
    weeks: monthGrid(view.year, view.month),
    tallies: tallyByDay(marks),
    windows: candidateWindows(marks).slice(0, 5) as CandidateWindow[],
    breaks: schoolBreaks(today).slice(0, 4) as SchoolBreak[],
    statusFor: (date: string): AvailabilityStatus | null => myStatus(marks, date, me),
    inRange: range.inRange,
    rangeStart: range.start,
    pickRange: range.pick,
    toggle,
    pickBreak,
    jumpTo: (w: CandidateWindow) => jumpTo(w.start),
    prevMonth: () => setOverride(shiftMonth(view.year, view.month, -1)),
    nextMonth: () => setOverride(shiftMonth(view.year, view.month, 1)),
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => query.refetch(),
    canMark: !!me,
  };
}
