import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRecents } from './useRecents';
import { recordRecent } from './recentsStore';

describe('useRecents', () => {
  beforeEach(() => window.localStorage.clear());

  it('reads the device recents on mount', () => {
    recordRecent({ slug: 'greece-2027', title: 'Greece 2027' }, window.localStorage);
    const { result } = renderHook(() => useRecents());
    expect(result.current).toEqual([{ slug: 'greece-2027', title: 'Greece 2027' }]);
  });

  it('is empty when the device has opened no trips', () => {
    const { result } = renderHook(() => useRecents());
    expect(result.current).toEqual([]);
  });
});
