import { describe, it, expect, vi } from 'vitest';
import { announceWrite, deleteLive, writeLive } from './liveWrites';
import { onLocalWrite, publishWrite } from './liveStore';

describe('writeLive', () => {
  it('announces the saved row and returns it', async () => {
    const model = {};
    const seen = vi.fn();
    const stop = onLocalWrite(model, seen);
    const row = await writeLive(model, async () => ({ data: { id: 'a' } }));
    expect(row).toEqual({ id: 'a' });
    expect(seen).toHaveBeenCalledWith({ kind: 'upsert', item: { id: 'a' } });
    stop();
  });
  it('throws (and announces nothing) on GraphQL errors or no record', async () => {
    const model = {};
    const seen = vi.fn();
    const stop = onLocalWrite(model, seen);
    await expect(writeLive(model, async () => ({ data: null, errors: [{ message: 'no' }] }))).rejects.toThrow('no'); // prettier-ignore
    await expect(writeLive(model, async () => ({ data: null }))).rejects.toThrow('no record');
    expect(seen).not.toHaveBeenCalled();
    stop();
  });
});

describe('deleteLive', () => {
  it('hides the row at tap time', async () => {
    const model = {};
    const seen = vi.fn();
    const stop = onLocalWrite(model, seen);
    await deleteLive(model, 'a', async () => undefined);
    expect(seen).toHaveBeenCalledWith({ kind: 'delete', id: 'a' });
    expect(seen).toHaveBeenCalledTimes(1);
    stop();
  });
  it('puts the row back when the server refuses', async () => {
    const model = {};
    const seen = vi.fn();
    const stop = onLocalWrite(model, seen);
    await expect(deleteLive(model, 'a', async () => ({ data: null, errors: [{ message: 'denied' }] }))).rejects.toThrow('denied'); // prettier-ignore
    expect(seen).toHaveBeenLastCalledWith({ kind: 'restore', id: 'a' });
    stop();
  });
});

describe('announceWrite / liveStore', () => {
  it('announces only when there is a row, and only to that model', () => {
    const a = {};
    const b = {};
    const seenA = vi.fn();
    const seenB = vi.fn();
    const stopA = onLocalWrite(a, seenA);
    const stopB = onLocalWrite(b, seenB);
    announceWrite(a, null);
    announceWrite(a, { id: 'x' });
    expect(seenA).toHaveBeenCalledTimes(1);
    expect(seenB).not.toHaveBeenCalled();
    stopA();
    stopB();
    publishWrite(a, { kind: 'delete', id: 'x' });
    expect(seenA).toHaveBeenCalledTimes(1);
  });
});
