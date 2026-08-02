import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to system and cycles System → Light → Dark → System on tap', () => {
    render(<ThemeToggle />);
    const btn = screen.getByTestId('theme-toggle');
    expect(btn).toHaveAttribute('data-choice', 'system');

    fireEvent.click(btn);
    expect(btn).toHaveAttribute('data-choice', 'light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    fireEvent.click(btn);
    expect(btn).toHaveAttribute('data-choice', 'dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    fireEvent.click(btn);
    expect(btn).toHaveAttribute('data-choice', 'system');
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });

  it('exposes an accessible label describing the current + next mode', () => {
    render(<ThemeToggle />);
    expect(screen.getByTestId('theme-toggle')).toHaveAttribute(
      'aria-label',
      'Theme: System. Switch to Light.',
    );
  });
});
