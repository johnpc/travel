import { IonIcon } from '@ionic/react';
import { peopleOutline, sparklesOutline, calendarOutline } from 'ionicons/icons';
import { useDestinations } from '../destinations/destinationApi';
import './tripWelcome.css';

interface TripWelcomeProps {
  tripId: string | undefined;
  /** Whether the current visitor has picked their name yet. */
  hasIdentity: boolean;
}

const STEPS = [
  { icon: peopleOutline, text: 'Add your name so your votes count' },
  { icon: sparklesOutline, text: 'Add places you’re dreaming of — or let AI suggest some' },
  { icon: calendarOutline, text: 'Everyone votes and marks free dates — the plan takes shape' },
];

/** A warm orientation banner for a brand-new trip (no destinations yet). Shows a
 * first-timer, who just opened a shared link, what this is and the first steps —
 * then disappears once the board has any destination. */
export function TripWelcome({ tripId, hasIdentity }: TripWelcomeProps) {
  const { data: destinations, isLoading } = useDestinations(tripId);
  // Only for a genuinely empty, loaded trip — never flash during load or once
  // there's a destination.
  if (isLoading || (destinations?.length ?? 0) > 0) return null;
  return (
    <section className="welcome" data-testid="trip-welcome">
      <p className="tv-kicker">Welcome — this is your shared trip board</p>
      <h2 className="welcome__title tv-serif">Get your crew aligned, then book it.</h2>
      <ol className="welcome__steps">
        {STEPS.map((s, i) => (
          <li
            key={i}
            className={
              i === 0 && !hasIdentity ? 'welcome__step welcome__step--now' : 'welcome__step'
            }
          >
            <IonIcon icon={s.icon} aria-hidden="true" />
            <span>{s.text}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
