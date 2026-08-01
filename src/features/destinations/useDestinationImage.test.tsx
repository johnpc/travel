import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const m = vi.hoisted(() => ({ gen: vi.fn() }));
vi.mock('../../lib/dataClient', async (importActual) => {
  const actual = await importActual<typeof import('../../lib/dataClient')>();
  return { ...actual, dataClient: { mutations: { generateDestinationImage: m.gen } } };
});

import { useDestinationImage } from './useDestinationImage';
import type { DestinationRecord } from '../../lib/dataClient';

const dest = { id: 'd1', name: 'Santorini', blurb: 'Blue domes.' } as DestinationRecord;

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useDestinationImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the resolver with the destination and returns the image path', async () => {
    m.gen.mockResolvedValue({ data: { imagePath: 'media/destinations/d1.webp' } });
    const { result } = renderHook(() => useDestinationImage('t1', dest), { wrapper });
    const path = await result.current.mutateAsync();
    expect(m.gen).toHaveBeenCalledWith({ destinationId: 'd1', name: 'Santorini', blurb: 'Blue domes.' }); // prettier-ignore
    expect(path).toBe('media/destinations/d1.webp');
  });

  it('throws when the resolver returns errors', async () => {
    m.gen.mockResolvedValue({ data: null, errors: [{ message: 'bedrock down' }] });
    const { result } = renderHook(() => useDestinationImage('t1', dest), { wrapper });
    await expect(result.current.mutateAsync()).rejects.toThrow('bedrock down');
  });

  it('throws when no image path comes back', async () => {
    m.gen.mockResolvedValue({ data: { imagePath: '' } });
    const { result } = renderHook(() => useDestinationImage('t1', dest), { wrapper });
    await expect(result.current.mutateAsync()).rejects.toThrow('no path');
  });
});
