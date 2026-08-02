import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWikiPhotos, useWikiPhoto } from './useWikiPhoto';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const payload = (urls: string[]) => ({
  query: {
    pages: Object.fromEntries(
      urls.map((u, i) => [i, { index: i, title: `File:${i}.jpg`, imageinfo: [{ thumburl: u }] }]),
    ),
  },
});

describe('useWikiPhotos', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns real scenic photo URLs from Commons', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => payload(['https://x/a.jpg', 'https://x/b.jpg']) }), // prettier-ignore
    );
    const { result } = renderHook(() => useWikiPhotos('Santorini, Greece'), { wrapper });
    await waitFor(() => expect(result.current).toEqual(['https://x/a.jpg', 'https://x/b.jpg']));
  });

  it('resolves to [] on a non-ok response (graceful fallback)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));
    const { result } = renderHook(() => useWikiPhotos('Nowhere'), { wrapper });
    await waitFor(() => expect(result.current).toEqual([]));
  });

  it('does not fetch without a destination name', () => {
    const f = vi.fn();
    vi.stubGlobal('fetch', f);
    renderHook(() => useWikiPhotos(undefined), { wrapper });
    expect(f).not.toHaveBeenCalled();
  });

  it('useWikiPhoto returns just the lead photo', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => payload(['https://x/lead.jpg']) }),
    );
    const { result } = renderHook(() => useWikiPhoto('Kyoto'), { wrapper });
    await waitFor(() => expect(result.current).toBe('https://x/lead.jpg'));
  });
});
