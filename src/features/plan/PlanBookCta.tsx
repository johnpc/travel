import { IonButton, IonIcon } from '@ionic/react';
import { airplaneOutline, bedOutline } from 'ionicons/icons';
import { flightsUrl, hotelsUrl } from './planCrew';

interface PlanBookCtaProps {
  destinationName: string;
}

/** The "lock it in" call-to-action: once the plan is settled, book the flights
 * and hotels. Links to real flight/stay searches for the destination. */
export function PlanBookCta({ destinationName }: PlanBookCtaProps) {
  return (
    <div className="plan__cta" data-testid="plan-book">
      <p className="plan__cta-label">You're aligned — lock it in 🎉</p>
      <div className="plan__cta-btns">
        <IonButton
          href={flightsUrl(destinationName)}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="book-flights"
        >
          <IonIcon icon={airplaneOutline} slot="start" aria-hidden="true" />
          Book flights
        </IonButton>
        <IonButton
          fill="outline"
          href={hotelsUrl(destinationName)}
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
