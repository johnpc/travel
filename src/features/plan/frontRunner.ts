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

export interface VoteSplit {
  yes: number;
  maybe: number;
  no: number;
}

/** The front-runner's yes/maybe/no split, or null when there's no front-runner —
 * so callers get one value they can pass straight through (no null-juggling). */
export function frontRunnerVotes(
  frontRunner: DestinationRecord | null,
  tallies: Record<string, Tally>,
): VoteSplit | null {
  if (!frontRunner) return null;
  const t = tallies[frontRunner.id] ?? EMPTY;
  return { yes: t.yes, maybe: t.maybe, no: t.no };
}
