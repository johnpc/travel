import { useEffect, useState } from 'react';

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

/**
 * Live-subscribe to a filtered Amplify list via observeQuery: every
 * collaborator's create/update/delete streams in without a manual refetch.
 * observeQuery emits the FULL current set on each change, so we just sort + store
 * it. Exposes the same shape as a react-query read (data/isLoading/isError/
 * refetch) so callers are interchangeable. `enabled` defers until an id is known.
 */
export function useLiveQuery<T>(
  model: Observable<T>,
  filter: object,
  sort: (a: T, b: T) => number,
  enabled = true,
): LiveResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isError, setError] = useState(false);
  const [nonce, setNonce] = useState(0);
  const filterKey = JSON.stringify(filter);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    setError(false);
    const sub = model.observeQuery({ filter }).subscribe({
      next: ({ items }) => {
        setData([...items].sort(sort));
        setLoading(false);
      },
      error: () => {
        setError(true);
        setLoading(false);
      },
    });
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, filterKey, nonce]);

  return { data, isLoading: enabled && isLoading, isError, refetch: () => setNonce((n) => n + 1) };
}
