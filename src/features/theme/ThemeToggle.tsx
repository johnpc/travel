import { IonButton, IonIcon } from '@ionic/react';
import { contrastOutline, sunnyOutline, moonOutline } from 'ionicons/icons';
import { useTheme } from './useTheme';
import { nextChoice, themeIcon, themeLabel } from './themeCycle';

const ICONS: Record<string, string> = {
  contrastOutline,
  sunnyOutline,
  moonOutline,
};

interface ThemeToggleProps {
  /** Ionic slot (e.g. "end") when placed in a toolbar; omit off-toolbar. */
  slot?: string;
}

/** One-tap theme control: cycles System → Light → Dark, showing the current
 * mode's icon. The full choice machinery lives in useTheme/themeStore; this is
 * just the visible affordance so users aren't stuck on their OS preference. */
export function ThemeToggle({ slot }: ThemeToggleProps) {
  const { choice, setChoice } = useTheme();
  return (
    <IonButton
      slot={slot}
      fill="clear"
      onClick={() => setChoice(nextChoice(choice))}
      aria-label={themeLabel(choice)}
      title={themeLabel(choice)}
      data-testid="theme-toggle"
      data-choice={choice}
    >
      <IonIcon slot="icon-only" icon={ICONS[themeIcon(choice)]} aria-hidden="true" />
    </IonButton>
  );
}
