import { describe, it, expect, vi } from 'vitest';
import { readIdentity, saveIdentity } from './identityStore';

describe('readIdentity', () => {
  it('returns the saved name for a trip', () => {
    expect(readIdentity('greece-2027', { getItem: () => 'Alex' })).toBe('Alex');
  });

  it('returns null when unset or blank', () => {
    expect(readIdentity('greece-2027', { getItem: () => null })).toBeNull();
    expect(readIdentity('greece-2027', { getItem: () => '   ' })).toBeNull();
  });
});

describe('saveIdentity', () => {
  it('writes under a per-trip namespaced key', () => {
    const setItem = vi.fn();
    saveIdentity('greece-2027', 'Sam', { setItem });
    expect(setItem).toHaveBeenCalledWith('tv-identity:greece-2027', 'Sam');
  });
});
