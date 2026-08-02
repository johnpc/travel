import { useDestinations } from '../destinations/destinationApi';
import { WelcomeJoin } from './WelcomeJoin';
import './joinBar.css';

interface JoinBarProps {
  tripId: string | undefined;
  /** Whether the current visitor has picked their name yet. */
  hasIdentity: boolean;
  onJoin: (name: string) => void;
  isJoining: boolean;
}

/** A compact "add your name" bar near the top for a visitor who hasn't joined a
 * trip that ALREADY has content — the welcome banner (with its inline join) only
 * shows on an empty trip, so a friend arriving to an active trip would otherwise
 * have to scroll ~3 screens to the roster to identify themselves. Mutually
 * exclusive with TripWelcome: shown only when there IS a destination. */
export function JoinBar({ tripId, hasIdentity, onJoin, isJoining }: JoinBarProps) {
  const { data: destinations, isLoading } = useDestinations(tripId);
  // Only once we know the trip is non-empty, and only for a nameless visitor.
  if (hasIdentity || isLoading || (destinations?.length ?? 0) === 0) return null;
  return (
    <section className="joinbar" data-testid="join-bar">
      <p className="joinbar__lead">
        <strong>Joining the crew?</strong> Add your name so your votes count.
      </p>
      <WelcomeJoin onJoin={onJoin} isJoining={isJoining} />
    </section>
  );
}
