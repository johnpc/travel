import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const h = vi.hoisted(() => ({
  useDestinations: vi.fn(),
  useAddDestination: vi.fn(),
  useSuggestDestinations: vi.fn(),
  addMutate: vi.fn(),
  suggestMutateAsync: vi.fn(),
}));
vi.mock('./destinationApi', () => ({
  useDestinations: h.useDestinations,
  useAddDestination: h.useAddDestination,
}));
vi.mock('./suggestApi', () => ({ useSuggestDestinations: h.useSuggestDestinations }));

import { useDestinationsPanel } from './useDestinationsPanel';

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
  });

  it('adds a manual destination with MANUAL source', () => {
    const { result } = renderHook(() => useDestinationsPanel('t1', 'Trip'));
    act(() => result.current.addManual('Lisbon'));
    expect(h.addMutate).toHaveBeenCalledWith({ name: 'Lisbon', source: 'MANUAL' });
  });

  it('ignores a blank manual add', () => {
    const { result } = renderHook(() => useDestinationsPanel('t1', 'Trip'));
    act(() => result.current.addManual('   '));
    expect(h.addMutate).not.toHaveBeenCalled();
  });

  it('suggest excludes names already on the board', async () => {
    h.suggestMutateAsync.mockResolvedValue([{ name: 'Oslo', blurb: 'b', why: 'w' }]);
    const { result } = renderHook(() => useDestinationsPanel('t1', 'Trip'));
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
    const { result } = renderHook(() => useDestinationsPanel('t1', 'Trip'));
    await act(async () => {
      await result.current.runSuggest();
    });
    act(() => result.current.accept({ name: 'Oslo', blurb: 'b', why: 'w' }));
    expect(h.addMutate).toHaveBeenCalledWith({ name: 'Oslo', blurb: 'b', why: 'w', source: 'AI' });
    expect(result.current.suggestions.map((s) => s.name)).toEqual(['Cairo']);
  });
});
