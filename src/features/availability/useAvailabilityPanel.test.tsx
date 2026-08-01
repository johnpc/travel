import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const h = vi.hoisted(() => ({ useAvailability: vi.fn(), useMarkDay: vi.fn(), mutate: vi.fn() }));
vi.mock('./availabilityApi', () => ({
  useAvailability: h.useAvailability,
  useMarkDay: h.useMarkDay,
}));

import { useAvailabilityPanel } from './useAvailabilityPanel';
import type { AvailabilityRecord } from '../../lib/dataClient';

const marks = [
  { date: '2027-03-01', memberName: 'Alex', status: 'FREE' },
  { date: '2027-03-01', memberName: 'Sam', status: 'FREE' },
] as AvailabilityRecord[];

const start = { year: 2027, month: 3 };

describe('useAvailabilityPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.useAvailability.mockReturnValue({ data: marks, isLoading: false, isError: false, refetch: vi.fn() }); // prettier-ignore
    h.useMarkDay.mockReturnValue({ mutate: h.mutate, isPending: false });
  });

  it('exposes the month grid, tallies, and my status', () => {
    const { result } = renderHook(() => useAvailabilityPanel('t1', 'Alex', start));
    expect(result.current.month).toBe(3);
    expect(result.current.weeks.flat().filter(Boolean)).toHaveLength(31);
    expect(result.current.tallies['2027-03-01'].free).toBe(2);
    expect(result.current.statusFor('2027-03-01')).toBe('FREE');
    expect(result.current.canMark).toBe(true);
  });

  it('toggling cycles my mark (FREE → BUSY)', () => {
    const { result } = renderHook(() => useAvailabilityPanel('t1', 'Alex', start));
    act(() => result.current.toggle('2027-03-01'));
    expect(h.mutate).toHaveBeenCalledWith({ date: '2027-03-01', memberName: 'Alex', status: 'BUSY' }); // prettier-ignore
  });

  it('navigates months', () => {
    const { result } = renderHook(() => useAvailabilityPanel('t1', 'Alex', start));
    act(() => result.current.nextMonth());
    expect(result.current.month).toBe(4);
    act(() => result.current.prevMonth());
    act(() => result.current.prevMonth());
    expect(result.current.month).toBe(2);
  });

  it('cannot mark without an identity', () => {
    const { result } = renderHook(() => useAvailabilityPanel('t1', null, start));
    expect(result.current.canMark).toBe(false);
    act(() => result.current.toggle('2027-03-01'));
    expect(h.mutate).not.toHaveBeenCalled();
  });
});
