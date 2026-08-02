import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const m = vi.hoisted(() => ({ suggest: vi.fn() }));
vi.mock('../../lib/dataClient', async (importActual) => {
  const actual = await importActual<typeof import('../../lib/dataClient')>();
  return { ...actual, dataClient: { mutations: { suggestHotels: m.suggest } } };
});

import { parseHotelPayload, useSuggestHotels } from './hotelsApi';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const pick = {
  name: 'Grace',
  tier: 'Luxury',
  pricePerNight: 600,
  area: 'Oia',
  pros: 'p',
  cons: 'c',
};

describe('parseHotelPayload', () => {
  it('parses well-formed hotels + median and drops nameless rows', () => {
    const json = JSON.stringify({ hotels: [pick, { tier: 'Budget' }], airbnbMedianPerNight: 180 });
    const out = parseHotelPayload(json);
    expect(out.hotels).toHaveLength(1);
    expect(out.hotels[0].name).toBe('Grace');
    expect(out.airbnbMedianPerNight).toBe(180);
  });
  it('survives bad or empty input', () => {
    expect(parseHotelPayload('nope')).toEqual({ hotels: [], airbnbMedianPerNight: null });
    expect(parseHotelPayload(null)).toEqual({ hotels: [], airbnbMedianPerNight: null });
  });
});

describe('useSuggestHotels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('calls the mutation and returns parsed suggestions', async () => {
    m.suggest.mockResolvedValue({ data: { suggestions: JSON.stringify({ hotels: [pick], airbnbMedianPerNight: 200 }) } }); // prettier-ignore
    const { result } = renderHook(() => useSuggestHotels(), { wrapper });
    const out = await result.current.mutateAsync({ destinationName: 'Santorini' });
    expect(m.suggest).toHaveBeenCalledWith({ destinationName: 'Santorini' });
    expect(out.hotels[0].tier).toBe('Luxury');
    expect(out.airbnbMedianPerNight).toBe(200);
  });
  it('throws on GraphQL errors', async () => {
    m.suggest.mockResolvedValue({ data: null, errors: [{ message: 'down' }] });
    const { result } = renderHook(() => useSuggestHotels(), { wrapper });
    await expect(result.current.mutateAsync({ destinationName: 'x' })).rejects.toThrow('down');
  });
});
