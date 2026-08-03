import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecents } from './useRecents';
import { recordRecent } from './recentsStore';

describe('useRecents', () => {
  beforeEach(() => window.localStorage.clear());

  it('reads the device recents on mount', () => {
    recordRecent({ slug: 'greece-2027', title: 'Greece 2027' }, window.localStorage);
    const { result } = renderHook(() => useRecents());
    expect(result.current.recents).toEqual([{ slug: 'greece-2027', title: 'Greece 2027' }]);
  });

  it('is empty when the device has opened no trips', () => {
    const { result } = renderHook(() => useRecents());
    expect(result.current.recents).toEqual([]);
  });

  it('remove drops a trip from the list (and persists it)', () => {
    recordRecent({ slug: 'a', title: 'A' }, window.localStorage);
    recordRecent({ slug: 'b', title: 'B' }, window.localStorage);
    const { result } = renderHook(() => useRecents());
    act(() => result.current.remove('a'));
    expect(result.current.recents.map((r) => r.slug)).toEqual(['b']);
    // persisted — a fresh hook reads the trimmed list
    expect(renderHook(() => useRecents()).result.current.recents.map((r) => r.slug)).toEqual(['b']);
  });
});
