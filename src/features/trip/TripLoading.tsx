import { IonSpinner } from '@ionic/react';
import './tripLoading.css';

/** A warm, branded loading state for a trip while it's read or created on first
 * visit — reassures a first-time visitor (who just opened a shared link) that
 * something's happening, instead of anonymous skeleton rows. */
export function TripLoading() {
  return (
    <div className="trip-loading" data-testid="trip-loading">
      <IonSpinner name="crescent" className="trip-loading__spinner" />
      <p className="trip-loading__title tv-serif">Getting your trip ready…</p>
      <p className="tv-muted">Pulling together everyone's ideas, votes, and dates.</p>
    </div>
  );
}
