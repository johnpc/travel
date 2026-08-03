import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const h = vi.hoisted(() => ({
  useBudget: vi.fn(),
  useSaveBudget: vi.fn(),
  save: vi.fn(),
  useEstimateBudget: vi.fn(),
  estimate: vi.fn(),
}));
vi.mock('./budgetApi', () => ({ useBudget: h.useBudget, useSaveBudget: h.useSaveBudget }));
vi.mock('./estimateBudgetApi', () => ({ useEstimateBudget: h.useEstimateBudget }));

import { useBudgetPanel } from './useBudgetPanel';

describe('useBudgetPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.useBudget.mockReturnValue({ data: null, isLoading: false, isError: false, refetch: vi.fn() });
    h.useSaveBudget.mockReturnValue({ mutate: h.save, isPending: false });
    h.useEstimateBudget.mockReturnValue({ mutateAsync: h.estimate, isPending: false });
  });

  it('seeds the form from a loaded estimate', async () => {
    h.useBudget.mockReturnValue({
      data: { flightPerPerson: 500, lodgingPerNight: 200, nights: 4, seasonNote: 'High season' },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    const { result } = renderHook(() => useBudgetPanel('t1', 'd1', true));
    await waitFor(() => expect(result.current.form.flightPerPerson).toBe('500'));
    expect(result.current.form.seasonNote).toBe('High season');
    // totals computed: 500 + (200*4)/2 = 900 per person
    expect(result.current.totals.perPerson).toBe(900);
  });

  it('recomputes totals as inputs change', () => {
    const { result } = renderHook(() => useBudgetPanel('t1', 'd1', true));
    act(() => result.current.set('flightPerPerson', '300'));
    expect(result.current.totals.perCouple).toBe(600);
  });

  it('submits parsed numeric fields (blank → null)', () => {
    const { result } = renderHook(() => useBudgetPanel('t1', 'd1', true));
    act(() => result.current.set('flightPerPerson', '400'));
    act(() => result.current.set('nights', '2'));
    act(() => result.current.submit());
    expect(h.save).toHaveBeenCalledWith(
      expect.objectContaining({
        flightPerPerson: 400,
        nights: 2,
        lodgingPerNight: null,
        seasonNote: null,
      }),
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it('flips justSaved after a successful save, then clears it', async () => {
    vi.useFakeTimers();
    // mutate invokes its onSuccess callback (react-query style)
    h.save.mockImplementation((_fields, opts) => opts?.onSuccess?.());
    const { result } = renderHook(() => useBudgetPanel('t1', 'd1', true));
    act(() => result.current.submit());
    expect(result.current.justSaved).toBe(true);
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.justSaved).toBe(false);
    vi.useRealTimers();
  });

  it('runEstimate fills empty fields with the AI ballpark, keeping typed values', async () => {
    h.estimate.mockResolvedValue({
      flightPerPerson: 650,
      lodgingPerNight: 220,
      nights: 6,
      seasonNote: 'Shoulder season is cheaper',
    });
    const { result } = renderHook(() => useBudgetPanel('t1', 'd1', true, 'Santorini, Greece'));
    act(() => result.current.set('flightPerPerson', '900')); // user already typed this
    await act(async () => {
      await result.current.runEstimate();
    });
    expect(h.estimate).toHaveBeenCalledWith({ destinationName: 'Santorini, Greece' });
    expect(result.current.form.flightPerPerson).toBe('900'); // kept the user's value
    expect(result.current.form.lodgingPerNight).toBe('220'); // filled from AI
    expect(result.current.form.nights).toBe('6');
    expect(result.current.form.seasonNote).toBe('Shoulder season is cheaper');
  });

  it('runEstimate is a no-op without a destination name', async () => {
    const { result } = renderHook(() => useBudgetPanel('t1', 'd1', true));
    await act(async () => {
      await result.current.runEstimate();
    });
    expect(h.estimate).not.toHaveBeenCalled();
  });

  it('swallows a failed AI estimate (no unhandled reject) and surfaces the error flag', async () => {
    h.estimate.mockRejectedValue(new Error('AI down'));
    h.useEstimateBudget.mockReturnValue({ mutateAsync: h.estimate, isPending: false, isError: true }); // prettier-ignore
    const { result } = renderHook(() => useBudgetPanel('t1', 'd1', true, 'Santorini, Greece'));
    await act(async () => {
      await result.current.runEstimate();
    });
    expect(result.current.estimateError).toBe(true);
  });
});
