import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const m = vi.hoisted(() => ({ list: vi.fn(), create: vi.fn() }));
vi.mock('../../lib/dataClient', async (importActual) => {
  const actual = await importActual<typeof import('../../lib/dataClient')>();
  return {
    ...actual,
    dataClient: { models: { Trip: { list: m.list, create: m.create } } },
  };
});

import { fetchTripBySlug, useTrip, useEnsureTrip } from './tripApi';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('fetchTripBySlug', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the matching trip', async () => {
    m.list.mockResolvedValue({ data: [{ id: 't1', slug: 'greece-2027' }] });
    expect(await fetchTripBySlug('greece-2027')).toEqual({ id: 't1', slug: 'greece-2027' });
    expect(m.list).toHaveBeenCalledWith({ filter: { slug: { eq: 'greece-2027' } } });
  });

  it('returns null when no trip exists for the slug', async () => {
    m.list.mockResolvedValue({ data: [] });
    expect(await fetchTripBySlug('nope')).toBeNull();
  });

  it('throws when the read returns GraphQL errors', async () => {
    m.list.mockResolvedValue({ data: [], errors: [{ message: 'boom' }] });
    await expect(fetchTripBySlug('x')).rejects.toThrow('boom');
  });
});

describe('useTrip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads the trip for a slug', async () => {
    m.list.mockResolvedValue({ data: [{ id: 't1', slug: 'greece' }] });
    const { result } = renderHook(() => useTrip('greece'), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual({ id: 't1', slug: 'greece' }));
  });
});

describe('useEnsureTrip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the existing trip without creating', async () => {
    m.list.mockResolvedValue({ data: [{ id: 't1', slug: 'greece' }] });
    const { result } = renderHook(() => useEnsureTrip(), { wrapper });
    const trip = await result.current.mutateAsync({ slug: 'greece' });
    expect(trip).toEqual({ id: 't1', slug: 'greece' });
    expect(m.create).not.toHaveBeenCalled();
  });

  it('creates a trip titled from the given title when none exists', async () => {
    m.list.mockResolvedValue({ data: [] });
    m.create.mockResolvedValue({ data: { id: 't2', slug: 'peru', title: 'Peru!' } });
    const { result } = renderHook(() => useEnsureTrip(), { wrapper });
    const trip = await result.current.mutateAsync({ slug: 'peru', title: 'Peru!' });
    expect(m.create).toHaveBeenCalledWith({ slug: 'peru', title: 'Peru!' });
    expect(trip.id).toBe('t2');
  });

  it('falls back to a prettified title from the slug when none is given', async () => {
    m.list.mockResolvedValue({ data: [] });
    m.create.mockResolvedValue({ data: { id: 't3', slug: 'peru-2027', title: 'Peru 2027' } });
    const { result } = renderHook(() => useEnsureTrip(), { wrapper });
    await result.current.mutateAsync({ slug: 'peru-2027' });
    // "peru-2027" → "Peru 2027", not the raw slug.
    expect(m.create).toHaveBeenCalledWith({ slug: 'peru-2027', title: 'Peru 2027' });
  });
});
