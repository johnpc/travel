import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

const h = vi.hoisted(() => ({
  useTrip: vi.fn(),
  useEnsureTrip: vi.fn(),
  useMembers: vi.fn(),
  mutate: vi.fn(),
}));
vi.mock('react-router-dom', () => ({
  useParams: () => ({ slug: 'greece' }),
  useLocation: () => ({ state: { title: 'Greece 2027' } }),
}));
vi.mock('./tripApi', () => ({ useTrip: h.useTrip, useEnsureTrip: h.useEnsureTrip }));
vi.mock('./memberApi', () => ({ useMembers: h.useMembers }));

import { useTripPage } from './useTripPage';

const ensure = (over = {}) => ({ mutate: h.mutate, isPending: false, isSuccess: false, isError: false, ...over }); // prettier-ignore

describe('useTripPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.useEnsureTrip.mockReturnValue(ensure());
    h.useMembers.mockReturnValue({ data: [], isLoading: false, isError: false, refetch: vi.fn() });
  });

  it('creates the trip on first visit when the read settles empty', async () => {
    h.useTrip.mockReturnValue({ data: null, isSuccess: true, isLoading: false, isError: false, refetch: vi.fn() }); // prettier-ignore
    renderHook(() => useTripPage());
    await waitFor(() =>
      expect(h.mutate).toHaveBeenCalledWith({ slug: 'greece', title: 'Greece 2027' }),
    );
  });

  it('does not re-create when the trip already exists', () => {
    h.useTrip.mockReturnValue({ data: { id: 't1', title: 'Greece 2027' }, isSuccess: true, isLoading: false, isError: false, refetch: vi.fn() }); // prettier-ignore
    const { result } = renderHook(() => useTripPage());
    expect(h.mutate).not.toHaveBeenCalled();
    expect(result.current.trip).toEqual({ id: 't1', title: 'Greece 2027' });
  });

  it('surfaces an error when any query fails', () => {
    h.useTrip.mockReturnValue({ data: null, isSuccess: false, isLoading: false, isError: true, refetch: vi.fn() }); // prettier-ignore
    const { result } = renderHook(() => useTripPage());
    expect(result.current.isError).toBe(true);
  });
});
