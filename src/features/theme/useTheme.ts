import { useCallback, useEffect, useState } from 'react';
import { applyThemeChoice, readThemeChoice, type ThemeChoice } from './themeStore';

/**
 * Reads the saved theme choice, applies it to <html> on mount, and exposes a
 * setter that persists + applies a new choice. All the pure logic lives in
 * themeStore; this hook just wires it to React state + the DOM.
 */
export function useTheme(): { choice: ThemeChoice; setChoice: (next: ThemeChoice) => void } {
  const [choice, setChoiceState] = useState<ThemeChoice>('system');

  useEffect(() => {
    const initial = readThemeChoice(window.localStorage);
    setChoiceState(initial);
    applyThemeChoice(initial, window.localStorage, document.documentElement);
  }, []);

  const setChoice = useCallback((next: ThemeChoice) => {
    setChoiceState(next);
    applyThemeChoice(next, window.localStorage, document.documentElement);
  }, []);

  return { choice, setChoice };
}
