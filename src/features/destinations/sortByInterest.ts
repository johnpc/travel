import type { DestinationRecord } from '../../lib/dataClient';
import type { Tally } from '../interest/tally';

/**
 * Sort destinations by group interest, most-wanted first. Primary key is the
 * net interest score (YES=+1, NO=-1); ties break by newest-first (createdAt
 * desc) so a fresh add with no votes still shows near the top. Pure + stable.
 */
export function sortByInterest(
  destinations: DestinationRecord[],
  tallies: Record<string, Tally>,
): DestinationRecord[] {
  return [...destinations].sort((a, b) => {
    const sa = tallies[a.id]?.score ?? 0;
    const sb = tallies[b.id]?.score ?? 0;
    if (sb !== sa) return sb - sa;
    return (b.createdAt ?? '').localeCompare(a.createdAt ?? '');
  });
}
