import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const m = vi.hoisted(() => ({ getUrl: vi.fn() }));
vi.mock('aws-amplify/storage', () => ({ getUrl: m.getUrl }));

import { useMediaUrl } from './useMediaUrl';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useMediaUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null and does not fetch when there is no path', () => {
    const { result } = renderHook(() => useMediaUrl(null), { wrapper });
    expect(result.current).toBeNull();
    expect(m.getUrl).not.toHaveBeenCalled();
  });

  it('resolves a key to a presigned URL', async () => {
    m.getUrl.mockResolvedValue({ url: new URL('https://s3.example/img.webp?sig=1') });
    const { result } = renderHook(() => useMediaUrl('media/destinations/d1.webp'), { wrapper });
    await waitFor(() => expect(result.current).toBe('https://s3.example/img.webp?sig=1'));
    expect(m.getUrl).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'media/destinations/d1.webp' }),
    );
  });
});
