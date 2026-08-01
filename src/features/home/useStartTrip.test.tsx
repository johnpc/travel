import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const push = vi.hoisted(() => vi.fn());
vi.mock('react-router-dom', () => ({ useHistory: () => ({ push }) }));

import { useStartTrip } from './useStartTrip';

describe('useStartTrip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('derives a slug from the typed name and can start when non-empty', () => {
    const { result } = renderHook(() => useStartTrip());
    expect(result.current.canStart).toBe(false);
    act(() => result.current.setName('Greece 2027'));
    expect(result.current.slug).toBe('greece-2027');
    expect(result.current.canStart).toBe(true);
  });

  it('navigates to the slug URL carrying the typed title', () => {
    const { result } = renderHook(() => useStartTrip());
    act(() => result.current.setName('Greece 2027'));
    act(() => result.current.start());
    expect(push).toHaveBeenCalledWith('/greece-2027', { title: 'Greece 2027' });
  });

  it('does nothing when there is no valid slug', () => {
    const { result } = renderHook(() => useStartTrip());
    act(() => result.current.setName('   '));
    act(() => result.current.start());
    expect(push).not.toHaveBeenCalled();
  });
});
