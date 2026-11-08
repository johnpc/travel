import { useEffect, useMemo, useState } from 'react';
import { emptyOverlay, matchesFilter, mergeLive, reconcile, type LiveItem, type Overlay } from './liveMerge'; // prettier-ignore
import { onLocalWrite, type LocalWrite } from './liveStore';

/** The subset of an Amplify model we need to live-observe a filtered list. */
export interface Observable<T> {
  observeQuery: (opts: { filter?: object }) => {
    subscribe: (handlers: {
      next: (msg: { items: T[]; isSynced: boolean }) => void;
      error: (err: unknown) => void;
    }) => { unsubscribe: () => void };
  };
}

export interface LiveResult<T> {
  data: T[];
  isLoading: boolean;
  isError: boolean;
  /** Re-subscribe from scratch (used by LoadState retry). */
  refetch: () => void;
}

/** Fold one of this tab's writes into the overlay (rows outside the filter are ignored). */
function applyWrite<T extends LiveItem>(o: Overlay<T>, w: LocalWrite, filter: object): Overlay<T> {
  const upserts = new Map(o.upserts);
  const deleted = new Set(o.deleted);
  if (w.kind === 'upsert') {
    if (!matchesFilter(w.item, filter)) return o;
    upserts.set(w.item.id, w.item as T);
    deleted.delete(w.item.id);
  } else if (w.kind === 'delete') deleted.add(w.id);
  else deleted.delete(w.id);
  return { upserts, deleted };
}

/**
 * Live-subscribe to a filtered Amplify list via observeQuery: every
 * collaborator's create/update/delete streams in without a manual refetch.
 * This tab's OWN writes (see liveWrites) are folded in immediately too, because
 * observeQuery lists before its subscriptions connect: a write in that window
 * reached neither the first page nor the event stream, and was lost until a
 * reload. Same shape as a react-query read; `enabled` defers until an id is known.
 */
export function useLiveQuery<T extends LiveItem>(
  model: Observable<T>,
  filter: object,
  sort: (a: T, b: T) => number,
  enabled = true,
): LiveResult<T> {
  const [server, setServer] = useState<T[]>([]);
  const [overlay, setOverlay] = useState<Overlay<T>>(emptyOverlay);
  const [isLoading, setLoading] = useState(true);
  const [isError, setError] = useState(false);
  const [nonce, setNonce] = useState(0);
  const filterKey = JSON.stringify(filter);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    setError(false);
    setOverlay(emptyOverlay<T>());
    // Listen for our own writes BEFORE the list starts, so none can slip by.
    const stopLocal = onLocalWrite(model, (w) => setOverlay((o) => applyWrite(o, w, filter)));
    const sub = model.observeQuery({ filter }).subscribe({
      next: ({ items }) => {
        setServer(items);
        setOverlay((o) => reconcile(items, o));
        setLoading(false);
      },
      error: () => {
        setError(true);
        setLoading(false);
      },
    });
    return () => {
      stopLocal();
      sub.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, filterKey, nonce]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = useMemo(() => mergeLive(server, overlay).sort(sort), [server, overlay]);
  return { data, isLoading: enabled && isLoading, isError, refetch: () => setNonce((n) => n + 1) };
}
