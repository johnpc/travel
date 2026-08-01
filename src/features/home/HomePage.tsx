import {
  IonContent,
  IonHeader,
  IonInput,
  IonPage,
  IonButton,
  IonTitle,
  IonToolbar,
  IonText,
} from '@ionic/react';
import { useStartTrip } from './useStartTrip';
import './home.css';

/** Landing screen: name a trip to start (or reopen) it at travel.jpc.io/<slug>.
 * No account — the URL is the whole identity of a trip. */
export function HomePage() {
  const { name, setName, slug, canStart, start } = useStartTrip();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Travel</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="home">
          <p className="tv-kicker">Plan together</p>
          <h1 className="tv-heading home__title">Brainstorm a trip with your crew</h1>
          <p className="tv-muted home__lede">
            Name a trip and share the link. Everyone with the URL can add destinations, vote on
            ideas, and sort out dates and budget — no sign-up.
          </p>
          <form
            className="home__form"
            data-testid="start-form"
            onSubmit={(e) => {
              e.preventDefault();
              start();
            }}
          >
            <IonInput
              label="Trip name"
              labelPlacement="stacked"
              placeholder="Greece 2027"
              value={name}
              data-testid="trip-name"
              onIonInput={(e) => setName(e.detail.value ?? '')}
            />
            {slug && (
              <IonText className="tv-muted home__preview" data-testid="slug-preview">
                travel.jpc.io/{slug}
              </IonText>
            )}
            <IonButton type="submit" expand="block" disabled={!canStart} data-testid="start-trip">
              Start planning
            </IonButton>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
}
