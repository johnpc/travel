import { IonButton, IonIcon } from '@ionic/react';
import { airplaneOutline, bedOutline } from 'ionicons/icons';
import { flightsUrl, hotelsUrl, type BookingDates } from './planCrew';

interface PlanBookCtaProps {
  destinationName: string;
  /** The agreed date window — pre-fills the flight + hotel searches. */
  dates?: BookingDates;
}

/** The "lock it in" call-to-action: once the plan is settled, book the flights
 * and hotels. Links to real flight/stay searches for the destination,
 * pre-filled with the group's agreed dates. */
export function PlanBookCta({ destinationName, dates }: PlanBookCtaProps) {
  return (
    <div className="plan__cta" data-testid="plan-book">
      <p className="plan__cta-label">You're aligned — lock it in 🎉</p>
      <div className="plan__cta-btns">
        <IonButton
          href={flightsUrl(destinationName, dates)}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="book-flights"
        >
          <IonIcon icon={airplaneOutline} slot="start" aria-hidden="true" />
          Book flights
        </IonButton>
        <IonButton
          fill="outline"
          href={hotelsUrl(destinationName, dates)}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="book-hotels"
        >
          <IonIcon icon={bedOutline} slot="start" aria-hidden="true" />
          Find hotels
        </IonButton>
      </div>
    </div>
  );
}
