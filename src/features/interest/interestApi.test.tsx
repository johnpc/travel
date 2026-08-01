import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const m = vi.hoisted(() => ({ list: vi.fn(), create: vi.fn(), update: vi.fn() }));
vi.mock('../../lib/dataClient', async (importActual) => {
  const actual = await importActual<typeof import('../../lib/dataClient')>();
  return {
    ...actual,
    dataClient: { models: { Interest: { list: m.list, create: m.create, update: m.update } } },
  };
});

import { voteId, fetchInterests, useInterests, useCastVote } from './interestApi';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('voteId', () => {
  it('is deterministic per (trip, destination, member)', () => {
    expect(voteId('t', 'd', 'Alex')).toBe('t:d:Alex');
  });
});

describe('fetchInterests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('lists a trip’s votes', async () => {
    m.list.mockResolvedValue({ data: [{ id: '1', level: 'YES' }] });
    expect(await fetchInterests('t1')).toEqual([{ id: '1', level: 'YES' }]);
    expect(m.list).toHaveBeenCalledWith({ filter: { tripId: { eq: 't1' } } });
  });
  it('throws on GraphQL errors', async () => {
    m.list.mockResolvedValue({ data: [], errors: [{ message: 'boom' }] });
    await expect(fetchInterests('t1')).rejects.toThrow('boom');
  });
});

describe('useInterests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('does not fetch until a trip id is known', () => {
    renderHook(() => useInterests(undefined), { wrapper });
    expect(m.list).not.toHaveBeenCalled();
  });
});

describe('useCastVote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a new vote with the deterministic id', async () => {
    m.create.mockResolvedValue({ data: { id: 't1:d1:Alex' }, errors: null });
    const { result } = renderHook(() => useCastVote('t1'), { wrapper });
    await result.current.mutateAsync({ destinationId: 'd1', memberName: 'Alex', level: 'YES' });
    expect(m.create).toHaveBeenCalledWith({
      id: 't1:d1:Alex',
      tripId: 't1',
      destinationId: 'd1',
      memberName: 'Alex',
      level: 'YES',
    });
    expect(m.update).not.toHaveBeenCalled();
  });

  it('falls back to update when the row already exists', async () => {
    m.create.mockResolvedValue({ data: null, errors: [{ message: 'exists' }] });
    m.update.mockResolvedValue({ data: { id: 't1:d1:Alex' } });
    const { result } = renderHook(() => useCastVote('t1'), { wrapper });
    await result.current.mutateAsync({ destinationId: 'd1', memberName: 'Alex', level: 'NO' });
    expect(m.update).toHaveBeenCalledWith({ id: 't1:d1:Alex', level: 'NO' });
  });

  it('rejects when there is no trip', async () => {
    const { result } = renderHook(() => useCastVote(undefined), { wrapper });
    await expect(
      result.current.mutateAsync({ destinationId: 'd1', memberName: 'Alex', level: 'YES' }),
    ).rejects.toThrow('No trip');
  });
});
