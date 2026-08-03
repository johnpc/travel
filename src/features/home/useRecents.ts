import { useState } from 'react';
import { readRecents, removeRecent, type RecentTrip } from './recentsStore';

/** Read the device's recent-trips list once on mount (client-only state, so it
 * lives here rather than in server-state land), plus a `remove` to drop a
 * mistyped/one-off trip from "jump back in". */
export function useRecents(): { recents: RecentTrip[]; remove: (slug: string) => void } {
  const [recents, setRecents] = useState<RecentTrip[]>(() =>
    typeof window === 'undefined' ? [] : readRecents(window.localStorage),
  );
  const remove = (slug: string) => {
    if (typeof window !== 'undefined') setRecents(removeRecent(slug, window.localStorage));
  };
  return { recents, remove };
}
