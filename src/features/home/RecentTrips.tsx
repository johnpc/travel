import { Link } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { arrowForwardOutline, closeOutline } from 'ionicons/icons';
import type { RecentTrip } from './recentsStore';

interface RecentTripsProps {
  recents: RecentTrip[];
  /** Drop a mistyped/one-off trip from this device's list (local only). */
  onRemove: (slug: string) => void;
}

/** "Jump back in" list of trips this device has opened. The account-free safety
 * net: without it, closing the tab loses the trip URL. A quiet × forgets a
 * mistyped/one-off trip (device-local; the trip itself is untouched). Hidden
 * when empty. */
export function RecentTrips({ recents, onRemove }: RecentTripsProps) {
  if (recents.length === 0) return null;
  return (
    <nav className="home-recents" data-testid="recent-trips" aria-label="Your recent trips">
      <p className="home-recents__label">Jump back in</p>
      <ul className="home-recents__list">
        {recents.map((r) => (
          <li key={r.slug} className="home-recents__row">
            <Link className="home-recents__item" to={`/${r.slug}`} data-testid="recent-trip">
              <span className="home-recents__title">{r.title}</span>
              <IonIcon icon={arrowForwardOutline} aria-hidden="true" />
            </Link>
            <button
              type="button"
              className="home-recents__forget"
              data-testid="recent-forget"
              aria-label={`Forget ${r.title}`}
              onClick={() => onRemove(r.slug)}
            >
              <IonIcon icon={closeOutline} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
