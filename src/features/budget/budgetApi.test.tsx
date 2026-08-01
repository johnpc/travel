import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const m = vi.hoisted(() => ({ get: vi.fn(), create: vi.fn(), update: vi.fn() }));
vi.mock('../../lib/dataClient', async (importActual) => {
  const actual = await importActual<typeof import('../../lib/dataClient')>();
  return {
    ...actual,
    dataClient: { models: { BudgetEstimate: { get: m.get, create: m.create, update: m.update } } },
  };
});

import { fetchBudget, useSaveBudget } from './budgetApi';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('fetchBudget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('gets the estimate by destination id', async () => {
    m.get.mockResolvedValue({ data: { id: 'd1', flightPerPerson: 500 } });
    expect(await fetchBudget('d1')).toEqual({ id: 'd1', flightPerPerson: 500 });
    expect(m.get).toHaveBeenCalledWith({ id: 'd1' });
  });
  it('throws on GraphQL errors', async () => {
    m.get.mockResolvedValue({ data: null, errors: [{ message: 'boom' }] });
    await expect(fetchBudget('d1')).rejects.toThrow('boom');
  });
});

describe('useSaveBudget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('creates the estimate keyed by destination id', async () => {
    m.create.mockResolvedValue({ data: { id: 'd1' }, errors: null });
    const { result } = renderHook(() => useSaveBudget('t1', 'd1'), { wrapper });
    await result.current.mutateAsync({ flightPerPerson: 500, nights: 3 });
    expect(m.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'd1',
        tripId: 't1',
        destinationId: 'd1',
        flightPerPerson: 500,
      }),
    );
  });
  it('updates when the estimate already exists', async () => {
    m.create.mockResolvedValue({ data: null, errors: [{ message: 'exists' }] });
    m.update.mockResolvedValue({ data: { id: 'd1' } });
    const { result } = renderHook(() => useSaveBudget('t1', 'd1'), { wrapper });
    await result.current.mutateAsync({ lodgingPerNight: 200 });
    expect(m.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'd1', lodgingPerNight: 200 }),
    );
  });
  it('rejects with no destination', async () => {
    const { result } = renderHook(() => useSaveBudget('t1', undefined), { wrapper });
    await expect(result.current.mutateAsync({})).rejects.toThrow('No destination');
  });
});
