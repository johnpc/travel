import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const m = vi.hoisted(() => ({ create: vi.fn(), delete: vi.fn(), update: vi.fn(), observeQuery: vi.fn() })); // prettier-ignore
vi.mock('../../lib/dataClient', async (importActual) => {
  const actual = await importActual<typeof import('../../lib/dataClient')>();
  return {
    ...actual,
    dataClient: {
      models: {
        ItineraryStop: {
          create: m.create,
          delete: m.delete,
          update: m.update,
          observeQuery: m.observeQuery,
        },
      },
    },
  };
});

function liveWith(items: unknown[]) {
  m.observeQuery.mockReturnValue({
    subscribe: (h: { next: (msg: { items: unknown[]; isSynced: boolean }) => void }) => {
      h.next({ items, isSynced: true });
      return { unsubscribe: vi.fn() };
    },
  });
}

import { useItinerary, useAddStop, useRemoveStop, useReorderStops } from './itineraryApi';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useItinerary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not subscribe until a trip id is known', () => {
    renderHook(() => useItinerary(undefined), { wrapper });
    expect(m.observeQuery).not.toHaveBeenCalled();
  });

  it('live-reads stops sorted by order', async () => {
    liveWith([
      { id: '2', place: 'Bangkok', order: 1 },
      { id: '1', place: 'Tokyo', order: 0 },
    ]);
    const { result } = renderHook(() => useItinerary('t1'), { wrapper });
    await waitFor(() => expect(result.current.data?.[0]?.place).toBe('Tokyo'));
  });
});

describe('useAddStop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a trimmed stop with its order + source', async () => {
    m.create.mockResolvedValue({ data: { id: 'x' } });
    const { result } = renderHook(() => useAddStop('t1'), { wrapper });
    await result.current.mutateAsync({ place: '  Phuket  ', nights: 3, order: 2, source: 'AI' });
    expect(m.create).toHaveBeenCalledWith(
      expect.objectContaining({ tripId: 't1', place: 'Phuket', nights: 3, order: 2, source: 'AI' }),
    );
  });

  it('rejects when there is no trip', async () => {
    const { result } = renderHook(() => useAddStop(undefined), { wrapper });
    await expect(
      result.current.mutateAsync({ place: 'X', order: 0, source: 'MANUAL' }),
    ).rejects.toThrow('No trip');
  });
});

describe('useRemoveStop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('deletes the stop by id', async () => {
    m.delete.mockResolvedValue({ data: { id: 's1' } });
    const { result } = renderHook(() => useRemoveStop('t1'), { wrapper });
    await result.current.mutateAsync('s1');
    expect(m.delete).toHaveBeenCalledWith({ id: 's1' });
  });
});

describe('useReorderStops', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('swaps the order of two stops', async () => {
    m.update.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useReorderStops('t1'), { wrapper });
    await result.current.mutateAsync({
      a: { id: 'a', order: 0 } as never,
      b: { id: 'b', order: 1 } as never,
    });
    expect(m.update).toHaveBeenCalledWith({ id: 'a', order: 1 });
    expect(m.update).toHaveBeenCalledWith({ id: 'b', order: 0 });
  });
});
