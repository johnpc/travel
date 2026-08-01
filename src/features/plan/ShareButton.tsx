import { IonButton, IonIcon } from '@ionic/react';
import { shareOutline, checkmarkOutline } from 'ionicons/icons';
import { useShare } from './useShare';

interface ShareButtonProps {
  /** The trip slug; the shared URL is the trip's public address. */
  slug: string;
}

/** Share the trip link — native share sheet on mobile, copy-to-clipboard on
 * desktop with a brief "Copied!" confirmation. */
export function ShareButton({ slug }: ShareButtonProps) {
  const url = `https://travel.jpc.io/${slug}`;
  const { share, copied } = useShare(url);
  return (
    <IonButton
      fill="clear"
      size="small"
      onClick={share}
      data-testid="share-trip"
      aria-label="Share trip link"
    >
      <IonIcon icon={copied ? checkmarkOutline : shareOutline} slot="start" aria-hidden="true" />
      {copied ? 'Copied!' : 'Share'}
    </IonButton>
  );
}
