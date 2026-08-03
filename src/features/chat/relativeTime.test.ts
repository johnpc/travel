import { describe, it, expect } from 'vitest';
import { relativeTime } from './relativeTime';

const now = Date.parse('2027-06-01T12:00:00Z');
const ago = (ms: number) => new Date(now - ms).toISOString();

describe('relativeTime', () => {
  it('says "just now" under a minute', () => {
    expect(relativeTime(ago(30_000), now)).toBe('just now');
  });

  it('shows minutes, hours, then days within a week', () => {
    expect(relativeTime(ago(5 * 60_000), now)).toBe('5m');
    expect(relativeTime(ago(3 * 3_600_000), now)).toBe('3h');
    expect(relativeTime(ago(2 * 86_400_000), now)).toBe('2d');
  });

  it('falls back to a short date past a week', () => {
    // 10 days earlier → a month/day label, not "10d"
    expect(relativeTime(ago(10 * 86_400_000), now)).toMatch(/May\s+\d+/);
  });

  it('returns empty for missing or unparseable input', () => {
    expect(relativeTime(null, now)).toBe('');
    expect(relativeTime(undefined, now)).toBe('');
    expect(relativeTime('not-a-date', now)).toBe('');
  });
});
