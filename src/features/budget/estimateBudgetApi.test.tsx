import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const m = vi.hoisted(() => ({ estimate: vi.fn() }));
vi.mock('../../lib/dataClient', async (importActual) => {
  const actual = await importActual<typeof import('../../lib/dataClient')>();
  return { ...actual, dataClient: { mutations: { estimateBudget: m.estimate } } };
});

import { parseBudgetPayload, useEstimateBudget } from './estimateBudgetApi';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('parseBudgetPayload', () => {
  it('parses a well-formed estimate', () => {
    const json = JSON.stringify({ flightPerPerson: 650, lodgingPerNight: 220, nights: 6, seasonNote: 'x' }); // prettier-ignore
    expect(parseBudgetPayload(json)).toEqual({
      flightPerPerson: 650,
      lodgingPerNight: 220,
      nights: 6,
      seasonNote: 'x',
    });
  });
  it('survives bad or empty input (all null)', () => {
    const empty = { flightPerPerson: null, lodgingPerNight: null, nights: null, seasonNote: null };
    expect(parseBudgetPayload('nope')).toEqual(empty);
    expect(parseBudgetPayload(null)).toEqual(empty);
  });
});

describe('useEstimateBudget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('calls the mutation and returns the parsed estimate', async () => {
    m.estimate.mockResolvedValue({ data: { estimate: JSON.stringify({ flightPerPerson: 500, lodgingPerNight: 180, nights: 5, seasonNote: 's' }) } }); // prettier-ignore
    const { result } = renderHook(() => useEstimateBudget(), { wrapper });
    const out = await result.current.mutateAsync({ destinationName: 'Santorini' });
    expect(m.estimate).toHaveBeenCalledWith({ destinationName: 'Santorini' });
    expect(out.flightPerPerson).toBe(500);
    expect(out.nights).toBe(5);
  });
  it('throws on GraphQL errors', async () => {
    m.estimate.mockResolvedValue({ data: null, errors: [{ message: 'down' }] });
    const { result } = renderHook(() => useEstimateBudget(), { wrapper });
    await expect(result.current.mutateAsync({ destinationName: 'x' })).rejects.toThrow('down');
  });
});
