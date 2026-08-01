/**
 * Name-only identity (see CLAUDE.md). The source of truth is the SERVER roster
 * (Member rows); this store only remembers, per trip, which roster name THIS
 * device last acted as — a convenience so you're not re-picking every visit.
 * Switching devices never loses identity: you just re-pick your name, since the
 * name + all your votes live server-side. Pure over injected storage.
 */
const keyFor = (tripSlug: string) => `tv-identity:${tripSlug}`;

/** The name this device last chose for a trip, or null if none saved. */
export function readIdentity(tripSlug: string, storage: Pick<Storage, 'getItem'>): string | null {
  const value = storage.getItem(keyFor(tripSlug));
  return value && value.trim() ? value : null;
}

/** Remember the chosen roster name for this trip on this device. */
export function saveIdentity(
  tripSlug: string,
  name: string,
  storage: Pick<Storage, 'setItem'>,
): void {
  storage.setItem(keyFor(tripSlug), name);
}
