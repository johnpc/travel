import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const h = vi.hoisted(() => ({
  useAvailability: vi.fn(),
  useMarkDay: vi.fn(),
  useMarkRange: vi.fn(),
  markDay: vi.fn(),
  markRange: vi.fn(),
}));
vi.mock('./availabilityApi', () => ({
  useAvailability: h.useAvailability,
  useMarkDay: h.useMarkDay,
  useMarkRange: h.useMarkRange,
}));

import { useAvailabilityPanel } from './useAvailabilityPanel';
import type { AvailabilityRecord } from '../../lib/dataClient';

const marks = [
  { date: '2027-06-12', memberName: 'Alex', status: 'FREE' },
  { date: '2027-06-13', memberName: 'Alex', status: 'FREE' },
] as AvailabilityRecord[];

const today = { year: 2026, month: 1, day: 1 };

describe('useAvailabilityPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.useAvailability.mockReturnValue({ data: marks, isLoading: false, isError: false, refetch: vi.fn() }); // prettier-ignore
    h.useMarkDay.mockReturnValue({ mutate: h.markDay });
    h.useMarkRange.mockReturnValue({ mutate: h.markRange });
  });

  it('opens on the busiest month and surfaces candidate windows', () => {
    const { result } = renderHook(() => useAvailabilityPanel('t1', 'Alex', today));
    expect(result.current.month).toBe(6); // busiest month wins over today (Jan 2026)
    expect(result.current.year).toBe(2027);
    expect(result.current.windows[0]).toMatchObject({ start: '2027-06-12', days: 2 });
  });

  it('range-picks a span and marks it FREE (tap start → tap end)', () => {
    const { result } = renderHook(() => useAvailabilityPanel('t1', 'Alex', today));
    act(() => result.current.pickRange('2027-06-20'));
    expect(result.current.rangeStart).toBe('2027-06-20');
    act(() => result.current.pickRange('2027-06-22'));
    expect(h.markRange).toHaveBeenCalledWith({
      dates: ['2027-06-20', '2027-06-21', '2027-06-22'],
      memberName: 'Alex',
      status: 'FREE',
    });
  });

  it('single-day toggle cycles my mark', () => {
    const { result } = renderHook(() => useAvailabilityPanel('t1', 'Alex', today));
    act(() => result.current.toggle('2027-06-12')); // currently FREE → BUSY
    expect(h.markDay).toHaveBeenCalledWith({ date: '2027-06-12', memberName: 'Alex', status: 'BUSY' }); // prettier-ignore
  });

  it('jumps to a window’s month', () => {
    const { result } = renderHook(() => useAvailabilityPanel('t1', 'Alex', today));
    act(() => result.current.jumpTo({ start: '2028-03-01', end: '2028-03-03', days: 3, minFree: 1, maxFree: 1 })); // prettier-ignore
    expect(result.current).toMatchObject({ year: 2028, month: 3 });
  });

  it('cannot mark without an identity', () => {
    const { result } = renderHook(() => useAvailabilityPanel('t1', null, today));
    expect(result.current.canMark).toBe(false);
    act(() => result.current.toggle('2027-06-12'));
    expect(h.markDay).not.toHaveBeenCalled();
  });

  it('offers upcoming school breaks and picking one jumps there + marks me free', () => {
    const { result } = renderHook(() => useAvailabilityPanel('t1', 'Alex', today));
    expect(result.current.breaks.map((b) => b.label)).toContain('Spring Break');
    const spring = result.current.breaks.find((b) => b.label === 'Spring Break')!;
    act(() => result.current.pickBreak(spring));
    expect(result.current).toMatchObject({ year: 2026, month: 3 });
    expect(h.markRange).toHaveBeenCalledWith(
      expect.objectContaining({ memberName: 'Alex', status: 'FREE' }),
    );
  });

  it('does not mark a picked break without an identity, but still jumps', () => {
    const { result } = renderHook(() => useAvailabilityPanel('t1', null, today));
    const spring = result.current.breaks.find((b) => b.label === 'Spring Break')!;
    act(() => result.current.pickBreak(spring));
    expect(result.current).toMatchObject({ month: 3 });
    expect(h.markRange).not.toHaveBeenCalled();
  });
});
