import { useDestinations } from '../destinations/destinationApi';
import { useInterests } from '../interest/interestApi';
import { useAvailability } from '../availability/availabilityApi';
import { useBudget } from '../budget/budgetApi';
import { tallyByDestination } from '../interest/tally';
import { computeBudget, type BudgetTotals } from '../budget/computeBudget';
import { pickFrontRunner } from './frontRunner';
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
  const frontRunner = pickFrontRunner(destinations.data ?? [], tallies);
  const budgetRow = useBudget(frontRunner?.id, !!frontRunner);

  const t = frontRunner ? tallies[frontRunner.id] : null;
  const bestWindow = bestDateWindow(availability.data ?? [], 1);
  const budget = budgetRow.data ? computeBudget(budgetRow.data) : null;
  const crew = frontRunner ? crewFor(interests.data ?? [], frontRunner.id) : [];

  return {
    isLoading: destinations.isLoading || interests.isLoading || availability.isLoading,
    isError: destinations.isError || interests.isError || availability.isError,
    frontRunner,
    frontRunnerVotes: t ? { yes: t.yes, maybe: t.maybe, no: t.no } : null,
    crew,
    bestWindow,
    budget,
    readyToBook: isReadyToBook({
      hasFrontRunner: !!frontRunner,
      yesVotes: t?.yes ?? 0,
      bestWindow,
      budget,
    }),
  };
}
