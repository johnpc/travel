import { describe, it, expect } from 'vitest';
import { nextChoice, themeIcon, themeLabel } from './themeCycle';

describe('themeToggle helpers', () => {
  it('cycles System → Light → Dark → System', () => {
    expect(nextChoice('system')).toBe('light');
    expect(nextChoice('light')).toBe('dark');
    expect(nextChoice('dark')).toBe('system');
  });

  it('maps each choice to a distinct icon', () => {
    expect(themeIcon('system')).toBe('contrastOutline');
    expect(themeIcon('light')).toBe('sunnyOutline');
    expect(themeIcon('dark')).toBe('moonOutline');
  });

  it('labels the current mode and the next one for screen readers', () => {
    expect(themeLabel('system')).toBe('Theme: System. Switch to Light.');
    expect(themeLabel('dark')).toBe('Theme: Dark. Switch to System.');
  });
});
