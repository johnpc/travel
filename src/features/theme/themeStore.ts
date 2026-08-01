/**
 * Theme preference persistence + application. The user's explicit choice
 * (Light / Dark / System) is stored in localStorage and applied by setting
 * `data-theme` on <html> — the CSS token media query keys off both that
 * attribute and prefers-color-scheme (see theme/variables.css). 'system' clears
 * the attribute so the OS preference wins. Pure over injected storage/root so
 * it's unit-testable.
 */
export type ThemeChoice = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'tv-theme';
const CHOICES: readonly ThemeChoice[] = ['light', 'dark', 'system'];

/** Read the saved choice, defaulting to 'system' when unset/invalid. */
export function readThemeChoice(storage: Pick<Storage, 'getItem'>): ThemeChoice {
  const raw = storage.getItem(STORAGE_KEY);
  return CHOICES.includes(raw as ThemeChoice) ? (raw as ThemeChoice) : 'system';
}

/** Persist the choice and reflect it onto the root element's data-theme attr. */
export function applyThemeChoice(
  choice: ThemeChoice,
  storage: Pick<Storage, 'setItem'>,
  root: Pick<HTMLElement, 'setAttribute' | 'removeAttribute'>,
): void {
  storage.setItem(STORAGE_KEY, choice);
  if (choice === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', choice);
  }
}
