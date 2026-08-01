import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const m = vi.hoisted(() => ({ list: vi.fn(), create: vi.fn(), observeQuery: vi.fn() }));
vi.mock('../../lib/dataClient', async (importActual) => {
  const actual = await importActual<typeof import('../../lib/dataClient')>();
  return {
    ...actual,
    dataClient: {
      models: { Destination: { list: m.list, create: m.create, observeQuery: m.observeQuery } },
    },
  };
});

/** Drive an observeQuery subscription by hand. */
function liveWith(items: unknown[]) {
  m.observeQuery.mockReturnValue({
    subscribe: (h: { next: (msg: { items: unknown[]; isSynced: boolean }) => void }) => {
      h.next({ items, isSynced: true });
      return { unsubscribe: vi.fn() };
    },
  });
}

import { fetchDestinations, useDestinations, useAddDestination } from './destinationApi';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('fetchDestinations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a trip’s destinations newest-first', async () => {
    m.list.mockResolvedValue({
      data: [
        { id: '1', name: 'Old', createdAt: '2026-01-01' },
        { id: '2', name: 'New', createdAt: '2026-02-01' },
      ],
    });
    const out = await fetchDestinations('t1');
    expect(out.map((d) => d.name)).toEqual(['New', 'Old']);
    expect(m.list).toHaveBeenCalledWith({ filter: { tripId: { eq: 't1' } } });
  });

  it('throws on GraphQL errors', async () => {
    m.list.mockResolvedValue({ data: [], errors: [{ message: 'boom' }] });
    await expect(fetchDestinations('t1')).rejects.toThrow('boom');
  });
});

describe('useDestinations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not subscribe until a trip id is known', () => {
    renderHook(() => useDestinations(undefined), { wrapper });
    expect(m.observeQuery).not.toHaveBeenCalled();
  });

  it('live-reads the list (newest first) once a trip id is provided', async () => {
    liveWith([
      { id: '1', name: 'Old', createdAt: '2026-01-01' },
      { id: '2', name: 'New', createdAt: '2026-02-01' },
    ]);
    const { result } = renderHook(() => useDestinations('t1'), { wrapper });
    await waitFor(() => expect(result.current.data?.[0]?.name).toBe('New'));
    expect(m.observeQuery).toHaveBeenCalledWith({ filter: { tripId: { eq: 't1' } } });
  });
});

describe('useAddDestination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a trimmed destination with its source', async () => {
    m.create.mockResolvedValue({ data: { id: 'x', name: 'Rome' } });
    const { result } = renderHook(() => useAddDestination('t1'), { wrapper });
    await result.current.mutateAsync({ name: '  Rome  ', source: 'MANUAL' });
    expect(m.create).toHaveBeenCalledWith(
      expect.objectContaining({ tripId: 't1', name: 'Rome', source: 'MANUAL' }),
    );
  });

  it('rejects when there is no trip', async () => {
    const { result } = renderHook(() => useAddDestination(undefined), { wrapper });
    await expect(result.current.mutateAsync({ name: 'Rome', source: 'MANUAL' })).rejects.toThrow(
      'No trip',
    );
  });
});
