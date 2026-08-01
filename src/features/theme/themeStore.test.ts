import { describe, it, expect, vi } from 'vitest';
import { readThemeChoice, applyThemeChoice } from './themeStore';

describe('readThemeChoice', () => {
  it('returns the saved valid choice', () => {
    expect(readThemeChoice({ getItem: () => 'dark' })).toBe('dark');
    expect(readThemeChoice({ getItem: () => 'light' })).toBe('light');
  });

  it('defaults to system when unset or invalid', () => {
    expect(readThemeChoice({ getItem: () => null })).toBe('system');
    expect(readThemeChoice({ getItem: () => 'neon' })).toBe('system');
  });
});

describe('applyThemeChoice', () => {
  it('persists and sets data-theme for an explicit choice', () => {
    const setItem = vi.fn();
    const setAttribute = vi.fn();
    const removeAttribute = vi.fn();
    applyThemeChoice('dark', { setItem }, { setAttribute, removeAttribute });
    expect(setItem).toHaveBeenCalledWith('tv-theme', 'dark');
    expect(setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    expect(removeAttribute).not.toHaveBeenCalled();
  });

  it('clears data-theme for system so the OS preference wins', () => {
    const setItem = vi.fn();
    const setAttribute = vi.fn();
    const removeAttribute = vi.fn();
    applyThemeChoice('system', { setItem }, { setAttribute, removeAttribute });
    expect(setItem).toHaveBeenCalledWith('tv-theme', 'system');
    expect(removeAttribute).toHaveBeenCalledWith('data-theme');
    expect(setAttribute).not.toHaveBeenCalled();
  });
});
