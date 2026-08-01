import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const h = vi.hoisted(() => ({ useBudget: vi.fn(), useSaveBudget: vi.fn(), save: vi.fn() }));
vi.mock('./budgetApi', () => ({ useBudget: h.useBudget, useSaveBudget: h.useSaveBudget }));

import { useBudgetPanel } from './useBudgetPanel';

describe('useBudgetPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.useBudget.mockReturnValue({ data: null, isLoading: false, isError: false, refetch: vi.fn() });
    h.useSaveBudget.mockReturnValue({ mutate: h.save, isPending: false });
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
    );
  });
});
