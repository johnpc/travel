import { IonIcon } from '@ionic/react';
import { sparklesOutline, homeOutline, openOutline } from 'ionicons/icons';
import { useSuggestHotels } from './hotelsApi';
import { airbnbUrl } from './bookingLinks';
import { HotelCard } from './HotelCard';
import './budget.css';

/** AI "where to stay" for a destination: a tap fetches real hotel picks across
 * price tiers (Book + Map links per pick) plus a median Airbnb price with a link
 * to compare. A lookup to help decide lodging — not persisted. */
export function HotelPicks({ destinationName }: { destinationName: string }) {
  const suggest = useSuggestHotels();
  const data = suggest.data;
  return (
    <div className="hotels" data-testid="hotels">
      <button
        type="button"
        className="budget__estimate"
        onClick={() => suggest.mutate({ destinationName })}
        disabled={suggest.isPending}
        data-testid="hotels-suggest"
      >
        <IonIcon icon={sparklesOutline} aria-hidden="true" />
        {suggest.isPending ? 'Finding stays…' : 'Where to stay'}
      </button>
      {suggest.isError && !suggest.isPending && (
        <p className="budget__error tv-muted" data-testid="hotels-error">
          The AI couldn’t find stays right now — tap to try again.
        </p>
      )}
      {data && (
        <>
          <ul className="hotels__list" data-testid="hotels-list">
            {data.hotels.map((h) => (
              <HotelCard key={h.name} hotel={h} destinationName={destinationName} />
            ))}
          </ul>
          {data.airbnbMedianPerNight != null && (
            <a
              className="hotels__airbnb budget__link"
              href={airbnbUrl(destinationName)}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="hotels-airbnb-median"
            >
              <IonIcon icon={homeOutline} aria-hidden="true" />
              Median Airbnb ~${data.airbnbMedianPerNight}/night
              <IonIcon icon={openOutline} aria-hidden="true" />
            </a>
          )}
        </>
      )}
    </div>
  );
}
