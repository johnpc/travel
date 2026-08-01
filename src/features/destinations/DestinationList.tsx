import type { ReactNode } from 'react';
import type { DestinationRecord } from '../../lib/dataClient';
import { DestinationCard } from './DestinationCard';

interface DestinationListProps {
  destinations: DestinationRecord[];
  /** Optional per-destination vote control (interest slice). */
  renderVote?: (destination: DestinationRecord) => ReactNode;
}

/** The trip's brainstorm board: each candidate destination as a card, with an
 * optional vote control under each. */
export function DestinationList({ destinations, renderVote }: DestinationListProps) {
  return (
    <ul className="dest-list" data-testid="dest-list">
      {destinations.map((d) => (
        <DestinationCard key={d.id} destination={d} vote={renderVote?.(d)} />
      ))}
    </ul>
  );
}
