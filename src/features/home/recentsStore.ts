/**
 * Device-local recent-trips list — pure over injected storage. Because Travel is
 * account-free (the URL is the whole identity of a trip), closing the tab could
 * otherwise lose the link forever. We remember the trips this device has opened
 * so Home can offer a "jump back in" list. This is a convenience cache only, not
 * a source of truth — the trip and all its data live server-side.
 */
const KEY = 'tv-recents';
const LIMIT = 8;

export interface RecentTrip {
  slug: string;
  title: string;
}

/** The trips this device has opened, most-recent first (capped, de-duped). */
export function readRecents(storage: Pick<Storage, 'getItem'>): RecentTrip[] {
  try {
    const parsed = JSON.parse(storage.getItem(KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (r): r is RecentTrip => !!r && typeof r.slug === 'string' && typeof r.title === 'string',
      )
      .slice(0, LIMIT);
  } catch {
    return [];
  }
}

/** Record a visited trip at the front of the list (moving a repeat visit up),
 * returning the new list so callers can render without a re-read. */
export function recordRecent(
  trip: RecentTrip,
  storage: Pick<Storage, 'getItem' | 'setItem'>,
): RecentTrip[] {
  if (!trip.slug) return readRecents(storage);
  const rest = readRecents(storage).filter((r) => r.slug !== trip.slug);
  const next = [trip, ...rest].slice(0, LIMIT);
  storage.setItem(KEY, JSON.stringify(next));
  return next;
}
