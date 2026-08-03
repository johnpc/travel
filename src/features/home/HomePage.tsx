import { IonContent, IonInput, IonPage, IonButton, IonText } from '@ionic/react';
import { useStartTrip } from './useStartTrip';
import { useRecents } from './useRecents';
import { RecentTrips } from './RecentTrips';
import { ThemeToggle } from '../theme/ThemeToggle';
import './home.css';

/** Landing screen: a wanderlust hero over the app's banner, with one focused
 * action — name a trip to start (or reopen) it at travel.jpc.io/<slug>. No
 * account; the URL is the whole identity of a trip. */
export function HomePage() {
  const { name, setName, slug, canStart, start } = useStartTrip();
  const { recents, remove } = useRecents();
  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="home-hero">
          <div className="home-hero__scrim" />
          <div className="home-hero__toolbar">
            <ThemeToggle />
          </div>
          <div className="home-hero__content">
            <p className="home-hero__brand">✈ Travel</p>
            <h1 className="home-hero__title">Plan the trip your group actually takes.</h1>
            <p className="home-hero__lede">
              Name a trip, share one link, and everyone brainstorms destinations, votes, and finds
              dates that work — then you book it. No sign-up.
            </p>
            <form
              className="home-hero__form"
              data-testid="start-form"
              onSubmit={(e) => {
                e.preventDefault();
                start();
              }}
            >
              <IonInput
                className="home-hero__input"
                fill="outline"
                label="Name your trip"
                labelPlacement="stacked"
                placeholder="e.g. Portugal with the crew"
                value={name}
                data-testid="trip-name"
                onIonInput={(e) => setName(e.detail.value ?? '')}
              />
              <IonButton type="submit" expand="block" disabled={!canStart} data-testid="start-trip">
                Start planning →
              </IonButton>
              {slug && (
                <IonText className="home-hero__preview" data-testid="slug-preview">
                  travel.jpc.io/{slug}
                </IonText>
              )}
            </form>
            <RecentTrips recents={recents} onRemove={remove} />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}
