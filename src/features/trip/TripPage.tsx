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
import { TripPlan } from '../plan/TripPlan';
import { ShareButton } from '../plan/ShareButton';
import { ThemeToggle } from '../theme/ThemeToggle';
import { TripLoading } from './TripLoading';
import { TripIntro } from './TripIntro';
import { SectionNav } from './SectionNav';
import { TripColumns } from './TripColumns';
import './trip.css';

// Open the calendar on the current month. Computed here (not in tested logic) so
// the pure calendar helpers stay deterministic.
const now = new Date();
const START_MONTH = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };

/** A single trip at travel.jpc.io/<slug>. Opens or creates the trip, shows its
 * title + collaborative roster, and lets anyone join by name. Destinations,
 * activities, imagery, dates and budget hang off this page in later slices. */
export function TripPage() {
  const { slug, trip, members, isLoading, isError, refetch } = useTripPage();
  const join = useJoinTrip(slug, trip?.id, members);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="trip__toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" text="" />
          </IonButtons>
          <IonTitle>{trip?.title ?? 'Trip'}</IonTitle>
          <IonButtons slot="end">
            <ThemeToggle />
            {trip && <ShareButton slug={slug} />}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <LoadState
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          skeleton={<TripLoading />}
        >
          <div className="trip">
            <TripIntro
              slug={slug}
              trip={trip}
              me={join.me}
              onJoin={join.join}
              isJoining={join.isJoining}
            />
            <TripPlan tripId={trip?.id} memberCount={members.length} />
            <SectionNav />
            <TripColumns trip={trip} members={members} join={join} start={START_MONTH} />
          </div>
        </LoadState>
      </IonContent>
    </IonPage>
  );
}
