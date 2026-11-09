/**
 * In-tab bus from write helpers to live lists. A write is announced against
 * the model it touched; every mounted live list of that model folds it in.
 */
import type { LiveItem } from './liveMerge';

export type LocalWrite =
  | { kind: 'upsert'; item: LiveItem }
  | { kind: 'delete'; id: string }
  | { kind: 'restore'; id: string };

type Listener = (write: LocalWrite) => void;
const listeners = new Map<object, Set<Listener>>();

/** Listen for this tab's writes to `model`. Returns the unsubscribe. */
export function onLocalWrite(model: object, listener: Listener): () => void {
  const set = listeners.get(model) ?? new Set<Listener>();
  set.add(listener);
  listeners.set(model, set);
  return () => {
    set.delete(listener);
    if (!set.size) listeners.delete(model);
  };
}

/** Announce a write to `model` to its live lists. */
export function publishWrite(model: object, write: LocalWrite): void {
  listeners.get(model)?.forEach((listener) => listener(write));
}
