import { useEffect, useRef } from 'react';
import { tapSuccess } from '../../lib/haptics';

/**
 * Fire a success haptic once when the plan crosses into "aligned / ready to book"
 * — the payoff moment. Guarded on the false→true transition (a ref tracks the
 * previous value) so it buzzes once, not on every render while ready.
 */
export function useAlignedHaptic(readyToBook: boolean): void {
  const wasReady = useRef(false);
  useEffect(() => {
    if (readyToBook && !wasReady.current) tapSuccess();
    wasReady.current = readyToBook;
  }, [readyToBook]);
}
