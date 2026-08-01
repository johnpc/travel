/**
 * Pure front-runner pick — unit-tested. Given the destinations and their vote
 * tallies, return the group's favorite: highest net interest score, ties broken
 * by more YES votes, then alphabetically for stability. Null when there are no
 * destinations. A destination with no votes scores 0 (still eligible).
 */
import type { DestinationRecord } from '../../lib/dataClient';
import type { Tally } from '../interest/tally';

const EMPTY: Tally = { yes: 0, maybe: 0, no: 0, score: 0 };

export function pickFrontRunner(
  destinations: DestinationRecord[],
  tallies: Record<string, Tally>,
): DestinationRecord | null {
  if (destinations.length === 0) return null;
  return [...destinations].sort((a, b) => {
    const ta = tallies[a.id] ?? EMPTY;
    const tb = tallies[b.id] ?? EMPTY;
    if (tb.score !== ta.score) return tb.score - ta.score;
    if (tb.yes !== ta.yes) return tb.yes - ta.yes;
    return a.name.localeCompare(b.name);
  })[0];
}
