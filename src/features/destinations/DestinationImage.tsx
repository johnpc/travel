import { IonButton, IonIcon, IonSpinner } from '@ionic/react';
import { imageOutline } from 'ionicons/icons';
import { useMediaUrl } from '../../lib/useMediaUrl';
import { useDestinationImage } from './useDestinationImage';
import type { DestinationRecord } from '../../lib/dataClient';
import './destinationImage.css';

interface DestinationImageProps {
  tripId: string | undefined;
  destination: DestinationRecord;
}

/** A generated image of what you'd see at a destination. Shows the image if one
 * exists, otherwise a "generate" button; regenerates on demand. */
export function DestinationImage({ tripId, destination }: DestinationImageProps) {
  const url = useMediaUrl(destination.imagePath);
  const gen = useDestinationImage(tripId, destination);
  return (
    <div className="destimg" data-testid="dest-image">
      {url && (
        <img
          className="destimg__img"
          src={url}
          alt={`A view of ${destination.name}`}
          data-testid="dest-image-img"
        />
      )}
      <IonButton
        size="small"
        fill={url ? 'clear' : 'outline'}
        onClick={() => gen.mutate()}
        disabled={gen.isPending}
        data-testid="dest-image-gen"
      >
        {gen.isPending ? (
          <IonSpinner slot="start" data-testid="dest-image-loading" />
        ) : (
          <IonIcon icon={imageOutline} slot="start" aria-hidden="true" />
        )}
        {gen.isPending ? 'Generating…' : url ? 'Regenerate image' : 'Generate a view with AI'}
      </IonButton>
    </div>
  );
}
