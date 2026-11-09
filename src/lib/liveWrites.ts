/**
 * Write helpers that show the user's own write in every live list at once,
 * instead of waiting for (and possibly missing) the subscription event.
 */
import { unwrap } from './dataClient';
import type { LiveItem } from './liveMerge';
import { publishWrite } from './liveStore';

type Result<T> = { data: T; errors?: readonly { message: string }[] };

/** Create or update through Amplify, then fold the saved row into `model`'s
 * live lists. Throws on GraphQL errors (nothing is shown). The row is the
 * server's own copy, so dependent queries never see a placeholder id. */
export async function writeLive<T extends LiveItem>(
  model: object,
  run: () => Promise<Result<T | null>>,
): Promise<T> {
  const saved = unwrap(await run());
  if (!saved) throw new Error('The write returned no record');
  publishWrite(model, { kind: 'upsert', item: saved });
  return saved;
}

/** Optimistic delete: hide the row at tap time, and put it back if the
 * server refuses. */
export async function deleteLive(
  model: object,
  id: string,
  run: () => Promise<Result<unknown> | undefined>,
): Promise<void> {
  publishWrite(model, { kind: 'delete', id });
  try {
    const res = await run();
    if (res) unwrap(res);
  } catch (err) {
    publishWrite(model, { kind: 'restore', id });
    throw err;
  }
}

/** Fold an already-saved row into `model`'s live lists (for create-or-update
 * flows that pick their own write). No-op without a row. */
export function announceWrite(model: object, saved: LiveItem | null | undefined): void {
  if (saved) publishWrite(model, { kind: 'upsert', item: saved });
}
