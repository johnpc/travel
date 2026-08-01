import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRangeSelect } from './useRangeSelect';

describe('useRangeSelect', () => {
  it('first tap sets pending start, second completes the span', () => {
    const onRange = vi.fn();
    const { result } = renderHook(() => useRangeSelect(onRange));
    act(() => result.current.pick('2027-06-10'));
    expect(result.current.start).toBe('2027-06-10');
    expect(result.current.inRange('2027-06-10')).toBe(true);
    expect(onRange).not.toHaveBeenCalled();

    act(() => result.current.pick('2027-06-12'));
    expect(onRange).toHaveBeenCalledWith(['2027-06-10', '2027-06-11', '2027-06-12']);
    expect(result.current.start).toBeNull();
  });

  it('tapping the same day twice marks just that day', () => {
    const onRange = vi.fn();
    const { result } = renderHook(() => useRangeSelect(onRange));
    act(() => result.current.pick('2027-06-10'));
    act(() => result.current.pick('2027-06-10'));
    expect(onRange).toHaveBeenCalledWith(['2027-06-10']);
  });

  it('cancel clears the pending start', () => {
    const { result } = renderHook(() => useRangeSelect(vi.fn()));
    act(() => result.current.pick('2027-06-10'));
    act(() => result.current.cancel());
    expect(result.current.start).toBeNull();
  });
});
