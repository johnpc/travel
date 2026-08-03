import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Subtle tactile feedback for the app's core taps — native only. On the web the
 * plugin logs noisy warnings and does nothing useful, so we guard with
 * `isNativePlatform()` and swallow any error (haptics are a nice-to-have; a
 * failure must never break the action that triggered them).
 */
function native(): boolean {
  return Capacitor.isNativePlatform();
}

/** A light tap — for frequent, low-stakes actions (casting a vote, marking a day). */
export function tapLight(): void {
  if (!native()) return;
  Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
}

/** A success buzz — for the payoff moment (the plan reaches "aligned"). */
export function tapSuccess(): void {
  if (!native()) return;
  Haptics.notification({ type: NotificationType.Success }).catch(() => {});
}
