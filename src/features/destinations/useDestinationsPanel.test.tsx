import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const h = vi.hoisted(() => ({
  useDestinations: vi.fn(),
  useAddDestination: vi.fn(),
  useSuggestDestinations: vi.fn(),
  useInterest: vi.fn(),
  addMutate: vi.fn(),
  suggestMutateAsync: vi.fn(),
}));
vi.mock('./destinationApi', () => ({
  useDestinations: h.useDestinations,
  useAddDestination: h.useAddDestination,
}));
vi.mock('./suggestApi', () => ({ useSuggestDestinations: h.useSuggestDestinations }));
vi.mock('../interest/useInterest', () => ({ useInterest: h.useInterest }));

import { useDestinationsPanel } from './useDestinationsPanel';

const emptyInterest = {
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
  tallies: {},
  levelFor: () => null,
  cast: vi.fn(),
  isVoting: false,
  canVote: false,
};

describe('useDestinationsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.useDestinations.mockReturnValue({
      data: [{ id: '1', name: 'Rome' }],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    h.useAddDestination.mockReturnValue({ mutate: h.addMutate, isPending: false });
    h.useSuggestDestinations.mockReturnValue({
      mutateAsync: h.suggestMutateAsync,
      isPending: false,
    });
    h.useInterest.mockReturnValue(emptyInterest);
  });

  it('adds a manual destination with MANUAL source', () => {
    const { result } = renderHook(() => useDestinationsPanel('t1', 'Trip', 'Alex'));
    act(() => result.current.addManual('Lisbon'));
    expect(h.addMutate).toHaveBeenCalledWith({ name: 'Lisbon', source: 'MANUAL' });
  });

  it('ignores a blank manual add', () => {
    const { result } = renderHook(() => useDestinationsPanel('t1', 'Trip', 'Alex'));
    act(() => result.current.addManual('   '));
    expect(h.addMutate).not.toHaveBeenCalled();
  });

  it('suggest excludes names already on the board', async () => {
    h.suggestMutateAsync.mockResolvedValue([{ name: 'Oslo', blurb: 'b', why: 'w' }]);
    const { result } = renderHook(() => useDestinationsPanel('t1', 'Trip', 'Alex'));
    await act(async () => {
      await result.current.runSuggest();
    });
    expect(h.suggestMutateAsync).toHaveBeenCalledWith({ tripTitle: 'Trip', exclude: ['Rome'] });
    await waitFor(() => expect(result.current.suggestions).toHaveLength(1));
  });

  it('accepting a suggestion adds it as AI and drops it from the list', async () => {
    h.suggestMutateAsync.mockResolvedValue([
      { name: 'Oslo', blurb: 'b', why: 'w' },
      { name: 'Cairo', blurb: 'b2', why: 'w2' },
    ]);
    const { result } = renderHook(() => useDestinationsPanel('t1', 'Trip', 'Alex'));
    await act(async () => {
      await result.current.runSuggest();
    });
    act(() => result.current.accept({ name: 'Oslo', blurb: 'b', why: 'w' }));
    expect(h.addMutate).toHaveBeenCalledWith({ name: 'Oslo', blurb: 'b', why: 'w', source: 'AI' });
    expect(result.current.suggestions.map((s) => s.name)).toEqual(['Cairo']);
  });

  it('names a front-runner only once a destination has positive support', () => {
    h.useDestinations.mockReturnValue({
      data: [
        { id: '1', name: 'Rome' },
        { id: '2', name: 'Bali' },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    // No votes yet → no front-runner badged.
    h.useInterest.mockReturnValue(emptyInterest);
    const { result, rerender } = renderHook(() => useDestinationsPanel('t1', 'Trip', 'Alex'));
    expect(result.current.frontRunnerId).toBeNull();

    // Bali gains support → it becomes the front-runner (sorted first + score>0).
    h.useInterest.mockReturnValue({
      ...emptyInterest,
      tallies: { '2': { yes: 2, maybe: 0, no: 0, score: 2 } },
    });
    rerender();
    expect(result.current.destinations[0].id).toBe('2');
    expect(result.current.frontRunnerId).toBe('2');
  });
});
