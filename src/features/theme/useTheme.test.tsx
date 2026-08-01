import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTheme } from './useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('applies the saved choice to <html> on mount', async () => {
    window.localStorage.setItem('tv-theme', 'dark');
    const { result } = renderHook(() => useTheme());
    await waitFor(() => expect(result.current.choice).toBe('dark'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('setChoice persists and reflects a new choice, clearing for system', () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.setChoice('light'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(window.localStorage.getItem('tv-theme')).toBe('light');
    act(() => result.current.setChoice('system'));
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });
});
