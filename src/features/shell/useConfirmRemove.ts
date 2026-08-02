import { useIonAlert } from '@ionic/react';

// Where each kind of item lives — used in the confirm copy ("taken off the …").
const CONTAINER: Record<string, string> = {
  destination: 'board',
  stop: 'route',
  message: 'thread',
};

/**
 * A branded "are you sure?" confirm for a destructive remove — replaces the
 * stark OS window.confirm() with an on-brand IonAlert (Keep it / Remove). Pass
 * the item's name for the message and the removal callback; returns a handler to
 * wire to the remove control. No-op when onRemove is undefined.
 */
export function useConfirmRemove(noun: string, name: string, onRemove?: () => void) {
  const [presentAlert] = useIonAlert();
  return () => {
    if (!onRemove) return;
    presentAlert({
      header: `Remove this ${noun}?`,
      message: `“${name}” will be taken off the ${CONTAINER[noun] ?? 'list'}.`,
      buttons: [
        { text: 'Keep it', role: 'cancel' },
        { text: 'Remove', role: 'destructive', handler: onRemove },
      ],
    });
  };
}
