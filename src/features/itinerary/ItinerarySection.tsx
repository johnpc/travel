import { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { mapOutline, addOutline } from 'ionicons/icons';
import { useItineraryPanel } from './useItineraryPanel';
import { ItineraryBody } from './ItineraryBody';
import './itinerary.css';

interface ItinerarySectionProps {
  tripId: string | undefined;
  tripTitle: string;
}

/** Multi-city itinerary (opt-in). Most trips are single-destination, so when
 * there are no stops this stays a COMPACT one-line teaser — tap to open the full
 * route editor. Once it has stops it always shows the editor. Keeps the busy
 * add/AI/list UI out of the way until someone actually wants a multi-city route. */
export function ItinerarySection({ tripId, tripTitle }: ItinerarySectionProps) {
  const p = useItineraryPanel(tripId, tripTitle);
  const [open, setOpen] = useState(false);
  const expanded = open || p.stops.length > 0;
  return (
    <section className="itin" data-testid="itinerary">
      {expanded ? (
        <h2 className="tv-kicker itin__kicker tv-section-title">
          <IonIcon icon={mapOutline} aria-hidden="true" /> Multi-city route
        </h2>
      ) : (
        <button
          type="button"
          className="itin__teaser"
          onClick={() => setOpen(true)}
          data-testid="itinerary-open"
        >
          <IonIcon icon={mapOutline} aria-hidden="true" className="itin__teaser-lead" />
          <span className="itin__teaser-text">
            <strong>Multi-city trip?</strong> Plan a route across several stops.
          </span>
          <IonIcon icon={addOutline} aria-hidden="true" className="itin__teaser-add" />
        </button>
      )}
      {expanded && <ItineraryBody panel={p} />}
    </section>
  );
}
