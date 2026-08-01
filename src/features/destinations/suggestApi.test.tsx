import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const m = vi.hoisted(() => ({ suggest: vi.fn() }));
vi.mock('../../lib/dataClient', async (importActual) => {
  const actual = await importActual<typeof import('../../lib/dataClient')>();
  return { ...actual, dataClient: { mutations: { suggestDestinations: m.suggest } } };
});

import { parseSuggestionPayload, useSuggestDestinations } from './suggestApi';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('parseSuggestionPayload', () => {
  it('parses a JSON array of well-formed suggestions', () => {
    const json = JSON.stringify([{ name: 'A', blurb: 'b', why: 'w' }]);
    expect(parseSuggestionPayload(json)).toEqual([{ name: 'A', blurb: 'b', why: 'w' }]);
  });

  it('drops malformed rows and survives bad JSON / empty input', () => {
    const json = JSON.stringify([{ name: 'A', blurb: 'b', why: 'w' }, { name: 'X' }, 5]);
    expect(parseSuggestionPayload(json)).toEqual([{ name: 'A', blurb: 'b', why: 'w' }]);
    expect(parseSuggestionPayload('not json')).toEqual([]);
    expect(parseSuggestionPayload(null)).toEqual([]);
    expect(parseSuggestionPayload(JSON.stringify({ nope: 1 }))).toEqual([]);
  });
});

describe('useSuggestDestinations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the mutation and returns parsed suggestions', async () => {
    m.suggest.mockResolvedValue({ data: { suggestions: JSON.stringify([{ name: 'Rome', blurb: 'b', why: 'w' }]) } }); // prettier-ignore
    const { result } = renderHook(() => useSuggestDestinations(), { wrapper });
    const out = await result.current.mutateAsync({ tripTitle: 'T', exclude: ['Paris'] });
    expect(m.suggest).toHaveBeenCalledWith({ tripTitle: 'T', count: 5, exclude: ['Paris'] });
    expect(out).toEqual([{ name: 'Rome', blurb: 'b', why: 'w' }]);
  });

  it('throws when the mutation returns GraphQL errors', async () => {
    m.suggest.mockResolvedValue({ data: null, errors: [{ message: 'bedrock down' }] });
    const { result } = renderHook(() => useSuggestDestinations(), { wrapper });
    await expect(result.current.mutateAsync({ tripTitle: 'T', exclude: [] })).rejects.toThrow(
      'bedrock down',
    );
  });
});
