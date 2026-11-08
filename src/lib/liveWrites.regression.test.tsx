/**
 * Regression: a write made before the live list's subscription has connected
 * must still show up. observeQuery lists first and connects its onCreate/
 * onUpdate/onDelete subscriptions in parallel, so a create that lands in that
 * window is in neither the initial page nor the event stream — the item was
 * lost until reload. Here the live query delivers its initial snapshot and then
 * never streams the create (exactly the missed-event case).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const m = vi.hoisted(() => ({
  dest: { create: vi.fn(), delete: vi.fn(), observeQuery: vi.fn() },
  stop: { create: vi.fn(), delete: vi.fn(), update: vi.fn(), observeQuery: vi.fn() },
}));
vi.mock('./dataClient', async (importActual) => {
  const actual = await importActual<typeof import('./dataClient')>();
  return { ...actual, dataClient: { models: { Destination: m.dest, ItineraryStop: m.stop } } };
});

import { useDestinations, useAddDestination } from '../features/destinations/destinationApi';
import { useItinerary, useAddStop } from '../features/itinerary/itineraryApi';

/** Initial snapshot only; the subscription never delivers the later create. */
function snapshotThenSilence(observeQuery: ReturnType<typeof vi.fn>, items: unknown[]) {
  observeQuery.mockReturnValue({
    subscribe: (h: { next: (msg: { items: unknown[]; isSynced: boolean }) => void }) => {
      h.next({ items, isSynced: true });
      return { unsubscribe: vi.fn() };
    },
  });
}

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('a write made before the live subscription connects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('still shows the new destination on the board', async () => {
    snapshotThenSilence(m.dest.observeQuery, [{ id: 'd0', tripId: 't1', name: 'Santorini' }]);
    m.dest.create.mockResolvedValue({
      data: { id: 'd1', tripId: 't1', name: 'Lisbon', createdAt: '2026-11-08T00:00:01Z' },
    });
    const { result } = renderHook(
      () => ({ list: useDestinations('t1'), add: useAddDestination('t1') }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.list.data).toHaveLength(1));
    await act(() => result.current.add.mutateAsync({ name: 'Lisbon', source: 'MANUAL' }));
    await waitFor(() =>
      expect(result.current.list.data.map((d) => d.name)).toEqual(['Lisbon', 'Santorini']),
    );
  });

  it('still shows the new stop in the itinerary', async () => {
    snapshotThenSilence(m.stop.observeQuery, []);
    m.stop.create.mockResolvedValue({
      data: { id: 's1', tripId: 't1', place: 'Tokyo', order: 0 },
    });
    const { result } = renderHook(() => ({ list: useItinerary('t1'), add: useAddStop('t1') }), {
      wrapper,
    });
    await waitFor(() => expect(result.current.list.isLoading).toBe(false));
    await act(() => result.current.add.mutateAsync({ place: 'Tokyo', order: 0, source: 'MANUAL' }));
    await waitFor(() => expect(result.current.list.data.map((s) => s.place)).toEqual(['Tokyo']));
  });
});
