import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const m = vi.hoisted(() => ({ suggest: vi.fn() }));
vi.mock('../../lib/dataClient', async (importActual) => {
  const actual = await importActual<typeof import('../../lib/dataClient')>();
  return { ...actual, dataClient: { mutations: { suggestRoute: m.suggest } } };
});

import { parseRoutePayload, useSuggestRoute } from './suggestRouteApi';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('parseRoutePayload', () => {
  it('parses ordered stops and drops placeless rows', () => {
    const json = JSON.stringify([{ place: 'Tokyo', nights: 4, note: 'n' }, { nights: 2 }]);
    expect(parseRoutePayload(json)).toEqual([{ place: 'Tokyo', nights: 4, note: 'n' }]);
  });
  it('survives bad or empty input', () => {
    expect(parseRoutePayload('nope')).toEqual([]);
    expect(parseRoutePayload(null)).toEqual([]);
  });
});

describe('useSuggestRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('calls the mutation with theme + exclude and returns parsed stops', async () => {
    m.suggest.mockResolvedValue({ data: { stops: JSON.stringify([{ place: 'Bali', nights: 5, note: 'x' }]) } }); // prettier-ignore
    const { result } = renderHook(() => useSuggestRoute(), { wrapper });
    const out = await result.current.mutateAsync({ theme: 'Asia', exclude: ['Tokyo'] });
    expect(m.suggest).toHaveBeenCalledWith({ theme: 'Asia', exclude: ['Tokyo'] });
    expect(out[0].place).toBe('Bali');
  });
  it('throws on GraphQL errors', async () => {
    m.suggest.mockResolvedValue({ data: null, errors: [{ message: 'down' }] });
    const { result } = renderHook(() => useSuggestRoute(), { wrapper });
    await expect(result.current.mutateAsync({ theme: 'x', exclude: [] })).rejects.toThrow('down');
  });
});
