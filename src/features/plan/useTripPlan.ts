import { useDestinations } from '../destinations/destinationApi';
import { useInterests } from '../interest/interestApi';
import { useAvailability } from '../availability/availabilityApi';
import { useBudget } from '../budget/budgetApi';
import { tallyByDestination } from '../interest/tally';
import { computeBudget, type BudgetTotals } from '../budget/computeBudget';
import { pickFrontRunner } from './frontRunner';
import { bestDateWindow, type DateWindow } from './bestWindow';
import type { DestinationRecord } from '../../lib/dataClient';

export interface TripPlan {
  isLoading: boolean;
  isError: boolean;
  frontRunner: DestinationRecord | null;
  frontRunnerVotes: { yes: number; maybe: number; no: number } | null;
  bestWindow: DateWindow | null;
  budget: BudgetTotals | null;
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

  return {
    isLoading: destinations.isLoading || interests.isLoading || availability.isLoading,
    isError: destinations.isError || interests.isError || availability.isError,
    frontRunner,
    frontRunnerVotes: t ? { yes: t.yes, maybe: t.maybe, no: t.no } : null,
    bestWindow: bestDateWindow(availability.data ?? [], 1),
    budget: budgetRow.data ? computeBudget(budgetRow.data) : null,
  };
}
