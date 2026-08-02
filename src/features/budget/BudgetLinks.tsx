import { IonIcon } from '@ionic/react';
import { airplaneOutline, bedOutline, homeOutline, openOutline } from 'ionicons/icons';
import { flightsUrl, hotelsUrl, airbnbUrl } from './bookingLinks';
import './budget.css';

/** Real-price lookup links so the group can fill in (or sanity-check) the rough
 * budget from actual fares/listings — flights from DTW, hotels, and Airbnb for
 * the destination. Searches, so they always resolve; open in a new tab. */
export function BudgetLinks({ destinationName }: { destinationName: string }) {
  const links = [
    { href: flightsUrl(destinationName), icon: airplaneOutline, label: 'Flights from DTW' },
    { href: hotelsUrl(destinationName), icon: bedOutline, label: 'Hotels' },
    { href: airbnbUrl(destinationName), icon: homeOutline, label: 'Airbnb' },
  ];
  return (
    <div className="budget__links" data-testid="budget-links">
      <span className="tv-muted budget__links-hint">Check real prices:</span>
      {links.map((l) => (
        <a
          key={l.label}
          className="budget__link"
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={`budget-link-${l.label.split(' ')[0].toLowerCase()}`}
        >
          <IonIcon icon={l.icon} aria-hidden="true" />
          {l.label}
          <IonIcon icon={openOutline} className="budget__link-ext" aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}
