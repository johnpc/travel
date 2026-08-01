import { useState } from 'react';
import { enumerateDays } from './dateRange';

/**
 * Range-selection state machine for marking many days at once: first tap sets
 * the start (pending), second tap completes start→end and invokes `onRange`
 * with every day in the span, then resets. Tapping the same day twice marks just
 * that day. `inRange` lets the calendar highlight the pending selection.
 */
export function useRangeSelect(onRange: (dates: string[]) => void) {
  const [start, setStart] = useState<string | null>(null);

  const pick = (date: string) => {
    if (!start) {
      setStart(date);
      return;
    }
    onRange(enumerateDays(start, date));
    setStart(null);
  };

  const inRange = (date: string): boolean => start !== null && date === start;

  return { start, pick, inRange, cancel: () => setStart(null) };
}
