import { IonIcon } from '@ionic/react';
import {
  openOutline,
  locationOutline,
  addCircleOutline,
  removeCircleOutline,
} from 'ionicons/icons';
import { hotelBookingUrl, hotelMapUrl } from './bookingLinks';
import type { HotelPick } from './hotelsApi';

interface HotelCardProps {
  hotel: HotelPick;
  destinationName: string;
}

/** One AI hotel pick: tier badge + nightly price, area, one pro / one con, and
 * links that open a real Booking.com listing search + Google Maps for it (the
 * property's real photos/reviews live there — we never fake a listing URL). */
export function HotelCard({ hotel: h, destinationName }: HotelCardProps) {
  const tierClass = `hotel__tier hotel__tier--${h.tier.toLowerCase().replace(/[^a-z]/g, '')}`;
  return (
    <li className="hotel" data-testid="hotel-card">
      <div className="hotel__head">
        <span className={tierClass}>{h.tier}</span>
        {h.pricePerNight != null && (
          <span className="hotel__price">
            ${h.pricePerNight}
            <span className="tv-muted"> / night</span>
          </span>
        )}
      </div>
      <span className="hotel__name tv-serif">{h.name}</span>
      {h.area && <span className="hotel__area tv-muted">{h.area}</span>}
      {h.pros && (
        <p className="hotel__pro">
          <IonIcon icon={addCircleOutline} aria-hidden="true" /> {h.pros}
        </p>
      )}
      {h.cons && (
        <p className="hotel__con">
          <IonIcon icon={removeCircleOutline} aria-hidden="true" /> {h.cons}
        </p>
      )}
      <div className="hotel__links">
        <a
          className="budget__link"
          href={hotelBookingUrl(h.name, destinationName)}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="hotel-book"
        >
          Book <IonIcon icon={openOutline} aria-hidden="true" />
        </a>
        <a
          className="budget__link"
          href={hotelMapUrl(h.name, destinationName)}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="hotel-map"
        >
          <IonIcon icon={locationOutline} aria-hidden="true" /> Map
        </a>
      </div>
    </li>
  );
}
