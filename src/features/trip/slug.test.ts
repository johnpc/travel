import { describe, it, expect } from 'vitest';
import { slugify, isValidSlug } from './slug';

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('Greece 2027')).toBe('greece-2027');
  });

  it('strips punctuation and collapses repeats', () => {
    expect(slugify('Alex & Sam’s   Big!! Trip')).toBe('alex-sam-s-big-trip');
  });

  it('trims leading/trailing hyphens', () => {
    expect(slugify('  --Hello--  ')).toBe('hello');
  });
});

describe('isValidSlug', () => {
  it('accepts clean slugs', () => {
    expect(isValidSlug('greece-2027')).toBe(true);
    expect(isValidSlug('trip')).toBe(true);
  });

  it('rejects empty, uppercase, or badly-hyphenated slugs', () => {
    expect(isValidSlug('')).toBe(false);
    expect(isValidSlug('Greece')).toBe(false);
    expect(isValidSlug('-greece')).toBe(false);
    expect(isValidSlug('greece--2027')).toBe(false);
    expect(isValidSlug('a b')).toBe(false);
  });
});
