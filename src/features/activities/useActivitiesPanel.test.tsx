import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const h = vi.hoisted(() => ({
  useActivities: vi.fn(),
  useAddActivity: vi.fn(),
  useSuggestActivities: vi.fn(),
  addMutate: vi.fn(),
  suggestMutateAsync: vi.fn(),
}));
vi.mock('./activityApi', () => ({
  useActivities: h.useActivities,
  useAddActivity: h.useAddActivity,
}));
vi.mock('./suggestActivityApi', () => ({ useSuggestActivities: h.useSuggestActivities }));

import { useActivitiesPanel } from './useActivitiesPanel';
import type { ActivityRecord } from '../../lib/dataClient';

describe('useActivitiesPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.useActivities.mockReturnValue({
      data: [{ id: '1', title: 'Swim' }] as ActivityRecord[],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    h.useAddActivity.mockReturnValue({ mutate: h.addMutate, isPending: false });
    h.useSuggestActivities.mockReturnValue({ mutateAsync: h.suggestMutateAsync, isPending: false });
  });

  it('suggest excludes activities already listed', async () => {
    h.suggestMutateAsync.mockResolvedValue([{ title: 'Hike', blurb: 'b', category: 'Outdoors' }]);
    const { result } = renderHook(() => useActivitiesPanel('t1', 'd1', 'Santorini', true));
    await act(async () => {
      await result.current.runSuggest();
    });
    expect(h.suggestMutateAsync).toHaveBeenCalledWith({ destinationName: 'Santorini', exclude: ['Swim'] }); // prettier-ignore
    await waitFor(() => expect(result.current.suggestions).toHaveLength(1));
  });

  it('accepting a suggestion adds it as AI and drops it', async () => {
    h.suggestMutateAsync.mockResolvedValue([
      { title: 'Hike', blurb: 'b', category: 'Outdoors' },
      { title: 'Dine', blurb: 'b2', category: 'Food & Drink' },
    ]);
    const { result } = renderHook(() => useActivitiesPanel('t1', 'd1', 'Santorini', true));
    await act(async () => {
      await result.current.runSuggest();
    });
    act(() => result.current.accept({ title: 'Hike', blurb: 'b', category: 'Outdoors' }));
    expect(h.addMutate).toHaveBeenCalledWith({ title: 'Hike', blurb: 'b', category: 'Outdoors', source: 'AI' }); // prettier-ignore
    expect(result.current.suggestions.map((s) => s.title)).toEqual(['Dine']);
  });
});
