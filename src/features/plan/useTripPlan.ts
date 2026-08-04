import { useDestinations } from '../destinations/destinationApi';
import { useInterests } from '../interest/interestApi';
import { useAvailability } from '../availability/availabilityApi';
import { useBudget } from '../budget/budgetApi';
import { tallyByDestination } from '../interest/tally';
import { computeBudget, type BudgetTotals } from '../budget/computeBudget';
import { pickFrontRunner, frontRunnerVotes } from './frontRunner';
import { bestDateWindow, type DateWindow } from './bestWindow';
import { crewFor } from './planCrew';
import { isReadyToBook } from './planReady';
import type { DestinationRecord } from '../../lib/dataClient';

export interface TripPlan {
  isLoading: boolean;
  isError: boolean;
  frontRunner: DestinationRecord | null;
  frontRunnerVotes: { yes: number; maybe: number; no: number } | null;
  /** Names of the members who voted YES on the front-runner (who you'd go with). */
  crew: string[];
  bestWindow: DateWindow | null;
  budget: BudgetTotals | null;
  /** True when destination + dates + budget all align — show "lock it in". */
  readyToBook: boolean;
}

/**
 * Reads the signals already collected across the trip (destination votes,
 * availability, the front-runner's budget) and synthesizes "the plan": the
 * group's favorite destination, the best consecutive date window everyone's
 * free, and the estimated cost. Pure helpers do the actual reasoning.
 */
export function useTripPlan(tripId: string | undefined): TripPlan {
  const destinations = useDestinations(tripId);
  const interests = useInterests(tripId);
  const availability = useAvailability(tripId);

  const tallies = tallyByDestination(interests.data ?? []);
  // Only call something the front-runner once it has GENUINE support (score > 0),
  // matching the board's 🏆 badge — otherwise an unvoted trip would proclaim "the
  // plan so far" for whichever destination happens to sort first (alphabetical),
  // an overclaim before anyone has actually weighed in.
  const top = pickFrontRunner(destinations.data ?? [], tallies);
  const frontRunner = top && (tallies[top.id]?.score ?? 0) > 0 ? top : null;
  const budgetRow = useBudget(frontRunner?.id, !!frontRunner);

  // The front-runner's vote split (null when there's no front-runner yet) —
  // shared by the displayed tally and the readiness check.
  const votes = frontRunnerVotes(frontRunner, tallies);
  const bestWindow = bestDateWindow(availability.data ?? [], 1);
  const budget = budgetRow.data ? computeBudget(budgetRow.data) : null;
  const crew = frontRunner ? crewFor(interests.data ?? [], frontRunner.id) : [];
  const sources = [destinations, interests, availability];

  return {
    isLoading: sources.some((s) => s.isLoading),
    isError: sources.some((s) => s.isError),
    frontRunner,
    frontRunnerVotes: votes,
    crew,
    bestWindow,
    budget,
    readyToBook: isReadyToBook({ votes, bestWindow, budget }),
  };
}
