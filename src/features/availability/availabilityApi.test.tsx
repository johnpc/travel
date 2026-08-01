import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const m = vi.hoisted(() => ({ list: vi.fn(), create: vi.fn(), update: vi.fn(), del: vi.fn() }));
vi.mock('../../lib/dataClient', async (importActual) => {
  const actual = await importActual<typeof import('../../lib/dataClient')>();
  return {
    ...actual,
    dataClient: {
      models: { Availability: { list: m.list, create: m.create, update: m.update, delete: m.del } },
    },
  };
});

import { markId, fetchAvailability, useMarkDay } from './availabilityApi';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('markId', () => {
  it('is deterministic per (trip, date, member)', () => {
    expect(markId('t', '2027-03-01', 'Alex')).toBe('t:2027-03-01:Alex');
  });
});

describe('fetchAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('lists a trip’s marks', async () => {
    m.list.mockResolvedValue({ data: [{ id: '1', status: 'FREE' }] });
    expect(await fetchAvailability('t1')).toEqual([{ id: '1', status: 'FREE' }]);
  });
  it('throws on GraphQL errors', async () => {
    m.list.mockResolvedValue({ data: [], errors: [{ message: 'boom' }] });
    await expect(fetchAvailability('t1')).rejects.toThrow('boom');
  });
});

describe('useMarkDay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a new mark with the deterministic id', async () => {
    m.create.mockResolvedValue({ data: { id: 't1:2027-03-01:Alex' }, errors: null });
    const { result } = renderHook(() => useMarkDay('t1'), { wrapper });
    await result.current.mutateAsync({ date: '2027-03-01', memberName: 'Alex', status: 'FREE' });
    expect(m.create).toHaveBeenCalledWith(
      expect.objectContaining({ id: 't1:2027-03-01:Alex', status: 'FREE' }),
    );
  });

  it('updates when the row already exists', async () => {
    m.create.mockResolvedValue({ data: null, errors: [{ message: 'exists' }] });
    m.update.mockResolvedValue({ data: { id: 'x' } });
    const { result } = renderHook(() => useMarkDay('t1'), { wrapper });
    await result.current.mutateAsync({ date: '2027-03-01', memberName: 'Alex', status: 'BUSY' });
    expect(m.update).toHaveBeenCalledWith({ id: 't1:2027-03-01:Alex', status: 'BUSY' });
  });

  it('deletes the row when status is null (clear)', async () => {
    m.del.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useMarkDay('t1'), { wrapper });
    await result.current.mutateAsync({ date: '2027-03-01', memberName: 'Alex', status: null });
    expect(m.del).toHaveBeenCalledWith({ id: 't1:2027-03-01:Alex' });
    expect(m.create).not.toHaveBeenCalled();
  });

  it('rejects when there is no trip', async () => {
    const { result } = renderHook(() => useMarkDay(undefined), { wrapper });
    await expect(
      result.current.mutateAsync({ date: '2027-03-01', memberName: 'Alex', status: 'FREE' }),
    ).rejects.toThrow('No trip');
  });
});
