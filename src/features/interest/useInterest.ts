import { useInterests, useCastVote } from './interestApi';
import { tallyByDestination, myLevel, type Tally } from './tally';
import type { InterestLevel } from '../../lib/dataClient';

export interface InterestView {
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  /** Per-destination vote tallies (yes/maybe/no + net score). */
  tallies: Record<string, Tally>;
  /** This member's current level for a destination (null = not voted). */
  levelFor: (destinationId: string) => InterestLevel | null;
  /** Cast/update this member's vote on a destination. */
  cast: (destinationId: string, level: InterestLevel) => void;
  /** True while a vote is being written. */
  isVoting: boolean;
  /** Whether voting is possible (a member identity is chosen). */
  canVote: boolean;
}

/**
 * Interest orchestration for a trip: reads all votes, aggregates them per
 * destination, and casts this member's vote. Voting needs a name-only identity
 * (`me`); without one, canVote is false and cast is a no-op.
 */
export function useInterest(tripId: string | undefined, me: string | null): InterestView {
  const query = useInterests(tripId);
  const votes = query.data ?? [];
  const castVote = useCastVote(tripId);

  return {
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => query.refetch(),
    tallies: tallyByDestination(votes),
    levelFor: (destinationId) => myLevel(votes, destinationId, me),
    cast: (destinationId, level) => {
      if (me) castVote.mutate({ destinationId, memberName: me, level });
    },
    isVoting: castVote.isPending,
    canVote: !!me,
  };
}
