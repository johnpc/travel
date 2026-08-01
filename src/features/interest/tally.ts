/**
 * Pure interest-tally helpers — unit-tested, no I/O. Turn a flat list of votes
 * into per-destination tallies and a group "keenness" score for sorting the
 * board, so the most-wanted destinations rise to the top.
 */
import type { InterestLevel, InterestRecord } from '../../lib/dataClient';

export interface Tally {
  yes: number;
  maybe: number;
  no: number;
  /** Net enthusiasm: YES=+1, MAYBE=0, NO=-1. Used to rank destinations. */
  score: number;
}

const WEIGHT: Record<InterestLevel, number> = { YES: 1, MAYBE: 0, NO: -1 };

/** Tally one destination's votes from the subset already filtered to it. */
export function tallyVotes(votes: Pick<InterestRecord, 'level'>[]): Tally {
  const t: Tally = { yes: 0, maybe: 0, no: 0, score: 0 };
  for (const v of votes) {
    const level = v.level as InterestLevel | null;
    if (level === 'YES') t.yes += 1;
    else if (level === 'MAYBE') t.maybe += 1;
    else if (level === 'NO') t.no += 1;
    if (level) t.score += WEIGHT[level];
  }
  return t;
}

/** Group all votes by destinationId into per-destination tallies. */
export function tallyByDestination(
  votes: Pick<InterestRecord, 'destinationId' | 'level'>[],
): Record<string, Tally> {
  const groups: Record<string, Pick<InterestRecord, 'level'>[]> = {};
  for (const v of votes) (groups[v.destinationId] ??= []).push(v);
  const out: Record<string, Tally> = {};
  for (const [id, list] of Object.entries(groups)) out[id] = tallyVotes(list);
  return out;
}

/** This member's current level for a destination, or null if they haven't voted. */
export function myLevel(
  votes: Pick<InterestRecord, 'destinationId' | 'memberName' | 'level'>[],
  destinationId: string,
  memberName: string | null,
): InterestLevel | null {
  if (!memberName) return null;
  const mine = votes.find((v) => v.destinationId === destinationId && v.memberName === memberName);
  return (mine?.level as InterestLevel | null) ?? null;
}
