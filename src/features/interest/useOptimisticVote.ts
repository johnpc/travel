import { useEffect, useState } from 'react';
import type { InterestLevel } from '../../lib/dataClient';
import { tapLight } from '../../lib/haptics';

/**
 * Make a vote feel instant. Casting a vote round-trips to the server and only
 * shows once the live query echoes it back (~0.5s) — long enough to feel laggy
 * and invite a double-tap. This holds an optimistic "pending" level so the tapped
 * button lights up immediately, then defers to the real value once it catches up.
 */
export function useOptimisticVote(
  myLevel: InterestLevel | null,
  onVote: (level: InterestLevel) => void,
) {
  const [pending, setPending] = useState<InterestLevel | null>(null);

  // Clear the optimistic value once the real vote matches it (or diverges — e.g.
  // the mutation failed and the server never recorded it), so we never get stuck.
  useEffect(() => {
    if (pending !== null && myLevel === pending) setPending(null);
  }, [myLevel, pending]);

  return {
    shownLevel: pending ?? myLevel,
    cast: (level: InterestLevel) => {
      tapLight();
      setPending(level);
      onVote(level);
    },
  };
}
