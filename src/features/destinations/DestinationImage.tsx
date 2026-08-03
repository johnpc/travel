import { IonIcon, IonSpinner } from '@ionic/react';
import { sparklesOutline, imageOutline } from 'ionicons/icons';
import { useMediaUrl } from '../../lib/useMediaUrl';
import { useWikiPhotosState } from './useWikiPhoto';
import { useDestinationImage } from './useDestinationImage';
import { PhotoCarousel } from './PhotoCarousel';
import type { DestinationRecord } from '../../lib/dataClient';
import './destinationImage.css';

interface DestinationImageProps {
  tripId: string | undefined;
  destination: DestinationRecord;
}

/** Photos of the destination — a swipeable carousel of REAL Commons photos shown
 * automatically (see the place at a glance, no tapping), or a group-generated AI
 * view once one exists. A subtle "imagine with AI" chip re-imagines it. When no
 * stock photo matches (a freeform name like "Zambia safari"), show an inviting
 * "no photo yet — imagine it" prompt rather than an empty box that reads broken. */
export function DestinationImage({ tripId, destination }: DestinationImageProps) {
  const generated = useMediaUrl(destination.imagePath);
  const { photos, settled } = useWikiPhotosState(destination.name);
  const gen = useDestinationImage(tripId, destination);
  const hasVisual = !!generated || photos.length > 0;
  const noPhoto = settled && photos.length === 0;
  return (
    <div className="destimg" data-testid="dest-image">
      {generated ? (
        <img
          className="destimg__img"
          src={generated}
          alt={`A view of ${destination.name}`}
          data-testid="dest-image-img"
          loading="lazy"
        />
      ) : photos.length > 0 ? (
        <PhotoCarousel photos={photos} alt={destination.name} />
      ) : noPhoto ? (
        // Settled with no stock match — an inviting empty state, not a void.
        <div className="destimg__empty" data-testid="dest-image-empty">
          <IonIcon icon={imageOutline} aria-hidden="true" />
          <span>No photo yet — imagine one below</span>
        </div>
      ) : (
        // Reserve the 3:2 image slot while photos resolve so the card below
        // doesn't jump when they arrive (was the biggest source of layout shift).
        <div
          className="destimg__placeholder"
          aria-hidden="true"
          data-testid="dest-image-placeholder"
        />
      )}
      <button
        type="button"
        className={hasVisual ? 'destimg__gen destimg__gen--float' : 'destimg__gen'}
        onClick={() => gen.mutate()}
        disabled={gen.isPending}
        data-testid="dest-image-gen"
      >
        {gen.isPending ? (
          <IonSpinner name="dots" data-testid="dest-image-loading" />
        ) : (
          <IonIcon icon={sparklesOutline} aria-hidden="true" />
        )}
        {gen.isPending ? 'Imagining…' : generated ? 'Reimagine with AI' : 'Imagine it with AI'}
      </button>
      {gen.isError && !gen.isPending && (
        <p className="destimg__error tv-muted" data-testid="dest-image-error">
          Couldn’t imagine an image right now — tap to try again.
        </p>
      )}
    </div>
  );
}
