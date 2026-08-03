import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOptimisticVote } from './useOptimisticVote';

describe('useOptimisticVote', () => {
  it('shows the tapped level instantly (before the server echoes it back)', () => {
    const onVote = vi.fn();
    const { result } = renderHook(() => useOptimisticVote(null, onVote));
    expect(result.current.shownLevel).toBeNull();
    act(() => result.current.cast('YES'));
    // optimistic: shown immediately + the real cast was invoked
    expect(result.current.shownLevel).toBe('YES');
    expect(onVote).toHaveBeenCalledWith('YES');
  });

  it('defers to the real level and clears the optimistic value once it catches up', () => {
    const onVote = vi.fn();
    const { result, rerender } = renderHook(({ level }) => useOptimisticVote(level, onVote), {
      initialProps: { level: null as 'YES' | 'MAYBE' | 'NO' | null },
    });
    act(() => result.current.cast('YES'));
    expect(result.current.shownLevel).toBe('YES');
    // server confirms → myLevel becomes YES; optimistic override clears, no flicker
    rerender({ level: 'YES' });
    expect(result.current.shownLevel).toBe('YES');
  });

  it('reflects the real level when there is no pending tap', () => {
    const { result } = renderHook(() => useOptimisticVote('MAYBE', vi.fn()));
    expect(result.current.shownLevel).toBe('MAYBE');
  });
});
