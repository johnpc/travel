import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const m = vi.hoisted(() => ({ list: vi.fn(), create: vi.fn() }));
vi.mock('../../lib/dataClient', async (importActual) => {
  const actual = await importActual<typeof import('../../lib/dataClient')>();
  return { ...actual, dataClient: { models: { Activity: { list: m.list, create: m.create } } } };
});

import { fetchActivities, useActivities, useAddActivity } from './activityApi';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('fetchActivities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('lists a destination’s activities newest-first', async () => {
    m.list.mockResolvedValue({
      data: [
        { id: '1', title: 'Old', createdAt: '2026-01-01' },
        { id: '2', title: 'New', createdAt: '2026-02-01' },
      ],
    });
    expect((await fetchActivities('d1')).map((a) => a.title)).toEqual(['New', 'Old']);
    expect(m.list).toHaveBeenCalledWith({ filter: { destinationId: { eq: 'd1' } } });
  });
  it('throws on GraphQL errors', async () => {
    m.list.mockResolvedValue({ data: [], errors: [{ message: 'boom' }] });
    await expect(fetchActivities('d1')).rejects.toThrow('boom');
  });
});

describe('useActivities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('does not fetch until enabled and an id are set', () => {
    renderHook(() => useActivities('d1', false), { wrapper });
    expect(m.list).not.toHaveBeenCalled();
  });
  it('fetches when enabled', async () => {
    m.list.mockResolvedValue({ data: [{ id: '1', title: 'Hike', createdAt: 'x' }] });
    const { result } = renderHook(() => useActivities('d1', true), { wrapper });
    await waitFor(() => expect(result.current.data?.[0]?.title).toBe('Hike'));
  });
});

describe('useAddActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('creates a trimmed activity with its source', async () => {
    m.create.mockResolvedValue({ data: { id: 'x' } });
    const { result } = renderHook(() => useAddActivity('t1', 'd1'), { wrapper });
    await result.current.mutateAsync({ title: '  Hike  ', source: 'AI', category: 'Outdoors' });
    expect(m.create).toHaveBeenCalledWith(
      expect.objectContaining({ tripId: 't1', destinationId: 'd1', title: 'Hike', source: 'AI' }),
    );
  });
  it('rejects when there is no destination', async () => {
    const { result } = renderHook(() => useAddActivity('t1', undefined), { wrapper });
    await expect(result.current.mutateAsync({ title: 'x', source: 'MANUAL' })).rejects.toThrow(
      'No destination',
    );
  });
});
