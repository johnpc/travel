import { useState } from 'react';
import { readRecents, type RecentTrip } from './recentsStore';

/** Read the device's recent-trips list once on mount (client-only state, so it
 * lives here rather than in server-state land). Kept trivial for the view. */
export function useRecents(): RecentTrip[] {
  const [recents] = useState<RecentTrip[]>(() =>
    typeof window === 'undefined' ? [] : readRecents(window.localStorage),
  );
  return recents;
}
