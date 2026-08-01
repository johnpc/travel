import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const m = vi.hoisted(() => ({ suggest: vi.fn() }));
vi.mock('../../lib/dataClient', async (importActual) => {
  const actual = await importActual<typeof import('../../lib/dataClient')>();
  return { ...actual, dataClient: { mutations: { suggestActivities: m.suggest } } };
});

import { parseActivityPayload, useSuggestActivities } from './suggestActivityApi';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('parseActivityPayload', () => {
  it('parses well-formed activities and drops junk', () => {
    const json = JSON.stringify([{ title: 'Hike', blurb: 'b', category: 'Outdoors' }, { title: 'x' }]); // prettier-ignore
    expect(parseActivityPayload(json)).toEqual([{ title: 'Hike', blurb: 'b', category: 'Outdoors' }]); // prettier-ignore
  });
  it('survives bad or empty input', () => {
    expect(parseActivityPayload('nope')).toEqual([]);
    expect(parseActivityPayload(null)).toEqual([]);
  });
});

describe('useSuggestActivities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('calls the mutation and returns parsed suggestions', async () => {
    m.suggest.mockResolvedValue({ data: { suggestions: JSON.stringify([{ title: 'Hike', blurb: 'b', category: 'Outdoors' }]) } }); // prettier-ignore
    const { result } = renderHook(() => useSuggestActivities(), { wrapper });
    const out = await result.current.mutateAsync({
      destinationName: 'Santorini',
      exclude: ['Swim'],
    });
    expect(m.suggest).toHaveBeenCalledWith({ destinationName: 'Santorini', count: 5, exclude: ['Swim'] }); // prettier-ignore
    expect(out).toEqual([{ title: 'Hike', blurb: 'b', category: 'Outdoors' }]);
  });
  it('throws on GraphQL errors', async () => {
    m.suggest.mockResolvedValue({ data: null, errors: [{ message: 'down' }] });
    const { result } = renderHook(() => useSuggestActivities(), { wrapper });
    await expect(result.current.mutateAsync({ destinationName: 'x', exclude: [] })).rejects.toThrow('down'); // prettier-ignore
  });
});
