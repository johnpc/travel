import type { ReactNode } from 'react';
import type { DestinationRecord } from '../../lib/dataClient';
import { DestinationCard } from './DestinationCard';

interface DestinationListProps {
  destinations: DestinationRecord[];
  tripId: string | undefined;
  /** The winning destination's id — badged as the front-runner (null = no clear
   * leader yet, e.g. an unvoted trip). */
  frontRunnerId?: string | null;
  /** Optional per-destination vote control (interest slice). */
  renderVote?: (destination: DestinationRecord) => ReactNode;
}

/** The trip's brainstorm board: each candidate destination as a card, with an
 * optional vote control and an expandable activities section under each. The
 * front-runner card wears a badge so the group's leader is obvious. */
export function DestinationList({
  destinations,
  tripId,
  frontRunnerId,
  renderVote,
}: DestinationListProps) {
  return (
    <ul className="dest-list" data-testid="dest-list">
      {destinations.map((d) => (
        <DestinationCard
          key={d.id}
          destination={d}
          tripId={tripId}
          isFrontRunner={d.id === frontRunnerId}
          vote={renderVote?.(d)}
        />
      ))}
    </ul>
  );
}
