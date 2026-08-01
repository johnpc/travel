import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const h = vi.hoisted(() => ({ useInterests: vi.fn(), useCastVote: vi.fn(), mutate: vi.fn() }));
vi.mock('./interestApi', () => ({ useInterests: h.useInterests, useCastVote: h.useCastVote }));

import { useInterest } from './useInterest';
import type { InterestRecord } from '../../lib/dataClient';

const votes = [
  { destinationId: 'd1', memberName: 'Alex', level: 'YES' },
  { destinationId: 'd1', memberName: 'Sam', level: 'NO' },
] as InterestRecord[];

describe('useInterest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.useInterests.mockReturnValue({ data: votes, isLoading: false, isError: false, refetch: vi.fn() }); // prettier-ignore
    h.useCastVote.mockReturnValue({ mutate: h.mutate, isPending: false });
  });

  it('aggregates tallies and reports my level', () => {
    const { result } = renderHook(() => useInterest('t1', 'Alex'));
    expect(result.current.tallies.d1).toEqual({ yes: 1, maybe: 0, no: 1, score: 0 });
    expect(result.current.levelFor('d1')).toBe('YES');
    expect(result.current.canVote).toBe(true);
  });

  it('casts a vote as the current member', () => {
    const { result } = renderHook(() => useInterest('t1', 'Alex'));
    act(() => result.current.cast('d1', 'MAYBE'));
    expect(h.mutate).toHaveBeenCalledWith({ destinationId: 'd1', memberName: 'Alex', level: 'MAYBE' }); // prettier-ignore
  });

  it('cannot vote without an identity', () => {
    const { result } = renderHook(() => useInterest('t1', null));
    expect(result.current.canVote).toBe(false);
    act(() => result.current.cast('d1', 'YES'));
    expect(h.mutate).not.toHaveBeenCalled();
  });
});
