/**
 * Pure merge of a live list's server snapshot with this tab's own writes.
 *
 * observeQuery lists first and connects its subscriptions in parallel, so a
 * write that lands before they connect is in neither the first page nor the
 * event stream. The overlay holds our own writes until the server view has
 * caught up, so a list can never lose something this tab just wrote.
 */
export interface LiveItem {
  id: string;
  updatedAt?: string | null;
}

export interface Overlay<T extends LiveItem> {
  upserts: ReadonlyMap<string, T>;
  deleted: ReadonlySet<string>;
}

export const emptyOverlay = <T extends LiveItem>(): Overlay<T> => ({
  upserts: new Map(),
  deleted: new Set(),
});

/** Does a locally-written row belong in a list read with this filter? Only
 * `{ field: { eq } }` filters are understood; anything else is "no" — never
 * guess a row into a list it may not belong to. */
export function matchesFilter(item: object, filter: object): boolean {
  const row = item as Record<string, unknown>;
  return Object.entries(filter).every(([field, cond]) => {
    if (!cond || typeof cond !== 'object' || !('eq' in cond)) return false;
    return row[field] === (cond as { eq: unknown }).eq;
  });
}

const isNewer = (a?: string | null, b?: string | null) => (a ?? '') > (b ?? '');

/** True while the overlay copy is still ahead of (or missing from) the server. */
function overlayAhead<T extends LiveItem>(local: T, server: T | undefined): boolean {
  return !server || isNewer(local.updatedAt, server.updatedAt);
}

/** What to show: the server rows, with our newer writes on top and our
 * pending deletes removed. Order is left to the caller's sort. */
export function mergeLive<T extends LiveItem>(server: readonly T[], overlay: Overlay<T>): T[] {
  const byId = new Map(server.map((row) => [row.id, row]));
  for (const [id, local] of overlay.upserts) {
    if (overlayAhead(local, byId.get(id))) byId.set(id, local);
  }
  for (const id of overlay.deleted) byId.delete(id);
  return [...byId.values()];
}

/** Drop overlay entries the server snapshot now reflects, so later changes by
 * other collaborators (edits, deletes) win again. */
export function reconcile<T extends LiveItem>(
  server: readonly T[],
  overlay: Overlay<T>,
): Overlay<T> {
  const byId = new Map(server.map((row) => [row.id, row]));
  return {
    upserts: new Map(
      [...overlay.upserts].filter(([id, local]) => overlayAhead(local, byId.get(id))),
    ),
    deleted: new Set([...overlay.deleted].filter((id) => byId.has(id))),
  };
}
