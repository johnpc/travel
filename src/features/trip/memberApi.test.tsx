import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const m = vi.hoisted(() => ({ list: vi.fn(), create: vi.fn() }));
vi.mock('../../lib/dataClient', async (importActual) => {
  const actual = await importActual<typeof import('../../lib/dataClient')>();
  return {
    ...actual,
    dataClient: { models: { Member: { list: m.list, create: m.create } } },
  };
});

import { fetchMembers, useMembers, useAddMember } from './memberApi';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('fetchMembers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a trip roster sorted by name', async () => {
    m.list.mockResolvedValue({
      data: [
        { id: '1', name: 'Sam' },
        { id: '2', name: 'Alex' },
      ],
    });
    const members = await fetchMembers('t1');
    expect(members.map((r) => r.name)).toEqual(['Alex', 'Sam']);
    expect(m.list).toHaveBeenCalledWith({ filter: { tripId: { eq: 't1' } } });
  });

  it('throws when the read returns GraphQL errors', async () => {
    m.list.mockResolvedValue({ data: [], errors: [{ message: 'nope' }] });
    await expect(fetchMembers('t1')).rejects.toThrow('nope');
  });
});

describe('useMembers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is disabled (no fetch) until a trip id is known', () => {
    renderHook(() => useMembers(undefined), { wrapper });
    expect(m.list).not.toHaveBeenCalled();
  });

  it('reads the roster once a trip id is provided', async () => {
    m.list.mockResolvedValue({ data: [{ id: '1', name: 'Alex' }] });
    const { result } = renderHook(() => useMembers('t1'), { wrapper });
    await waitFor(() => expect(result.current.data?.[0]?.name).toBe('Alex'));
  });
});

describe('useAddMember', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a trimmed member', async () => {
    m.create.mockResolvedValue({ data: { id: 'x', name: 'Priya' } });
    const { result } = renderHook(() => useAddMember('t1'), { wrapper });
    await result.current.mutateAsync('  Priya  ');
    expect(m.create).toHaveBeenCalledWith({ tripId: 't1', name: 'Priya' });
  });

  it('rejects when there is no trip', async () => {
    const { result } = renderHook(() => useAddMember(undefined), { wrapper });
    await expect(result.current.mutateAsync('Priya')).rejects.toThrow('No trip');
  });
});
