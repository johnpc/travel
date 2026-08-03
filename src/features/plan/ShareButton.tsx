import { IonButton, IonIcon } from '@ionic/react';
import { shareOutline, checkmarkOutline } from 'ionicons/icons';
import { useShare } from './useShare';

interface ShareButtonProps {
  /** The trip slug; the shared URL is the trip's public address. */
  slug: string;
  /** The trip's name — shared as the sheet title so recipients see context. */
  title: string;
}

/** Share the trip link — native share sheet on mobile (with the trip name + an
 * inviting message so it's not a bare URL), copy-to-clipboard on desktop with a
 * brief "Copied!" confirmation. */
export function ShareButton({ slug, title }: ShareButtonProps) {
  const url = `https://travel.jpc.io/${slug}`;
  const { share, copied } = useShare({
    title,
    text: `Help plan ${title} — add your name, vote on where to go, and mark when you're free.`,
    url,
  });
  // Icon-only by default (matches the back + theme buttons and keeps the header
  // title room on narrow phones); the copy confirmation briefly shows a label.
  return (
    <IonButton
      fill="clear"
      size="small"
      onClick={share}
      data-testid="share-trip"
      aria-label="Share trip link"
    >
      <IonIcon
        icon={copied ? checkmarkOutline : shareOutline}
        slot={copied ? 'start' : 'icon-only'}
        aria-hidden="true"
      />
      {copied ? 'Copied!' : ''}
    </IonButton>
  );
}
