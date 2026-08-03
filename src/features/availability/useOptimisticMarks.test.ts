import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOptimisticMarks } from './useOptimisticMarks';

describe('useOptimisticMarks', () => {
  it('shows the remembered status instantly, over the server value', () => {
    const server = () => null; // server hasn't recorded anything yet
    const { result } = renderHook(() => useOptimisticMarks(server));
    expect(result.current.shownStatus('2027-06-12')).toBeNull();
    act(() => result.current.remember('2027-06-12', 'FREE'));
    expect(result.current.shownStatus('2027-06-12')).toBe('FREE');
    // other days are unaffected — still read from the server
    expect(result.current.shownStatus('2027-06-13')).toBeNull();
  });

  it('drops the override once the server catches up to it', () => {
    let serverValue: 'FREE' | null = null;
    const { result, rerender } = renderHook(() => useOptimisticMarks(() => serverValue));
    act(() => result.current.remember('2027-06-12', 'FREE'));
    expect(result.current.shownStatus('2027-06-12')).toBe('FREE');
    // server now reports FREE too → the effect clears the pending override
    serverValue = 'FREE';
    rerender();
    expect(result.current.shownStatus('2027-06-12')).toBe('FREE'); // now from the server
  });

  it('remembers a cleared (null) mark distinctly from an unmarked day', () => {
    const { result } = renderHook(() => useOptimisticMarks(() => 'MAYBE'));
    // cycling to "clear" records null — must override the server's MAYBE
    act(() => result.current.remember('2027-06-12', null));
    expect(result.current.shownStatus('2027-06-12')).toBeNull();
  });

  it('rememberMany marks a whole span at once (range-select / school-break)', () => {
    const { result } = renderHook(() => useOptimisticMarks(() => null));
    act(() => result.current.rememberMany(['2027-06-12', '2027-06-13', '2027-06-14'], 'FREE'));
    expect(result.current.shownStatus('2027-06-12')).toBe('FREE');
    expect(result.current.shownStatus('2027-06-13')).toBe('FREE');
    expect(result.current.shownStatus('2027-06-14')).toBe('FREE');
    expect(result.current.shownStatus('2027-06-15')).toBeNull(); // outside the span
  });
});
