import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const h = vi.hoisted(() => ({
  useItinerary: vi.fn(),
  useAddStop: vi.fn(),
  useRemoveStop: vi.fn(),
  useReorderStops: vi.fn(),
  useSuggestRoute: vi.fn(),
  add: vi.fn(),
  remove: vi.fn(),
  reorder: vi.fn(),
  suggestAsync: vi.fn(),
}));
vi.mock('./itineraryApi', () => ({
  useItinerary: h.useItinerary,
  useAddStop: h.useAddStop,
  useRemoveStop: h.useRemoveStop,
  useReorderStops: h.useReorderStops,
}));
vi.mock('./suggestRouteApi', () => ({ useSuggestRoute: h.useSuggestRoute }));

import { useItineraryPanel } from './useItineraryPanel';

const stops = [
  { id: 'a', place: 'Tokyo', order: 0 },
  { id: 'b', place: 'Bangkok', order: 1 },
];

describe('useItineraryPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.useItinerary.mockReturnValue({ data: stops, isLoading: false, isError: false, refetch: vi.fn() }); // prettier-ignore
    h.useAddStop.mockReturnValue({ mutate: h.add });
    h.useRemoveStop.mockReturnValue({ mutate: h.remove });
    h.useReorderStops.mockReturnValue({ mutate: h.reorder });
    h.useSuggestRoute.mockReturnValue({ mutateAsync: h.suggestAsync, isPending: false });
  });

  it('adds a manual stop with the next order index', () => {
    const { result } = renderHook(() => useItineraryPanel('t1', 'Asia'));
    act(() => result.current.addManual('Phuket', 3));
    expect(h.add).toHaveBeenCalledWith(
      expect.objectContaining({ place: 'Phuket', nights: 3, order: 2, source: 'MANUAL' }),
    );
  });

  it('suggests a route excluding places already on the itinerary', async () => {
    h.suggestAsync.mockResolvedValue([{ place: 'Bali', nights: 5, note: 'n' }]);
    const { result } = renderHook(() => useItineraryPanel('t1', 'Asia'));
    await act(async () => {
      await result.current.runSuggest();
    });
    expect(h.suggestAsync).toHaveBeenCalledWith({ theme: 'Asia', exclude: ['Tokyo', 'Bangkok'] });
    expect(result.current.suggestions[0].place).toBe('Bali');
  });

  it('swallows a failed route suggest (no unhandled reject) and surfaces the error flag', async () => {
    h.suggestAsync.mockRejectedValue(new Error('AI down'));
    h.useSuggestRoute.mockReturnValue({ mutateAsync: h.suggestAsync, isPending: false, isError: true }); // prettier-ignore
    const { result } = renderHook(() => useItineraryPanel('t1', 'Asia'));
    await act(async () => {
      await result.current.runSuggest();
    });
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.suggestError).toBe(true);
  });

  it('accepts a suggestion as an AI stop and drops it from the list', async () => {
    h.suggestAsync.mockResolvedValue([{ place: 'Bali', nights: 5, note: 'n' }]);
    const { result } = renderHook(() => useItineraryPanel('t1', 'Asia'));
    await act(async () => {
      await result.current.runSuggest();
    });
    act(() => result.current.accept({ place: 'Bali', nights: 5, note: 'n' }));
    expect(h.add).toHaveBeenCalledWith(expect.objectContaining({ place: 'Bali', source: 'AI' }));
    expect(result.current.suggestions).toHaveLength(0);
  });

  it('moves a stop by swapping with its neighbor', () => {
    const { result } = renderHook(() => useItineraryPanel('t1', 'Asia'));
    act(() => result.current.move(0, 1));
    expect(h.reorder).toHaveBeenCalledWith({ a: stops[0], b: stops[1] });
  });

  it('does not reorder past the ends', () => {
    const { result } = renderHook(() => useItineraryPanel('t1', 'Asia'));
    act(() => result.current.move(0, -1)); // already first
    expect(h.reorder).not.toHaveBeenCalled();
  });
});
