import { Link } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { arrowForwardOutline } from 'ionicons/icons';
import type { RecentTrip } from './recentsStore';

interface RecentTripsProps {
  recents: RecentTrip[];
}

/** "Jump back in" list of trips this device has opened. The account-free safety
 * net: without it, closing the tab loses the trip URL. Hidden when empty. */
export function RecentTrips({ recents }: RecentTripsProps) {
  if (recents.length === 0) return null;
  return (
    <nav className="home-recents" data-testid="recent-trips" aria-label="Your recent trips">
      <p className="home-recents__label">Jump back in</p>
      <ul className="home-recents__list">
        {recents.map((r) => (
          <li key={r.slug}>
            <Link className="home-recents__item" to={`/${r.slug}`} data-testid="recent-trip">
              <span className="home-recents__title">{r.title}</span>
              <IonIcon icon={arrowForwardOutline} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
