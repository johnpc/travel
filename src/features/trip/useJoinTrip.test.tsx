import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const m = vi.hoisted(() => ({ mutateAsync: vi.fn() }));
vi.mock('./memberApi', () => ({
  useAddMember: () => ({ mutateAsync: m.mutateAsync, isPending: false }),
}));

import { useJoinTrip } from './useJoinTrip';
import type { MemberRecord } from '../../lib/dataClient';

const member = (name: string): MemberRecord => ({ name }) as MemberRecord;

describe('useJoinTrip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    m.mutateAsync.mockResolvedValue({ name: 'x' });
  });

  it('auto-selects the remembered name once it is on the roster', async () => {
    window.localStorage.setItem('tv-identity:greece', 'Alex');
    const { result } = renderHook(() => useJoinTrip('greece', 't1', [member('Alex')]));
    await waitFor(() => expect(result.current.me).toBe('Alex'));
  });

  it('joining a new name adds a member and remembers it', async () => {
    const { result } = renderHook(() => useJoinTrip('greece', 't1', []));
    await act(async () => {
      await result.current.join('Sam');
    });
    expect(m.mutateAsync).toHaveBeenCalledWith('Sam');
    expect(result.current.me).toBe('Sam');
    expect(window.localStorage.getItem('tv-identity:greece')).toBe('Sam');
  });

  it('joining an existing name does NOT create a duplicate member', async () => {
    const { result } = renderHook(() => useJoinTrip('greece', 't1', [member('Sam')]));
    await act(async () => {
      await result.current.join('Sam');
    });
    expect(m.mutateAsync).not.toHaveBeenCalled();
    expect(result.current.me).toBe('Sam');
  });

  it('ignores a blank join', async () => {
    const { result } = renderHook(() => useJoinTrip('greece', 't1', []));
    await act(async () => {
      await result.current.join('   ');
    });
    expect(m.mutateAsync).not.toHaveBeenCalled();
    expect(result.current.me).toBeNull();
  });

  it('pick selects a name and remembers it', () => {
    const { result } = renderHook(() => useJoinTrip('greece', 't1', [member('Priya')]));
    act(() => result.current.pick('Priya'));
    expect(result.current.me).toBe('Priya');
    expect(window.localStorage.getItem('tv-identity:greece')).toBe('Priya');
  });
});
