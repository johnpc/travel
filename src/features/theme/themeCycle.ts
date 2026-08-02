/**
 * Pure presentation helpers for the theme toggle — unit-tested, no DOM. The
 * toggle cycles System → Light → Dark → System; each choice maps to an icon
 * name and an accessible label so the button always states the current mode.
 */
import type { ThemeChoice } from './themeStore';

const ORDER: ThemeChoice[] = ['system', 'light', 'dark'];

/** The next choice in the System → Light → Dark → System cycle. */
export function nextChoice(current: ThemeChoice): ThemeChoice {
  const i = ORDER.indexOf(current);
  return ORDER[(i + 1) % ORDER.length];
}

/** ionicon name for the current choice (contrast=system, sunny=light, moon=dark). */
export function themeIcon(choice: ThemeChoice): string {
  if (choice === 'light') return 'sunnyOutline';
  if (choice === 'dark') return 'moonOutline';
  return 'contrastOutline';
}

/** Accessible label naming the current mode and what a tap will do next. */
export function themeLabel(choice: ThemeChoice): string {
  const name = choice === 'system' ? 'System' : choice === 'light' ? 'Light' : 'Dark';
  const next = nextChoice(choice);
  const nextName = next === 'system' ? 'System' : next === 'light' ? 'Light' : 'Dark';
  return `Theme: ${name}. Switch to ${nextName}.`;
}
