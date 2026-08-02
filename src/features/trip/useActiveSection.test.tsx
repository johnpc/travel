import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useActiveSection } from './useActiveSection';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useActiveSection', () => {
  it('returns null when IntersectionObserver is unavailable (SSR/jsdom)', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const { result } = renderHook(() => useActiveSection(['a', 'b']));
    expect(result.current).toBeNull();
  });

  it('observes the section elements that exist and reports the visible one', () => {
    document.body.innerHTML = '<div id="a"></div><div id="b"></div>';
    let cb: (entries: unknown[]) => void = () => {};
    const observe = vi.fn();
    class IO {
      constructor(fn: (entries: unknown[]) => void) {
        cb = fn;
      }
      observe = observe;
      disconnect = vi.fn();
    }
    vi.stubGlobal('IntersectionObserver', IO);
    const { result } = renderHook(() => useActiveSection(['a', 'b']));
    expect(observe).toHaveBeenCalledTimes(2);
    // simulate section "b" becoming visible
    act(() => cb([{ target: { id: 'b' }, isIntersecting: true, intersectionRatio: 0.6 }]));
    expect(result.current).toBe('b');
    document.body.innerHTML = '';
  });
});
