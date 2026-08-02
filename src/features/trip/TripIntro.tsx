import type { TripRecord } from '../../lib/dataClient';
import { TripWelcome } from './TripWelcome';
import { JoinBar } from './JoinBar';

interface TripIntroProps {
  slug: string;
  trip: TripRecord | null | undefined;
  me: string | null;
  onJoin: (name: string) => void;
  isJoining: boolean;
}

/** The top of the trip page: URL kicker + title + description, then the
 * onboarding affordances — the welcome banner (empty trips) or the join bar
 * (active trips) for a visitor who hasn't picked a name yet. */
export function TripIntro({ slug, trip, me, onJoin, isJoining }: TripIntroProps) {
  return (
    <>
      <p className="tv-kicker">travel.jpc.io/{slug}</p>
      <h1 className="tv-heading trip__title" data-testid="trip-title">
        {trip?.title}
      </h1>
      {trip?.description && <p className="tv-muted">{trip.description}</p>}
      <TripWelcome tripId={trip?.id} hasIdentity={!!me} onJoin={onJoin} isJoining={isJoining} />
      <JoinBar tripId={trip?.id} hasIdentity={!!me} onJoin={onJoin} isJoining={isJoining} />
    </>
  );
}
