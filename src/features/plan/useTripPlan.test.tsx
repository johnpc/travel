import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { AvailabilityRecord, DestinationRecord, InterestRecord } from '../../lib/dataClient';

const h = vi.hoisted(() => ({
  useDestinations: vi.fn(),
  useInterests: vi.fn(),
  useAvailability: vi.fn(),
  useBudget: vi.fn(),
}));
vi.mock('../destinations/destinationApi', () => ({ useDestinations: h.useDestinations }));
vi.mock('../interest/interestApi', () => ({ useInterests: h.useInterests }));
vi.mock('../availability/availabilityApi', () => ({ useAvailability: h.useAvailability }));
vi.mock('../budget/budgetApi', () => ({ useBudget: h.useBudget }));

import { useTripPlan } from './useTripPlan';

const ok = <T,>(data: T) => ({ data, isLoading: false, isError: false });

describe('useTripPlan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.useDestinations.mockReturnValue(
      ok([
        { id: 'a', name: 'Athens' },
        { id: 'b', name: 'Bali' },
      ] as DestinationRecord[]),
    );
    h.useInterests.mockReturnValue(
      ok([
        { destinationId: 'b', memberName: 'Al', level: 'YES' },
        { destinationId: 'b', memberName: 'Sam', level: 'YES' },
        { destinationId: 'a', memberName: 'Al', level: 'NO' },
      ] as InterestRecord[]),
    );
    h.useAvailability.mockReturnValue(
      ok([
        { date: '2027-06-12', status: 'FREE' },
        { date: '2027-06-13', status: 'FREE' },
      ] as AvailabilityRecord[]),
    );
    h.useBudget.mockReturnValue(ok({ flightPerPerson: 500, lodgingPerNight: 200, nights: 4 }));
  });

  it('synthesizes the front-runner, its votes, best window, and budget', () => {
    const { result } = renderHook(() => useTripPlan('t1'));
    expect(result.current.frontRunner?.name).toBe('Bali'); // score +2 beats Athens -1
    expect(result.current.frontRunnerVotes).toEqual({ yes: 2, maybe: 0, no: 0 });
    expect(result.current.bestWindow).toEqual({ start: '2027-06-12', end: '2027-06-13', days: 2 });
    expect(result.current.budget?.perPerson).toBe(900);
    // Al + Sam voted YES on Bali → the crew you'd go with.
    expect(result.current.crew).toEqual(['Al', 'Sam']);
    // front-runner + yes votes + window + budget all present → ready to book.
    expect(result.current.readyToBook).toBe(true);
  });

  it('has no front-runner when there are no destinations', () => {
    h.useDestinations.mockReturnValue(ok([] as DestinationRecord[]));
    h.useBudget.mockReturnValue(ok(null));
    const { result } = renderHook(() => useTripPlan('t1'));
    expect(result.current.frontRunner).toBeNull();
  });

  it('has no front-runner when destinations exist but nobody has voted', () => {
    // An unvoted trip must NOT proclaim "the plan so far" for the alphabetically
    // first destination — the hero only appears once there's genuine support.
    h.useInterests.mockReturnValue(ok([] as InterestRecord[]));
    h.useBudget.mockReturnValue(ok(null));
    const { result } = renderHook(() => useTripPlan('t1'));
    expect(result.current.frontRunner).toBeNull();
    expect(result.current.frontRunnerVotes).toBeNull();
    expect(result.current.readyToBook).toBe(false);
  });
});
