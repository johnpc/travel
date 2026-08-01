import { describe, it, expect, vi } from 'vitest';

vi.mock('aws-amplify/data', () => ({ generateClient: () => ({}) }));
const fetchAuthSession = vi.fn();
vi.mock('aws-amplify/auth', () => ({ fetchAuthSession: () => fetchAuthSession() }));

import { unwrap, readAuthMode } from './dataClient';

describe('unwrap', () => {
  it('returns data when there are no errors', () => {
    expect(unwrap({ data: [1, 2, 3] })).toEqual([1, 2, 3]);
  });

  it('throws (joining messages) when the result carries GraphQL errors', () => {
    expect(() => unwrap({ data: null, errors: [{ message: 'nope' }, { message: 'bad' }] })).toThrow(
      'nope; bad',
    );
  });
});

describe('readAuthMode', () => {
  it('upgrades to userPool when a session token exists', async () => {
    fetchAuthSession.mockResolvedValueOnce({ tokens: { accessToken: 'x' } });
    expect(await readAuthMode()).toBe('userPool');
  });

  it('falls back to identityPool for a guest', async () => {
    fetchAuthSession.mockResolvedValueOnce({ tokens: undefined });
    expect(await readAuthMode()).toBe('identityPool');
  });

  it('falls back to identityPool when the session lookup throws', async () => {
    fetchAuthSession.mockRejectedValueOnce(new Error('no session'));
    expect(await readAuthMode()).toBe('identityPool');
  });
});
