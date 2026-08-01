import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { LoadState } from '../shell/LoadState';
import { useTripPage } from './useTripPage';
import { useJoinTrip } from './useJoinTrip';
import { Roster } from './Roster';
import { DestinationsPanel } from '../destinations/DestinationsPanel';
import { AvailabilityPanel } from '../availability/AvailabilityPanel';
import './trip.css';

// Open the calendar on the current month. Computed here (not in tested logic) so
// the pure calendar helpers stay deterministic.
const now = new Date();
const START_MONTH = { year: now.getFullYear(), month: now.getMonth() + 1 };

/** A single trip at travel.jpc.io/<slug>. Opens or creates the trip, shows its
 * title + collaborative roster, and lets anyone join by name. Destinations,
 * activities, imagery, dates and budget hang off this page in later slices. */
export function TripPage() {
  const { slug, trip, members, isLoading, isError, refetch } = useTripPage();
  const join = useJoinTrip(slug, trip?.id, members);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>{trip?.title ?? 'Trip'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <LoadState isLoading={isLoading} isError={isError} onRetry={refetch}>
          <div className="trip">
            <p className="tv-kicker">travel.jpc.io/{slug}</p>
            <h1 className="tv-heading trip__title" data-testid="trip-title">
              {trip?.title}
            </h1>
            {trip?.description && <p className="tv-muted">{trip.description}</p>}
            <Roster
              members={members}
              me={join.me}
              onJoin={join.join}
              onPick={join.pick}
              isJoining={join.isJoining}
            />
            <DestinationsPanel tripId={trip?.id} tripTitle={trip?.title ?? ''} me={join.me} />
            <AvailabilityPanel tripId={trip?.id} me={join.me} start={START_MONTH} />
          </div>
        </LoadState>
      </IonContent>
    </IonPage>
  );
}
