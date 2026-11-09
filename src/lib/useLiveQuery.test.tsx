import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLiveQuery, type Observable } from './useLiveQuery';
import { publishWrite } from './liveStore';

/** A fake observeQuery-able model whose subscription we drive by hand. */
function fakeModel<T>() {
  let handlers: { next: (m: { items: T[]; isSynced: boolean }) => void; error: (e: unknown) => void } | null = null; // prettier-ignore
  const unsubscribe = vi.fn();
  const model: Observable<T> = {
    observeQuery: () => ({
      subscribe: (h) => {
        handlers = h;
        return { unsubscribe };
      },
    }),
  };
  return {
    model,
    emit: (items: T[]) => handlers?.next({ items, isSynced: true }),
    fail: () => handlers?.error(new Error('boom')),
    unsubscribe,
  };
}

const sort = (a: { id: string }, b: { id: string }) => a.id.localeCompare(b.id);

describe('useLiveQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is loading until the first snapshot, then exposes sorted data', async () => {
    const f = fakeModel<{ id: string }>();
    const { result } = renderHook(() => useLiveQuery(f.model, { tripId: { eq: 't1' } }, sort));
    expect(result.current.isLoading).toBe(true);
    act(() => f.emit([{ id: 'b' }, { id: 'a' }]));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data.map((x) => x.id)).toEqual(['a', 'b']);
  });

  it('updates as new snapshots stream in', async () => {
    const f = fakeModel<{ id: string }>();
    const { result } = renderHook(() => useLiveQuery(f.model, {}, sort));
    act(() => f.emit([{ id: 'a' }]));
    await waitFor(() => expect(result.current.data).toHaveLength(1));
    act(() => f.emit([{ id: 'a' }, { id: 'b' }]));
    await waitFor(() => expect(result.current.data).toHaveLength(2));
  });

  it('surfaces an error and stops loading when the subscription errors', async () => {
    const f = fakeModel<{ id: string }>();
    const { result } = renderHook(() => useLiveQuery(f.model, {}, sort));
    act(() => f.fail());
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.isLoading).toBe(false);
  });

  it('does not subscribe while disabled', () => {
    const f = fakeModel<{ id: string }>();
    const spy = vi.spyOn(f.model, 'observeQuery');
    renderHook(() => useLiveQuery(f.model, {}, sort, false));
    expect(spy).not.toHaveBeenCalled();
  });

  it('unsubscribes on unmount', () => {
    const f = fakeModel<{ id: string }>();
    const { unmount } = renderHook(() => useLiveQuery(f.model, {}, sort));
    unmount();
    expect(f.unsubscribe).toHaveBeenCalled();
  });

  it("shows this tab's own writes even when the subscription never delivers them", async () => {
    const f = fakeModel<{ id: string; tripId?: string }>();
    const { result } = renderHook(() => useLiveQuery(f.model, { tripId: { eq: 't1' } }, sort));
    act(() => f.emit([{ id: 'a', tripId: 't1' }]));
    await waitFor(() => expect(result.current.data).toHaveLength(1));
    act(() => publishWrite(f.model, { kind: 'upsert', item: { id: 'b', tripId: 't1' } as never }));
    act(() => publishWrite(f.model, { kind: 'upsert', item: { id: 'z', tripId: 't2' } as never }));
    expect(result.current.data.map((x) => x.id)).toEqual(['a', 'b']);
    act(() => publishWrite(f.model, { kind: 'delete', id: 'a' }));
    expect(result.current.data.map((x) => x.id)).toEqual(['b']);
    act(() => publishWrite(f.model, { kind: 'restore', id: 'a' }));
    expect(result.current.data.map((x) => x.id)).toEqual(['a', 'b']);
  });

  it('lets the server view win again once it has caught up', async () => {
    const f = fakeModel<{ id: string; tripId?: string }>();
    const { result } = renderHook(() => useLiveQuery(f.model, { tripId: { eq: 't1' } }, sort));
    act(() => f.emit([]));
    act(() => publishWrite(f.model, { kind: 'upsert', item: { id: 'b', tripId: 't1' } as never }));
    act(() => f.emit([{ id: 'b', tripId: 't1' }]));
    // A collaborator then deletes it: the caught-up overlay must not resurrect it.
    act(() => f.emit([]));
    await waitFor(() => expect(result.current.data).toEqual([]));
  });
});
