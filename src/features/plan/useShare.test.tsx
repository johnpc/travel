import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useShare } from './useShare';

const URL = 'https://travel.jpc.io/greece-2027';
const DATA = { title: 'Greece 2027', text: 'Help plan Greece 2027', url: URL };

describe('useShare', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (navigator as any).share;
  });

  it('uses the native share sheet when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).share = share;
    const { result } = renderHook(() => useShare(DATA));
    await act(async () => {
      await result.current.share();
    });
    expect(share).toHaveBeenCalledWith(DATA);
    expect(result.current.copied).toBe(false);
  });

  it('falls back to clipboard + Copied! when no native share', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const { result } = renderHook(() => useShare(DATA));
    await act(async () => {
      await result.current.share();
    });
    expect(writeText).toHaveBeenCalledWith(URL);
    expect(result.current.copied).toBe(true);
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.copied).toBe(false);
  });
});
