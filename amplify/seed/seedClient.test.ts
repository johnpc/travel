import { describe, it, expect, vi, beforeEach } from 'vitest';

// seedClient configures Amplify from amplify_outputs.json and reads .env.local
// at import time — stub those edges so the unit test exercises clearOneModel
// only, without touching the filesystem outputs or the SDK.
vi.mock('aws-amplify', () => ({ Amplify: { configure: vi.fn() } }));
vi.mock('aws-amplify/data', () => ({ generateClient: () => ({ models: {} }) }));
vi.mock('node:fs', async (importActual) => {
  const actual = await importActual<typeof import('node:fs')>();
  return { ...actual, readFileSync: () => '{}', existsSync: () => false };
});

import { clearOneModel } from './seedClient';

describe('clearOneModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('paginates through all pages and deletes every row', async () => {
    const list = vi
      .fn()
      .mockResolvedValueOnce({ data: [{ id: 'a' }, { id: 'b' }], nextToken: 't1' })
      .mockResolvedValueOnce({ data: [{ id: 'c' }], nextToken: null });
    const del = vi.fn().mockResolvedValue({});
    const removed = await clearOneModel({ list, delete: del });
    expect(removed).toBe(3);
    expect(del).toHaveBeenCalledTimes(3);
    expect(list).toHaveBeenCalledTimes(2);
  });

  it('skips null rows and rows without an id', async () => {
    const list = vi
      .fn()
      .mockResolvedValueOnce({ data: [null, { id: '' }, { id: 'x' }], nextToken: null });
    const del = vi.fn().mockResolvedValue({});
    const removed = await clearOneModel({ list, delete: del });
    expect(removed).toBe(1);
    expect(del).toHaveBeenCalledWith({ id: 'x' }, { authMode: 'userPool' });
  });
});
